import React, { useState, useRef, useEffect, useCallback } from 'react';
import ListingCard from '../components/ListingCard';
import ListingDetails from '../components/ListingDetails';
import MapView from '../components/MapView';
import { searchListings } from '../services/listings';
import { parseUserUtterance } from '../services/gemini';
import { ApartmentSearchFilters, Listing } from '../types';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from '@google/genai';
import TenantAuth from '../components/tenant/Auth';
import Profile from '../components/tenant/Profile';
import { supabase } from '../services/supabase';
import '../src/audio-bars.css';

// --- Audio Helpers ---

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

// Robust downsampler to ensure 16kHz input for Gemini
function downsampleBuffer(buffer: Float32Array, inputRate: number, outputRate: number): Float32Array {
  if (outputRate === inputRate) {
      return buffer;
  }
  const sampleRateRatio = inputRate / outputRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;
  
  while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      // Simple averaging for downsampling (prevents aliasing better than skipping)
      let accum = 0, count = 0;
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
          accum += buffer[i];
          count++;
      }
      result[offsetResult] = count > 0 ? accum / count : 0;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

// --- Tool Definition ---
const updateFiltersTool: FunctionDeclaration = {
  name: 'updateSearchFilters',
  description: 'Update the apartment search filters based on user request and return the number of listings found. This is how you execute the search.',
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

type ViewState = 'explore' | 'nearby' | 'favorites' | 'profile';

// --- System Prompt ---
const HOMIE_SYSTEM_PROMPT = `
[SYSTEM PROMPT – “HOMIE” – Eburon Estate VOICE ASSISTANT (BELGIUM ONLY)]

ROLE & IDENTITY

You are **Homie**, a real estate voice assistant living inside **Eburon Estate** (formerly Match-It Home).
Your ONLY focus:
- Help users **find, understand, and shortlist** homes and properties in **Belgium**.
- You do NOT conduct job interviews.  
- You do NOT act as an HR or hiring assistant.  
- You are a **real estate guide**.

You assist with:
- Searching for **houses, apartments, studios, investment properties**.
- Clarifying needs and turning vague wishes into **clear search filters**.
- Guiding users through next steps: viewing details, saving properties, booking visits, or contacting agents/owners.

CONVERSATION FLOW
1) Warm Greeting  
2) Clarify Purpose (buy/rent/invest/explore)  
3) Discovery: Understand Needs & Constraints  
4) Translate Wishes → Search Filters (USE THE TOOL 'updateSearchFilters')
5) Suggest Matches / Directions  
6) Refine & Adjust Filters  

USE THE 'updateSearchFilters' TOOL WHENEVER THE USER EXPRESSES A PREFERENCE FOR PRICE, LOCATION, TYPE, OR SIZE. 
After using the tool, tell the user how many homes you found and ask if they want to see the first one.
`;

import { Download, Save, Trash2, X, AlertCircle, Loader2 } from 'lucide-react'; // Ensure Loader2 is imported if not already available in lucide-react imports above or add separate import

const ClientPortal: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('explore');
  const [isMapView, setIsMapView] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isNavigatingToAdmin, setIsNavigatingToAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);

  // --- State for Homes ---
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [filters, setFilters] = useState<ApartmentSearchFilters>({ sortBy: 'default' });
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [assistantReply, setAssistantReply] = useState("Hi! I'm Homie. Tap the mic to find your place.");
  const [searchQuery, setSearchQuery] = useState('');
  
  // Live API State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [volume, setVolume] = useState(0);
  
  // Floating mic state (for desktop)
  const [micPosition, setMicPosition] = useState({ x: window.innerWidth - 120, y: window.innerHeight - 120 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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
    
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
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

  const handleProfileClick = () => {
    if (user) {
      setCurrentView('profile');
    } else {
      setAuthMode('login');
      setShowLogin(true);
    }
  };

  // Floating mic drag handlers
  const handleMicMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - micPosition.x,
      y: e.clientY - micPosition.y
    });
  };

  const handleMicMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setMicPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  }, [isDragging, dragOffset]);

  const handleMicMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMicMouseMove);
      window.addEventListener('mouseup', handleMicMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMicMouseMove);
        window.removeEventListener('mouseup', handleMicMouseUp);
      };
    }
  }, [isDragging, handleMicMouseMove, handleMicMouseUp]);

  const handleLoginSuccess = () => {
    setShowLogin(false);
    setCurrentView('profile');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentView('explore');
  };

  // --- Text Search Handler ---
  const handleTextSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setAssistantReply("Searching...");
    setIsLoadingListings(true);
    
    try {
        // Use gemini-2.5-flash for text understanding
        const response = await parseUserUtterance(searchQuery, filters);
        
        if (response.filters) {
            const newFilters = { ...filters, ...response.filters };
            setFilters(newFilters);
            await loadListings(newFilters);
        }
        
        setAssistantReply(response.assistantReply || `Found listings for "${searchQuery}"`);
    } catch (err) {
        console.error(err);
        setAssistantReply("Sorry, I couldn't understand that.");
        setIsLoadingListings(false);
    }
  };

  // --- Live API Logic ---
  const startLiveSession = async () => {
    try {
      setConnectionStatus('connecting');
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key missing");

      // Initialize Audio Contexts
      // Input: Request 16k, but prepare to handle whatever the browser gives
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      // Output: 24k is standard for Gemini responses
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // Ensure contexts are running (vital for some browsers)
      if (inputAudioContextRef.current.state === 'suspended') await inputAudioContextRef.current.resume();
      if (outputAudioContextRef.current.state === 'suspended') await outputAudioContextRef.current.resume();

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
                
                // Convert Int16 to Float32 [-1, 1]
                for(let i=0; i<dataInt16.length; i++) {
                    channelData[i] = dataInt16[i] / 32768.0;
                }

                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                
                const currentTime = ctx.currentTime;
                // Schedule next chunk seamlessly
                if (nextStartTimeRef.current < currentTime) {
                    nextStartTimeRef.current = currentTime;
                }
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
                
                sourcesRef.current.add(source);
                source.addEventListener('ended', () => sourcesRef.current.delete(source));
                setAssistantReply("Homie is speaking...");
             }

             // 3. Handle Input Transcription
             if (message.serverContent?.inputTranscription) {
                 const transcript = message.serverContent.inputTranscription.text;
                 if (transcript) {
                     setSearchQuery(prev => transcript); // Live update input field
                 }
             }

             // 4. Handle Interruption
             if (message.serverContent?.interrupted) {
                 console.log("Model interrupted");
                 // Stop all currently playing audio sources
                 sourcesRef.current.forEach(s => {
                    try { s.stop(); } catch(e) {}
                 });
                 sourcesRef.current.clear();
                 // Reset time cursor
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
            },
            inputAudioTranscription: {} // Enable transcription
        }
      };

      const session = await ai.live.connect(config);
      activeSessionRef.current = session;
      setConnectionStatus('connected');
      setIsLiveActive(true);
      setAssistantReply("Listening...");

      // Start Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            channelCount: 1,
            echoCancellation: true,
            autoGainControl: true,
            noiseSuppression: true
          } 
      });
      mediaStreamRef.current = stream;

      if (!inputAudioContextRef.current) return;
      
      const source = inputAudioContextRef.current.createMediaStreamSource(stream);
      // Use 4096 buffer size for balance between latency and performance
      const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
      processorRef.current = scriptProcessor;

      scriptProcessor.onaudioprocess = (e) => {
          if (!activeSessionRef.current) return;

          const inputData = e.inputBuffer.getChannelData(0);
          
          // Volume meter logic
          let sum = 0;
          for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
          setVolume(Math.sqrt(sum / inputData.length));

          // 1. Resample if necessary (e.g. 48k -> 16k)
          // Gemini Live expects 16kHz. If the context is 48k/44.1k, we MUST downsample.
          const currentSampleRate = inputAudioContextRef.current?.sampleRate || 16000;
          const resampledData = downsampleBuffer(inputData, currentSampleRate, 16000);

          // 2. Convert to Int16 PCM
          const l = resampledData.length;
          const int16 = new Int16Array(l);
          for (let i = 0; i < l; i++) {
            // Clamp values to valid Int16 range [-32768, 32767] to prevent wrap-around distortion
            const s = Math.max(-1, Math.min(1, resampledData[i]));
            int16[i] = s < 0 ? s * 32768 : s * 32767;
          }
          
          // 3. Send
          const base64Data = bytesToBase64(new Uint8Array(int16.buffer));
          activeSessionRef.current.sendRealtimeInput({
            media: { mimeType: 'audio/pcm;rate=16000', data: base64Data }
          });
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

  const handleTogglePets = () => {
      const newFilters = { ...filters, petsAllowed: !filters.petsAllowed };
      setFilters(newFilters);
      loadListings(newFilters);
  };

  const handleNearbyClick = () => {
      if (!navigator.geolocation) {
          alert("Geolocation is not supported by your browser");
          return;
      }

      setAssistantReply("Locating you...");
      navigator.geolocation.getCurrentPosition(
          (position) => {
              const { latitude, longitude } = position.coords;
              const newFilters: ApartmentSearchFilters = {
                  ...filters,
                  userLocation: { lat: latitude, lng: longitude },
                  sortBy: 'distance'
              };
              setFilters(newFilters);
              loadListings(newFilters);
              setAssistantReply("Found properties near you.");
          },
          (error) => {
              console.error("Error getting location:", error);
              setAssistantReply("Could not get your location.");
          }
      );
  };

  return (
    <div className="flex flex-col h-screen bg-white relative">


      {/* Main Content Header */}
      <div className="flex-none px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-30">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold font-mono">E</div>
             <span className="font-bold text-xl text-black tracking-tight hidden sm:block">Eburon Estate</span>
          </div>

          {/* Functional Search Bar */}
          <form 
            onSubmit={handleTextSearch}
            className="flex-1 max-w-lg mx-4 flex items-center bg-white border border-slate-200 shadow-sm rounded-full px-4 py-2 hover:shadow-md transition-shadow"
          >
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={filters.city ? `Searching in ${filters.city}...` : "Ask Homie: 'Apartment in Ghent under €900'"}
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400"
              />
              <button 
                type="submit"
                title="Search"
                aria-label="Search"
                className="bg-black p-2 rounded-full text-white hover:bg-black transition-colors"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
              </button>
          </form>

          <div className="flex items-center gap-4">
               {/* Be the Landlord */}
               {/* Be the Landlord */}
               <button
                 onClick={() => {
                    setIsNavigatingToAdmin(true);
                    setTimeout(() => {
                        window.location.href = '/admin';
                    }, 800);
                 }}
                 disabled={isNavigatingToAdmin}
                 className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {isNavigatingToAdmin ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading...</span>
                    </>
                 ) : (
                    <span>Be the Landlord</span>
                 )}
               </button>

               {!user && (
                   <button
                     onClick={() => {
                         setAuthMode('signup');
                         setShowLogin(true);
                     }}
                     className="hidden md:block px-4 py-2 text-sm font-bold text-white bg-black hover:bg-slate-800 rounded-full transition-colors shadow-lg hover:shadow-xl"
                   >
                     Sign Up
                   </button>
               )}

               <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden cursor-pointer" onClick={handleProfileClick}>
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'Guest'}`} alt="User" />
               </div>
          </div>
      </div>

      {/* --- Main Content --- */}
      <div className="flex-grow overflow-hidden relative flex flex-col">
        
        {/* Dynamic Voice Status Bar */}
        <div className={`
             absolute top-0 z-30 w-full flex justify-center pt-4 pointer-events-none transition-all duration-500
             ${isLiveActive ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}
        `}>
             <div className="bg-slate-900 text-white rounded-full px-6 py-3 shadow-xl flex items-center justify-between gap-4 pointer-events-auto">
                <div className="flex items-center gap-3">
                     <div className="flex gap-1 h-4 items-center">
                          {[...Array(4)].map((_, i) => (
                             <div 
                                key={i} 
                                className="audio-bar"
                                style={{ '--bar-height': `${8 + Math.random() * 24 * volume * 5}px` } as React.CSSProperties}
                             ></div>
                          ))}
                     </div>
                     <span className="text-sm font-medium text-slate-200">{assistantReply}</span>
                </div>
                <button onClick={stopLiveSession} title="Stop Session" aria-label="Stop Session" className="bg-slate-700 hover:bg-slate-600 rounded-full p-1.5 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
             </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto relative">
            
            {/* EXPLORE TAB */}
            {currentView === 'explore' && (
                <div className="h-full flex flex-col">
                    {/* Categories - Only show in List view for cleaner map */}
                    {!isMapView && (
                        <div className="flex-none px-6 pt-4 pb-2">
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide border-b border-slate-100 items-center">
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
                                {/* Vertical Separator */}
                                <div className="h-8 w-px bg-slate-200 mx-2"></div>

                                {/* Nearby Filter */}
                                <button 
                                    onClick={handleNearbyClick}
                                    className={`flex flex-col items-center gap-2 min-w-[64px] group transition-opacity ${filters.sortBy === 'distance' ? 'opacity-100 text-black border-b-2 border-black pb-2' : 'opacity-70 hover:opacity-100'}`}
                                >
                                    <div className="text-2xl opacity-60 group-hover:opacity-100 grayscale group-hover:grayscale-0">
                                        📍
                                    </div>
                                    <span className="text-xs font-semibold">Nearby</span>
                                </button>
                                {/* Vertical Separator */}
                                <div className="h-8 w-px bg-slate-200 mx-2"></div>
                                
                                {/* Pets Filter */}
                                <button 
                                    onClick={handleTogglePets}
                                    className={`flex flex-col items-center gap-2 min-w-[64px] group transition-opacity ${filters.petsAllowed ? 'opacity-100 text-black border-b-2 border-black pb-2' : 'opacity-70 hover:opacity-100'}`}
                                >
                                    <div className="text-2xl opacity-60 group-hover:opacity-100 grayscale group-hover:grayscale-0">
                                        🐾
                                    </div>
                                    <span className="text-xs font-semibold">Pets Allowed</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Listings Grid OR Map */}
                    <div className="flex-1 relative">
                        {isMapView ? (
                            <MapView listings={listings} onSelectListing={setSelectedListing} />
                        ) : (
                            <div className="px-6 py-6 max-w-7xl mx-auto">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24">
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
                                                onClick={() => {
                                                    setFilters({ sortBy: 'default' });
                                                    setSearchQuery('');
                                                }}
                                                className="mt-4 text-black underline"
                                            >
                                                Clear filters
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {/* Map Toggle Button (Floating) */}
                        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
                            <button 
                                onClick={() => setIsMapView(!isMapView)}
                                className="bg-slate-900 text-white px-6 py-3 rounded-full font-semibold shadow-xl hover:scale-105 active:scale-95 transition-transform flex items-center gap-2"
                            >
                                {isMapView ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                          <path fillRule="evenodd" d="M3 6a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3v2.25a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm9.75 0a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3v2.25a3 3 0 0 1-3 3h-2.25a3 3 0 0 1-3-3V6ZM3 15.75a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-2.25Zm9.75 0a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3h-2.25a3 3 0 0 1-3-3v-2.25Z" clipRule="evenodd" />
                                        </svg>
                                        Show List
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                          <path fillRule="evenodd" d="M8.161 2.58a1.875 1.875 0 0 1 1.678 0l4.993 2.498c.106.052.23.052.336 0l3.869-1.935A1.875 1.875 0 0 1 21.75 4.82v12.485c0 .71-.401 1.36-1.037 1.677l-4.875 2.437a1.875 1.875 0 0 1-1.676 0l-4.994-2.497a.375.375 0 0 0-.336 0l-3.868 1.935A1.875 1.875 0 0 1 2.25 19.18V6.695c0-.71.401-1.36 1.036-1.677l4.875-2.437ZM9 6a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-1.5 0V6.75A.75.75 0 0 1 9 6Zm6 0a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-1.5 0V6.75A.75.75 0 0 1 15 6Z" clipRule="evenodd" />
                                        </svg>
                                        Show Map
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MY HOME TAB (Favorites) */}
            {currentView === 'favorites' && (
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <h2 className="text-3xl font-bold mb-8">Your Saved Homes</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24">
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

            {/* PROFILE TAB */}
            {currentView === 'profile' && (
                <Profile onLogout={handleLogout} />
            )}

        </div>
      </div>

      {/* --- Details Modal --- */}
      {selectedListing && (
          <ListingDetails listing={selectedListing} onClose={() => setSelectedListing(null)} />
      )}

      {/* --- Login Modal --- */}
        {showLogin && !user && (
          <TenantAuth 
            onLoginSuccess={handleLoginSuccess} 
            onCancel={() => setShowLogin(false)} 
            initialMode={authMode}
          />
        )}

      {/* --- Bottom Navigation --- */}
      <div className="flex-none bg-white border-t border-slate-200 py-3 flex justify-center gap-12 z-20">
          <button 
             onClick={() => { setCurrentView('explore'); setIsMapView(false); }}
             className={`flex flex-col items-center gap-1 ${currentView === 'explore' && !isMapView ? 'text-black' : 'text-slate-400 hover:text-slate-600'}`}
          >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={currentView === 'explore' && !isMapView ? 2.5 : 2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <span className="text-[10px] font-semibold">Explore</span>
          </button>

          <button 
             onClick={() => { setCurrentView('explore'); setIsMapView(true); }}
             className={`flex flex-col items-center gap-1 ${currentView === 'nearby' || isMapView ? 'text-black' : 'text-slate-400 hover:text-slate-600'}`}
          >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={currentView === 'nearby' || isMapView ? 2.5 : 2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              <span className="text-[10px] font-semibold">Map</span>
          </button>

          <button 
             onClick={handleMicClick}
             className={`md:hidden relative -top-6 bg-black hover:bg-black text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 ${connectionStatus === 'connecting' ? 'animate-pulse' : ''}`}
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
             onClick={() => { setCurrentView('favorites'); setIsMapView(false); }}
             className={`flex flex-col items-center gap-1 ${currentView === 'favorites' ? 'text-black' : 'text-slate-400 hover:text-slate-600'}`}
          >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={currentView === 'favorites' ? 2.5 : 2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
              <span className="text-[10px] font-semibold">My Home</span>
          </button>

          <button 
            onClick={handleProfileClick}
            className={`flex flex-col items-center gap-1 ${currentView === 'profile' ? 'text-black' : 'text-slate-600'}`}
            aria-label="Profile"
          >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              <span className="text-[10px] font-semibold">Profile</span>
          </button>
      </div>

      {/* Admin Link - Subtle */}
      <div className="absolute bottom-2 right-4 md:bottom-4 md:right-6">
        <a
          href="/admin"
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          title="Admin Portal"
        >
          Admin
        </a>
      </div>

      {/* Floating Mic Button - Desktop Only */}
      <div
        className="hidden md:block floating-mic z-50"
        style={{
          left: `${micPosition.x}px`,
          top: `${micPosition.y}px`,
        }}
        onMouseDown={handleMicMouseDown}
      >
        <button
          onClick={() => isLiveActive ? stopLiveSession() : startLiveSession()}
          disabled={connectionStatus === 'connecting'}
          className={`
            relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-100 ease-out
            ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
            ${isLiveActive 
              ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_30px_rgba(168,85,247,0.6)]' 
              : connectionStatus === 'connecting'
                ? 'bg-slate-400'
                : 'bg-black hover:shadow-xl hover:scale-110'
            }
          `}
          style={{
             transform: isLiveActive ? `scale(${1 + Math.min(volume * 2, 0.5)})` : 'scale(1)'
          }}
          title={isLiveActive ? 'Stop Assistant' : 'Start Voice Assistant'}
          aria-label={isLiveActive ? 'Stop Assistant' : 'Start Voice Assistant'}
        >
          {/* Inner Glow for Orb Effect */}
          {isLiveActive && (
              <div className="absolute inset-0 rounded-full bg-white opacity-20 blur-sm animate-pulse"></div>
          )}

          {connectionStatus === 'connecting' ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg
              className={`w-8 h-8 text-white relative z-10 transition-transform ${isLiveActive ? 'scale-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default ClientPortal;
