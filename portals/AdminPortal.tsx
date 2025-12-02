
import React, { useState, useEffect } from 'react';
import { User, Lead, Property, CallState, AudioVolume, Recording } from '../types-admin';
import { MOCK_LEADS, MOCK_PROPERTIES } from '../constants-admin';
import { db } from '../services/admin/db';
import { geminiClient } from '../services/admin/geminiService';
import Auth from '../components/admin-replacement/Auth';
import CRM from '../components/admin-replacement/CRM';
import Dialer from '../components/admin-replacement/Dialer';
import { Play, Check, Trash2 } from 'lucide-react';

const AdminPortal: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  
  // Dialer State
  const [callState, setCallState] = useState<CallState>(CallState.IDLE);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [audioVols, setAudioVols] = useState<AudioVolume>({ input: 0, output: 0 });
  const [isRecording, setIsRecording] = useState(false);
  const [pendingRecording, setPendingRecording] = useState<string | null>(null);
  
  // Mobile Responsiveness
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Initial Data Load
    const loadData = async () => {
      const l = await db.getLeads();
      const p = await db.getProperties();
      setLeads(l.length ? l : MOCK_LEADS);
      setProperties(p.length ? p : MOCK_PROPERTIES);
    };
    loadData();
  }, []);

  // Gemini Client Setup
  useEffect(() => {
    geminiClient.onVolumeChange = (inVol, outVol) => {
        setAudioVols({ input: inVol, output: outVol });
    };
    
    geminiClient.onClose = () => {
        if(callState === CallState.ACTIVE) {
            handleEndCall();
        }
    };

    return () => {
        geminiClient.disconnect();
    };
  }, [callState]);

  const startCall = async (phoneNumber: string) => {
    setCallState(CallState.CONNECTING);
    
    // Find lead if not selected
    if (!activeLead) {
        const found = leads.find(l => l.phone === phoneNumber);
        if (found) setActiveLead(found);
    }

    try {
        await geminiClient.connect();
        setCallState(CallState.ACTIVE);
    } catch (e) {
        console.error("Failed to connect call", e);
        setCallState(CallState.ERROR);
        setTimeout(() => setCallState(CallState.IDLE), 2000);
    }
  };

  const handleEndCall = async () => {
    setCallState(CallState.ENDED);
    geminiClient.disconnect();
    
    if (isRecording) {
        const url = await geminiClient.stopRecording();
        setPendingRecording(url);
        setIsRecording(false);
    } else {
        setTimeout(() => {
            setCallState(CallState.IDLE);
            // Don't clear active lead immediately so user can add notes
        }, 1000);
    }
  };

  const toggleRecording = (recording: boolean) => {
      if (recording) {
          geminiClient.startRecording();
          setIsRecording(true);
      } else {
          // If we stop mid-call, we just save it? For now let's just toggle state
          // Real implementation would handle chunks
          setIsRecording(false); 
      }
  };

  const saveRecording = () => {
      if (pendingRecording && activeLead) {
          const newRecording: Recording = {
              id: Date.now().toString(),
              timestamp: Date.now(),
              duration: 120, // Mock duration for demo
              url: pendingRecording,
              outcome: 'connected'
          };
          
          const updatedLead = {
              ...activeLead,
              recordings: [newRecording, ...activeLead.recordings],
              lastActivity: 'Outbound Call',
              status: 'Contacted' as any
          };
          
          handleUpdateLead(updatedLead);
      }
      setPendingRecording(null);
      setCallState(CallState.IDLE);
  };

  const discardRecording = () => {
      setPendingRecording(null);
      setCallState(CallState.IDLE);
  };

  const handleLeadSelect = (lead: Lead) => {
      setActiveLead(lead);
      // On mobile, selecting a lead might switch to dialer view or details view
      // For this demo, we just set state
  };

  const handleUpdateLead = (updatedLead: Lead) => {
      setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
      if (activeLead?.id === updatedLead.id) {
          setActiveLead(updatedLead);
      }
      db.updateLead(updatedLead);
  };

  if (!currentUser) {
    return <Auth onLogin={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex relative bg-slate-50">
      {/* Desktop CRM Layout */}
      {!isMobile && (
        <div className="flex-1 h-full">
            <CRM 
                leads={leads} 
                properties={properties} 
                onSelectLead={handleLeadSelect}
                selectedLeadId={activeLead?.id || null}
                onUpdateLead={handleUpdateLead}
                currentUser={currentUser}
                onLogout={() => setCurrentUser(null)}
            />
        </div>
      )}

      {/* Phone Overlay / Sidebar */}
      <div className={`
        transition-all duration-500 ease-in-out
        ${isMobile ? 'w-full h-full absolute inset-0 z-50' : 'w-[420px] h-full border-l border-slate-200 bg-white shadow-2xl relative z-40 p-8 flex items-center justify-center'}
      `}>
         {/* Container for the Phone Graphic */}
         <div className={`${isMobile ? 'w-full h-full' : 'w-[360px] h-[720px]'} transition-all`}>
            <Dialer 
                callState={callState}
                onCallStart={startCall}
                onCallEnd={handleEndCall}
                activeLeadName={activeLead ? `${activeLead.firstName} ${activeLead.lastName}` : undefined}
                activeLeadPhone={activeLead?.phone}
                inputVolume={audioVols.input}
                outputVolume={audioVols.output}
                onToggleRecording={toggleRecording}
                isRecording={isRecording}
                leads={leads}
                onLeadSelected={handleLeadSelect}
            />
         </div>
      </div>

      {/* Recording Review Modal */}
      {pendingRecording && (
          <div className="absolute inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Call Recording</h3>
                  <p className="text-slate-500 text-sm mb-6">Review and save the recording for {activeLead?.firstName} {activeLead?.lastName}.</p>
                  
                  <div className="bg-slate-100 rounded-xl p-4 mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <Play className="w-5 h-5 text-indigo-600 ml-0.5" />
                      </div>
                      <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                          <div className="w-1/2 h-full bg-indigo-500"></div>
                      </div>
                      <span className="text-xs font-mono text-slate-500">02:14</span>
                  </div>

                  <div className="flex gap-3">
                      <button 
                        onClick={discardRecording}
                        className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
                      >
                          <Trash2 className="w-4 h-4" /> Discard
                      </button>
                      <button 
                        onClick={saveRecording}
                        className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-colors"
                      >
                          <Check className="w-4 h-4" /> Save to Lead
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminPortal;
