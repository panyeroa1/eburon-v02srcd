import React, { useState, useRef, useEffect, useCallback } from 'react';
import ListingCard from './components/ListingCard';
import ListingDetails from './components/ListingDetails';
import { searchListings } from './services/mockDb';
import { createAudioContext } from './services/gemini';
import { ApartmentSearchFilters, Listing } from './types';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from '@google/genai';

// --- Helpers ---
function base64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// --- Tool Definition ---
const updateFiltersTool: FunctionDeclaration = {
  name: 'updateSearchFilters',
  description: 'Update the apartment search filters based on user request and return the number of listings found.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      city: { type: Type.STRING, description: 'City name (e.g. Ghent, Brussels, Antwerp)' },
      minPrice: { type: Type.NUMBER, description: 'Minimum price in Euros' },
      maxPrice: { type: Type.NUMBER, description: 'Maximum price in Euros' },
      minSize: { type: Type.NUMBER, description: 'Minimum size in square meters' },
      bedrooms: { type: Type.NUMBER, description: 'Number of bedrooms' },
      petsAllowed: { type: Type.BOOLEAN, description: 'Whether pets are required' },
      type: { type: Type.STRING, enum: ['apartment', 'house', 'studio', 'villa'], description: 'Type of property' },
      sortBy: { type: Type.STRING, enum: ["price_asc", "price_desc", "size", "default"] }
    },
  },
};

type ViewState = 'explore' | 'nearby' | 'favorites';

// --- System Prompt ---
const HOMIE_SYSTEM_PROMPT = `
[SYSTEM PROMPT – “HOMIE” – MATCH-IT HOME REAL ESTATE VOICE ASSISTANT (BELGIUM ONLY)]

ROLE & IDENTITY

You are **Homie**, a real estate voice assistant living inside **Match-It Home**, the property search experience of the Match-It platform, powered by **Eburon**.

Your ONLY focus:
- Help users **find, understand, and shortlist** homes and properties in **Belgium**.
- You do NOT conduct job interviews.  
- You do NOT act as an HR or hiring assistant.  
- You are a **real estate guide**, not a recruiter.

You assist with:
- Searching for **houses, apartments, studios, investment properties**.
- Clarifying needs and turning vague wishes into **clear search filters**.
- Guiding users through next steps: viewing details, saving properties, booking visits, or contacting agents/owners.

You are NOT:
- A financial advisor.
- A lawyer or notary.
- A tax expert.
You never guarantee mortgage approval, legal outcomes, or investment returns. You give **practical, high-level guidance** and always encourage users to confirm details with qualified professionals.

LANGUAGE & VOICE STYLE (HUMAN IMPERFECTIONS)

Your voice persona:
- Warm, slightly **breathy**, near-field, like a friendly assistant speaking close to a headset mic.
- Neutral but slightly influenced by **Dutch/Flemish** rhythm when speaking English (in tone, not spelling).
- Calm, patient, and clear.

Language behavior:
- Automatically detect and mirror the user’s language (Dutch/Flemish, French, English; others if possible).
- Match their tone (more formal vs casual) but always remain respectful and professional.
- If the user switches language, you follow smoothly.

Human imperfections (use subtly, not constantly):
- Occasional fillers: "uhm," "ah," "okay," "right," "mm-hm."
- Light repetition when thinking: "So, so just to be clear…"
- Soft self-corrections: "You said Ghent—uh, sorry, Antwerp, right?"
- Rare micro-sounds: "[soft cough] Sorry. Okay, let’s continue."

CONTEXT: MATCH-IT HOME VS MAIN MATCH-IT

Match-It (main platform): Works with **AI-powered matching** for jobs and talent.
Match-It Home: The **real estate** branch, where you live.

Do NOT:
- Talk about job interviews, CVs, or hiring funnels.
- Ask HR-style competency questions.
You stay fully in the domain of **property search and guidance**.

CONVERSATION FLOW (NO INTERVIEWING – PURE PROPERTY SUPPORT)

1) Warm Greeting  
2) Clarify Purpose (buy/rent/invest/explore)  
3) Discovery: Understand Needs & Constraints  
4) Translate Wishes → Search Filters (USE THE TOOL 'updateSearchFilters')
5) Suggest Matches / Directions  
6) Refine & Adjust Filters  

USE THE 'updateSearchFilters' TOOL WHENEVER THE USER EXPRESSES A PREFERENCE FOR PRICE, LOCATION, TYPE, OR SIZE.
`;

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('explore');

  // --- State for Homes ---
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [filters, setFilters] = useState<ApartmentSearchFilters>({ sortBy: 'default' });
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [assistantReply, setAssistantReply] = useState("Hi! I'm Homie. Tap the mic to find your place.");
  
  // Live API State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [volume, setVolume] = useState(0);

  // --- Refs ---
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const activeSessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const filtersRef = useRef(filters); 

  // --- Effects ---
  useEffect(() => {
    loadListings(filters);
  }, []);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const loadListings = async (currentFilters: ApartmentSearchFilters) => {
    setIsLoadingListings(true);
    try {
        const results = await searchListings(currentFilters);
        setListings(results);
        return results;
    } finally {
        setIsLoadingListings(false);
    }
  };

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setListings(prev => prev.map(l => l.id === id ? { ...l, isFavorite: !l.isFavorite } : l));
  };

  // --- Live API Logic ---
  const startLiveSession = async () => {
    try {
      setConnectionStatus('connecting');
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key missing");

      inputAudioContextRef.current = createAudioContext(16000);
      outputAudioContextRef.current = createAudioContext(24000);
      await inputAudioContextRef.current.resume();
      await outputAudioContextRef.current.resume();

      const ai = new GoogleGenAI({ apiKey });

      const config = {
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
             console.log('Session Opened');
          },
          onmessage: async (message: LiveServerMessage) => {
             // 1. Handle Tools
             if (message.toolCall) {
                const functionResponses: any[] = [];
                for (const fc of message.toolCall.functionCalls) {
                   if (fc.name === 'updateSearchFilters') {
                      const args = fc.args as any;
                      console.log("Homie Filter Update:", args);
                      
                      const newFilters = { ...filtersRef.current, ...args };
                      setFilters(newFilters);
                      const results = await loadListings(newFilters);
                      
                      functionResponses.push({
                        id: fc.id,
                        name: fc.name,
                        response: { result: `Filters updated. Found ${results.length} properties matching criteria.` }
                      });
                   }
                }
                
                if (functionResponses.length > 0 && activeSessionRef.current) {
                    activeSessionRef.current.sendToolResponse({ functionResponses });
                }
             }

             // 2. Handle Audio Output
             const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (base64Audio && outputAudioContextRef.current) {
                const ctx = outputAudioContextRef.current;
                const bytes = base64ToBytes(base64Audio);
                const dataInt16 = new Int16Array(bytes.buffer);
                const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
                const channelData = buffer.getChannelData(0);
                for(let i=0; i<dataInt16.length; i++) {
                    channelData[i] = dataInt16[i] / 32768.0;
                }

                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                
                const currentTime = ctx.currentTime;
                if (nextStartTimeRef.current < currentTime) nextStartTimeRef.current = currentTime;
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
                
                sourcesRef.current.add(source);
                source.addEventListener('ended', () => sourcesRef.current.delete(source));
                setAssistantReply("Homie is speaking...");
             }

             if (message.serverContent?.interrupted) {
                 sourcesRef.current.forEach(s => s.stop());
                 sourcesRef.current.clear();
                 nextStartTimeRef.current = 0;
             }
          },
          onclose: () => {
             cleanupAudio();
             setIsLiveActive(false);
             setConnectionStatus('idle');
             setAssistantReply("Session ended.");
          },
          onerror: (err: any) => {
             console.error("Live Error", err);
             cleanupAudio();
             setIsLiveActive(false);
             setConnectionStatus('error');
             setAssistantReply("Connection lost.");
          }
        },
        config: {
            responseModalities: [Modality.AUDIO],
            tools: [{ functionDeclarations: [updateFiltersTool] }],
            systemInstruction: HOMIE_SYSTEM_PROMPT,
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } } 
            }
        }
      };

      const session = await ai.live.connect(config);
      activeSessionRef.current = session;
      setConnectionStatus('connected');
      setIsLiveActive(true);
      setAssistantReply("Listening...");

      // Start Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      if (!inputAudioContextRef.current) return;
      const source = inputAudioContextRef.current.createMediaStreamSource(stream);
      const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
      processorRef.current = scriptProcessor;

      scriptProcessor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          // Volume meter
          let sum = 0;
          for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
          setVolume(Math.sqrt(sum / inputData.length));

          const l = inputData.length;
          const int16 = new Int16Array(l);
          for (let i = 0; i < l; i++) {
            int16[i] = inputData[i] * 32768;
          }
          
          if (activeSessionRef.current) {
              const base64Data = bytesToBase64(new Uint8Array(int16.buffer));
              activeSessionRef.current.sendRealtimeInput({
                media: { mimeType: 'audio/pcm;rate=16000', data: base64Data }
              });
          }
      };

      source.connect(scriptProcessor);
      scriptProcessor.connect(inputAudioContextRef.current.destination);

    } catch (e) {
      console.error(e);
      setConnectionStatus('error');
      setAssistantReply("Could not connect.");
    }
  };

  const cleanupAudio = () => {
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current.onaudioprocess = null;
        processorRef.current = null;
    }
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
    }
    if (inputAudioContextRef.current) {
        inputAudioContextRef.current.close();
        inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
        outputAudioContextRef.current.close();
        outputAudioContextRef.current = null;
    }
    activeSessionRef.current = null;
  };

  const handleMicClick = () => {
     if (isLiveActive) stopLiveSession();
     else startLiveSession();
  };

  const stopLiveSession = useCallback(() => {
    cleanupAudio();
    setIsLiveActive(false);
    setConnectionStatus('idle');
    setVolume(0);
    setAssistantReply("Ready to help.");
  }, []);

  return (
    <div className="h-screen bg-white flex flex-col font-sans text-slate-900 overflow-hidden">
      
      {/* --- Top Search & Nav Bar --- */}
      <div className="flex-none px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-20">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white font-bold">H</div>
             <span className="font-bold text-xl text-rose-500 tracking-tight">Homie</span>
          </div>

          {/* Desktop Search Filters (Visual Only for now, updated by voice) */}
          <div className="hidden md:flex items-center bg-white border border-slate-200 shadow-sm rounded-full px-4 py-2.5 divide-x divide-slate-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="px-4 text-sm font-medium">{filters.city || 'Anywhere in Belgium'}</div>
              <div className="px-4 text-sm font-medium">{filters.type || 'Any type'}</div>
              <div className="px-4 text-sm text-slate-500 font-light">
                  {filters.maxPrice ? `Up to €${filters.maxPrice}` : 'Add budget'}
              </div>
              <div className="pl-4">
                  <div className="bg-rose-500 p-2 rounded-full text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                      </svg>
                  </div>
              </div>
          </div>

          <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
               </div>
          </div>
      </div>

      {/* --- Main Content --- */}
      <div className="flex-grow overflow-y-auto overflow-x-hidden relative">
        
        {/* Dynamic Voice Status Bar */}
        <div className={`
             sticky top-0 z-10 w-full bg-gradient-to-b from-white via-white/95 to-transparent pt-4 pb-8 px-6 transition-all duration-500
             ${isLiveActive ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0 pointer-events-none absolute'}
        `}>
             <div className="max-w-md mx-auto bg-slate-900 text-white rounded-full px-6 py-3 shadow-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                     <div className="flex gap-1 h-4 items-center">
                          {[...Array(4)].map((_, i) => (
                             <div 
                                key={i} 
                                className="w-1 bg-rose-500 rounded-full transition-all duration-75"
                                style={{ height: `${8 + Math.random() * 24 * volume * 5}px` }}
                             ></div>
                          ))}
                     </div>
                     <span className="text-sm font-medium text-slate-200">{assistantReply}</span>
                </div>
                <button onClick={stopLiveSession} className="bg-slate-700 hover:bg-slate-600 rounded-full p-1.5 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
             </div>
        </div>

        {/* Tab Content */}
        <div className="px-6 pb-24 pt-4">
            
            {/* EXPLORE TAB */}
            {currentView === 'explore' && (
                <div className="max-w-7xl mx-auto">
                    {/* Categories (Visual) */}
                    <div className="flex gap-8 overflow-x-auto pb-6 mb-4 scrollbar-hide border-b border-slate-100">
                        {['Apartment', 'House', 'Studio', 'Villa', 'Loft'].map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setFilters({ ...filters, type: cat.toLowerCase() })}
                                className={`flex flex-col items-center gap-2 min-w-[64px] group opacity-70 hover:opacity-100 transition-opacity ${filters.type?.includes(cat.toLowerCase()) ? 'opacity-100 text-black border-b-2 border-black pb-2' : ''}`}
                            >
                                <div className="text-2xl opacity-60 group-hover:opacity-100 grayscale group-hover:grayscale-0">
                                   {cat === 'Apartment' && '🏢'}
                                   {cat === 'House' && '🏡'}
                                   {cat === 'Studio' && '🛋️'}
                                   {cat === 'Villa' && '🏖️'}
                                   {cat === 'Loft' && '🏙️'}
                                </div>
                                <span className="text-xs font-semibold">{cat}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {isLoadingListings ? (
                            [...Array(8)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-slate-200 rounded-xl aspect-square mb-2"></div>
                                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-1"></div>
                                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                                </div>
                            ))
                        ) : listings.length > 0 ? (
                            listings.map(l => (
                                <ListingCard 
                                    key={l.id} 
                                    listing={l} 
                                    onClick={setSelectedListing} 
                                    onToggleFavorite={toggleFavorite}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 text-slate-400">
                                <p className="text-lg">No homes found matching these filters.</p>
                                <button 
                                    onClick={() => setFilters({ sortBy: 'default' })}
                                    className="mt-4 text-rose-500 underline"
                                >
                                    Clear filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* NEARBY TAB (Map Placeholder) */}
            {currentView === 'nearby' && (
                <div className="h-[70vh] w-full rounded-2xl bg-slate-100 flex items-center justify-center relative overflow-hidden border border-slate-200">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/Brussels_street_map.png')] bg-cover bg-center"></div>
                    <div className="z-10 bg-white p-6 rounded-2xl shadow-xl max-w-sm text-center">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold mb-2">Searching Nearby</h2>
                        <p className="text-slate-500 mb-4">Homie is scanning listings around your simulated location in Brussels.</p>
                        <button onClick={() => setCurrentView('explore')} className="text-rose-600 font-semibold hover:underline">
                            Back to List
                        </button>
                    </div>
                </div>
            )}

            {/* MY HOME TAB (Favorites) */}
            {currentView === 'favorites' && (
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold mb-8">Your Saved Homes</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                         {listings.filter(l => l.isFavorite).length > 0 ? (
                             listings.filter(l => l.isFavorite).map(l => (
                                <ListingCard 
                                    key={l.id} 
                                    listing={l} 
                                    onClick={setSelectedListing} 
                                    onToggleFavorite={toggleFavorite}
                                />
                             ))
                         ) : (
                             <div className="col-span-full py-12 flex flex-col items-center text-slate-400">
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24 mb-4 opacity-50">
                                     <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                 </svg>
                                 <p>No favorites yet. Start exploring!</p>
                             </div>
                         )}
                    </div>
                </div>
            )}

        </div>
      </div>

      {/* --- Details Modal --- */}
      {selectedListing && (
          <ListingDetails listing={selectedListing} onClose={() => setSelectedListing(null)} />
      )}

      {/* --- Bottom Navigation --- */}
      <div className="flex-none bg-white border-t border-slate-200 py-3 flex justify-center gap-12 z-20">
          <button 
             onClick={() => setCurrentView('explore')}
             className={`flex flex-col items-center gap-1 ${currentView === 'explore' ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'}`}
          >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={currentView === 'explore' ? 2.5 : 2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <span className="text-[10px] font-semibold">Explore</span>
          </button>

          <button 
             onClick={() => setCurrentView('nearby')}
             className={`flex flex-col items-center gap-1 ${currentView === 'nearby' ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'}`}
          >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={currentView === 'nearby' ? 2.5 : 2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              <span className="text-[10px] font-semibold">Nearby</span>
          </button>

          <button 
             onClick={handleMicClick}
             className={`relative -top-6 bg-rose-500 hover:bg-rose-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 ${connectionStatus === 'connecting' ? 'animate-pulse' : ''}`}
          >
             {isLiveActive ? (
                 <div className="w-6 h-6 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded animate-ping"></div>
                 </div>
             ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
             )}
          </button>

          <button 
             onClick={() => setCurrentView('favorites')}
             className={`flex flex-col items-center gap-1 ${currentView === 'favorites' ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'}`}
          >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={currentView === 'favorites' ? 2.5 : 2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
              <span className="text-[10px] font-semibold">My Home</span>
          </button>

          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              <span className="text-[10px] font-semibold">Profile</span>
          </button>
      </div>

    </div>
  );
};

export default App;
