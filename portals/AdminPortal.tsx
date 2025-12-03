

import React, { useState, useEffect, useRef } from 'react';
import Dialer from '../components/admin-final/Dialer';
import CRM from '../components/admin-final/CRM';
import Auth from '../components/admin-final/Auth';
import { Lead, CallState, Recording, User, Property, AgentPersona, UserRole, Task } from '../types-admin-final';
import { geminiClient } from '../services/admin-final/geminiService';
import { blandService } from '../services/admin-final/blandService';
import { Download, Save, Trash2, X, AlertCircle, Loader2, Phone, LayoutDashboard, User as UserIcon, Settings, Menu } from 'lucide-react';
import { db } from '../services/admin-final/db';
import { DEFAULT_AGENT_PERSONA, generateSystemPrompt } from '../constants-admin-final';
import { supabase } from '../supabaseClient';

interface PendingRec {
  url: string;
  duration: number;
  timestamp: number;
}

const AdminPortal: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [callState, setCallState] = useState<CallState>(CallState.IDLE);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [audioVols, setAudioVols] = useState<{in: number, out: number}>({in: 0, out: 0});
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  const [pendingRecording, setPendingRecording] = useState<PendingRec | null>(null);
  const [recordingOutcome, setRecordingOutcome] = useState<'connected' | 'missed' | 'voicemail' | 'follow_up' | 'closed'>('connected');
  
  // Mobile Navigation State
  const [mobileTab, setMobileTab] = useState<'dialer' | 'leads' | 'admin' | 'settings'>('dialer');

  // Track the actual API Call ID
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  
  // Loading state for fetching recording
  const [isFetchingRecording, setIsFetchingRecording] = useState(false);

  // Agent Config State
  const [agents, setAgents] = useState<AgentPersona[]>([]);
  const [agentPersona, setAgentPersona] = useState<AgentPersona>(DEFAULT_AGENT_PERSONA);
  const [crmTab, setCrmTab] = useState<string>('dashboard');

  // Refs for Ringing Logic
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const ringTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Bland AI Monitoring Socket
  const [monitorWs, setMonitorWs] = useState<WebSocket | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userProfile = await db.getUserProfile(session.user.id);
          if (userProfile) {
            setCurrentUser(userProfile);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsCheckingSession(false);
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    
    // Gemini Volume (for Agent Config / Demo mode if used)
    geminiClient.onVolumeChange = (inp, outp) => {
        setAudioVols({ in: inp, out: outp });
    };

    geminiClient.onClose = () => {
        handleEndCall();
    };

    return () => {
        window.removeEventListener('resize', handleResize);
        geminiClient.disconnect();
        if(monitorWs) monitorWs.close();
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
        const fetchData = async () => {
            const [fetchedLeads, fetchedProperties, fetchedTasks, fetchedAgents] = await Promise.all([
                db.getLeads(),
                db.getProperties(),
                db.getTasks(),
                db.getAgents()
            ]);
            setLeads(fetchedLeads);
            setProperties(fetchedProperties);
            setTasks(fetchedTasks);
            
            // Setup agents list and ensure default is present
            let allAgents = fetchedAgents;
            if (fetchedAgents.length === 0) {
                allAgents = [DEFAULT_AGENT_PERSONA];
                // Optionally save default if DB was empty
                db.createAgent(DEFAULT_AGENT_PERSONA);
            }
            setAgents(allAgents);
            setAgentPersona(allAgents[0]); // Default to first agent
        };
        fetchData();
    }
  }, [currentUser]);

  const handleLeadSelect = (lead: Lead | null) => {
    setActiveLead(lead);
    // On mobile, if a lead is selected from the Leads tab, switch to dialer to call them
    if (isMobile && lead) {
        setMobileTab('dialer');
    }
  };

  const handleUpdateLead = async (updatedLead: Lead) => {
    setLeads(prevLeads => prevLeads.map(l => l.id === updatedLead.id ? updatedLead : l));
    if (activeLead && activeLead.id === updatedLead.id) {
        setActiveLead(updatedLead);
    }
    await db.updateLead(updatedLead);
  };

  const handleUpdateTask = async (updatedTask: Task) => {
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
      await db.updateTask(updatedTask);
  };

  // Switch User (Demo Feature)
  const handleSwitchUser = (role: UserRole) => {
      const demoPersonas: Record<UserRole, {name: string, email: string}> = {
          BROKER: { name: 'Laurent De Wilde', email: 'laurent@eburon.com' },
          OWNER: { name: 'Marc Peeters', email: 'marc.peeters@telenet.be' },
          RENTER: { name: 'Sophie Dubois', email: 'sophie.d@example.com' },
          CONTRACTOR: { name: 'Johan Smet', email: 'johan.smet@fixit.be' }
      };

      const persona = demoPersonas[role];
      const newUser: User = {
          id: `demo-${role.toLowerCase()}`,
          name: persona.name,
          email: persona.email,
          role: role,
          avatar: `https://ui-avatars.com/api/?name=${persona.name.replace(' ', '+')}&background=random`
      };
      
      setCurrentUser(newUser);
      setActiveLead(null); // Clear selection when switching
  };

  const handleSelectAgent = (agentId: string) => {
      const selected = agents.find(a => a.id === agentId);
      if (selected) {
          setAgentPersona(selected);
      }
  };

  const startCall = async (number: string) => {
    // 1. Set Ringing State
    setCallState(CallState.RINGING);
    setPendingRecording(null); // Reset prev recording
    
    // 2. Play Ringtone (Non-blocking with robust error handling)
    const ringAudio = new Audio('https://botsrhere.online/deontic/callerpro/ring.mp3');
    ringAudio.loop = true;
    ringtoneRef.current = ringAudio;
    
    // Don't await the play() promise to avoid blocking the call initiation
    // Catch 'AbortError' specifically which happens if we pause() quickly (e.g. user hangs up)
    ringAudio.play().catch(e => {
        if (e.name !== 'AbortError') {
             console.error("Audio play failed", e);
        }
    });

    // 3. Initiate Call via Bland AI Service
    try {
        const result = await blandService.initiateCall(number, agentPersona);
        
        if (result.status === 'success' && result.call_id) {
            console.log("Call Initiated:", result.call_id);
            setCurrentCallId(result.call_id); // Save ID for fetching recording later
            
            // Wait for 9s ring effect to complete or match ring time
            ringTimeoutRef.current = setTimeout(async () => {
                if (ringtoneRef.current) {
                    ringtoneRef.current.pause();
                    ringtoneRef.current = null;
                }
                
                setCallState(CallState.ACTIVE);
                setRecordingStartTime(Date.now()); // Fallback start time
                
                // Attempt to connect to live monitoring stream for visualization
                const wsUrl = await blandService.listenToCall(result.call_id);
                if (wsUrl) {
                    const ws = new WebSocket(wsUrl);
                    ws.onmessage = () => {
                         setAudioVols({ in: Math.random() * 0.5, out: Math.random() * 0.5 });
                    };
                    setMonitorWs(ws);
                }

            }, 9000); 

        } else {
             throw new Error(result.message || "Call failed to start");
        }
    } catch (e) {
        console.error("Failed to connect call", e);
        if (ringtoneRef.current) {
            try {
                ringtoneRef.current.pause();
            } catch (err) { /* ignore cleanup error */ }
            ringtoneRef.current = null;
        }
        setCallState(CallState.ERROR);
        setTimeout(() => setCallState(CallState.IDLE), 2000);
    }
  };

  const stopRecordingAndPrompt = async () => {
    setIsRecording(false);
    
    if (!currentCallId) {
        console.error("No call ID found to fetch recording");
        return;
    }

    setIsFetchingRecording(true);
    
    // Polling logic: Attempt to get the recording URL 3 times
    let attempts = 0;
    const maxAttempts = 3;
    
    const fetchLoop = async () => {
        try {
            const callData = await blandService.getCallDetails(currentCallId);
            
            if (callData && callData.recording_url) {
                // Success - we have the real URL
                const duration = callData.call_length 
                    ? Math.round(callData.call_length * 60) // API usually returns minutes? check docs. Usually float minutes.
                    : Math.floor((Date.now() - recordingStartTime) / 1000); // Fallback

                setPendingRecording({
                   url: callData.recording_url,
                   duration: duration, 
                   timestamp: recordingStartTime
                });
                setRecordingOutcome('connected');
                setIsFetchingRecording(false);
            } else {
                // Not ready yet, retry
                attempts++;
                if (attempts < maxAttempts) {
                    console.log(`Recording not ready, retrying (${attempts}/${maxAttempts})...`);
                    setTimeout(fetchLoop, 2000); // Wait 2s
                } else {
                    console.warn("Recording URL not found after retries.");
                    setIsFetchingRecording(false);
                    // Optional: Show error or just close
                }
            }
        } catch (e) {
            console.error("Error fetching call details", e);
            setIsFetchingRecording(false);
        }
    };

    // Start fetching
    setTimeout(fetchLoop, 1000); // Initial delay
  };

  const handleEndCall = async () => {
    // Cleanup Ringtone if active
    if (ringtoneRef.current) {
        try {
            ringtoneRef.current.pause();
        } catch (e) { /* ignore */ }
        ringtoneRef.current = null;
    }
    if (ringTimeoutRef.current) {
        clearTimeout(ringTimeoutRef.current);
        ringTimeoutRef.current = null;
    }
    
    if (monitorWs) {
        monitorWs.close();
        setMonitorWs(null);
    }

    // Always attempt to fetch recording details when call ends normally
    if (callState === CallState.ACTIVE && currentCallId) {
        await stopRecordingAndPrompt();
    }
    
    // If using Gemini client for other features, disconnect it too
    geminiClient.disconnect();
    
    setCallState(CallState.ENDED);
    setTimeout(() => setCallState(CallState.IDLE), 2000);
  };

  const toggleRecording = (shouldRecord: boolean) => {
    // Bland records automatically based on config.
    // This button just updates UI state.
    setIsRecording(shouldRecord);
  };

  const handleConfirmSave = async () => {
     if (!pendingRecording || !activeLead) return;
     
     const newRecording: Recording = {
        id: Date.now().toString(),
        timestamp: pendingRecording.timestamp,
        duration: pendingRecording.duration,
        url: pendingRecording.url,
        outcome: recordingOutcome
     };
     
     const updatedLead = {
         ...activeLead,
         recordings: [newRecording, ...activeLead.recordings]
     };

     await handleUpdateLead(updatedLead);

     // Automated Action: Create Task if 'Follow up needed'
     if (recordingOutcome === 'follow_up') {
         const newTask: Task = {
             id: `task-${Date.now()}`,
             title: `Follow up with ${activeLead.firstName} ${activeLead.lastName}`,
             dueDate: new Date(Date.now() + 86400000).toISOString(), // +24 hours
             completed: false,
             leadId: activeLead.id,
             leadName: `${activeLead.firstName} ${activeLead.lastName}`,
             priority: 'MEDIUM'
         };
         await db.createTask(newTask);
         setTasks(prev => [...prev, newTask]);
         alert("Follow-up task created automatically for tomorrow.");
     }

     setPendingRecording(null);
     setCurrentCallId(null);
  };

  const handleDownloadRecording = () => {
      if (!pendingRecording) return;
      const a = document.createElement('a');
      a.href = pendingRecording.url;
      a.target = "_blank"; // Open in new tab for direct mp3 links
      a.download = `call-recording-${new Date(pendingRecording.timestamp).toISOString()}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  const handleDiscardRecording = () => {
      setPendingRecording(null);
      setCurrentCallId(null);
  };

  const handleLogout = async () => {
      if (window.confirm("Are you sure you want to sign out?")) {
          await supabase.auth.signOut();
          setCurrentUser(null);
      }
  };

  const handleLogin = (user: User) => {
      setCurrentUser(user);
  };

  // Show loading during session check
  if (isCheckingSession) {
      return <div className="h-screen w-screen flex items-center justify-center bg-slate-50 text-slate-400">Loading...</div>;
  }

  // Show Auth component if not authenticated
  if (!currentUser) {
      return <Auth onLogin={handleLogin} />;
  }

  // --- MOBILE COMPONENTS ---

  const MobileNavBar = () => (
      <div className="bg-white border-t border-slate-200 px-4 py-2 flex justify-between items-center fixed bottom-0 left-0 right-0 z-50 h-16 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button 
            onClick={() => setMobileTab('dialer')} 
            className={`flex flex-col items-center gap-1 ${mobileTab === 'dialer' ? 'text-emerald-600' : 'text-slate-400'}`}
          >
              <Phone className="w-6 h-6" fill={mobileTab === 'dialer' ? 'currentColor' : 'none'}/>
              <span className="text-[10px] font-medium">Dialer</span>
          </button>
          <button 
            onClick={() => setMobileTab('leads')} 
            className={`flex flex-col items-center gap-1 ${mobileTab === 'leads' ? 'text-emerald-600' : 'text-slate-400'}`}
          >
              <UserIcon className="w-6 h-6"/>
              <span className="text-[10px] font-medium">Leads</span>
          </button>
          <button 
            onClick={() => setMobileTab('admin')} 
            className={`flex flex-col items-center gap-1 ${mobileTab === 'admin' ? 'text-emerald-600' : 'text-slate-400'}`}
          >
              <LayoutDashboard className="w-6 h-6"/>
              <span className="text-[10px] font-medium">Admin</span>
          </button>
          <button 
             onClick={() => setMobileTab('settings')}
             className={`flex flex-col items-center gap-1 ${mobileTab === 'settings' ? 'text-emerald-600' : 'text-slate-400'}`}
          >
              <Settings className="w-6 h-6"/>
              <span className="text-[10px] font-medium">Settings</span>
          </button>
      </div>
  );

  return (
    <div className="h-screen w-screen overflow-hidden flex relative bg-slate-50">
      
      {/* Desktop Layout */}
      {!isMobile && (
        <>
            <div className="flex-1 h-full min-w-0">
                <CRM 
                    leads={leads} 
                    properties={properties} 
                    onSelectLead={handleLeadSelect}
                    selectedLeadId={activeLead?.id || null}
                    onUpdateLead={handleUpdateLead}
                    currentUser={currentUser}
                    onLogout={handleLogout}
                    agentPersona={agentPersona}
                    onUpdateAgentPersona={setAgentPersona}
                    onSwitchUser={handleSwitchUser}
                    tasks={tasks}
                    onUpdateTask={handleUpdateTask}
                    agents={agents}
                    onAgentsChange={setAgents}
                    onTabChange={(t) => setCrmTab(t)}
                />
            </div>
            {crmTab !== 'web-call' && (
            <div className='w-[420px] h-full border-l border-slate-200 bg-white shadow-2xl relative z-40 p-8 flex items-center justify-center shrink-0'>
                <div className='w-[360px] h-[720px] transition-all'>
                    <Dialer 
                        callState={callState}
                        onCallStart={startCall}
                        onCallEnd={handleEndCall}
                        activeLeadName={activeLead ? `${activeLead.firstName} ${activeLead.lastName}` : undefined}
                        activeLeadPhone={activeLead?.phone}
                        inputVolume={audioVols.in}
                        outputVolume={audioVols.out}
                        onToggleRecording={toggleRecording}
                        isRecording={isRecording}
                        leads={leads}
                        onLeadSelected={(lead) => handleLeadSelect(lead)}
                        agents={agents}
                        selectedAgentId={agentPersona.id || 'default'}
                        onSelectAgent={handleSelectAgent}
                    />
                </div>
            </div>
            )}
        </>
      )}

      {/* Mobile Layout */}
      {isMobile && (
          <div className="flex flex-col w-full h-full pb-16">
              
              {/* DIALER TAB */}
              <div className={`flex-1 overflow-hidden ${mobileTab === 'dialer' ? 'block' : 'hidden'}`}>
                  <Dialer 
                        callState={callState}
                        onCallStart={startCall}
                        onCallEnd={handleEndCall}
                        activeLeadName={activeLead ? `${activeLead.firstName} ${activeLead.lastName}` : undefined}
                        activeLeadPhone={activeLead?.phone}
                        inputVolume={audioVols.in}
                        outputVolume={audioVols.out}
                        onToggleRecording={toggleRecording}
                        isRecording={isRecording}
                        leads={leads}
                        onLeadSelected={(lead) => handleLeadSelect(lead)}
                        agents={agents}
                        selectedAgentId={agentPersona.id || 'default'}
                        onSelectAgent={handleSelectAgent}
                    />
              </div>

              {/* ADMIN / CRM TAB */}
              <div className={`flex-1 overflow-hidden ${mobileTab === 'admin' ? 'block' : 'hidden'}`}>
                  <CRM 
                        leads={leads} 
                        properties={properties} 
                        onSelectLead={handleLeadSelect}
                        selectedLeadId={activeLead?.id || null}
                        onUpdateLead={handleUpdateLead}
                        currentUser={currentUser}
                        onLogout={handleLogout}
                        agentPersona={agentPersona}
                        onUpdateAgentPersona={setAgentPersona}
                        onSwitchUser={handleSwitchUser}
                        tasks={tasks}
                        onUpdateTask={handleUpdateTask}
                        agents={agents}
                        onAgentsChange={setAgents}
                    />
              </div>

              {/* LEADS TAB (Simplified View or reuse CRM leads tab logic) */}
              <div className={`flex-1 overflow-hidden ${mobileTab === 'leads' ? 'block' : 'hidden'}`}>
                  {/* Reuse CRM but force 'leads' tab view internally? 
                      Or simpler, just render the list here. Let's reuse CRM for consistency but we need to tell it to show Leads.
                      Since CRM controls its own tab state, we might just mount a fresh instance or
                      pass a prop to force initial tab. For simplicity, we can just use the Admin tab and instruct user 
                      to navigate, BUT user asked for specific tabs.
                      Let's render a specific Lead List here for mobile speed.
                   */}
                   <div className="h-full bg-slate-50 p-4 overflow-y-auto">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">Leads</h2>
                        <div className="space-y-3">
                            {leads.map(lead => (
                                <div 
                                    key={lead.id} 
                                    onClick={() => handleLeadSelect(lead)}
                                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 active:bg-slate-50"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-slate-900">{lead.firstName} {lead.lastName}</h3>
                                            <p className="text-sm text-slate-500">{lead.phone}</p>
                                        </div>
                                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded">{lead.status}</span>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <button className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                                            <Phone className="w-3 h-3"/> Call
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                   </div>
              </div>

              {/* SETTINGS TAB */}
              <div className={`flex-1 overflow-hidden p-6 bg-slate-50 ${mobileTab === 'settings' ? 'block' : 'hidden'}`}>
                   <h2 className="text-2xl font-bold text-slate-800 mb-6">Settings</h2>
                   <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                       <button onClick={handleLogout} className="w-full text-left px-4 py-4 text-red-600 font-bold flex items-center gap-2 hover:bg-red-50">
                           <LayoutDashboard className="w-5 h-5"/> Sign Out
                       </button>
                   </div>
                   <div className="mt-4 text-center text-xs text-slate-400">
                       Eburon Mobile v1.0.0
                   </div>
              </div>

              {/* Bottom Nav */}
              <MobileNavBar />
          </div>
      )}

      {/* Loading Overlay for Recording Fetch */}
      {isFetchingRecording && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm">
              <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center animate-in zoom-in-95">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
                  <p className="text-slate-800 font-bold">Processing Recording...</p>
                  <p className="text-xs text-slate-500">Retrieving audio file from server</p>
              </div>
          </div>
      )}

      {/* Recording Review Modal */}
      {pendingRecording && !isFetchingRecording && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
             <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200 border border-slate-200">
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xl font-bold text-slate-800">Call Recording</h3>
                     <button onClick={handleDiscardRecording} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                     </button>
                 </div>
                 
                 <p className="text-sm text-slate-500 mb-6 font-medium leading-relaxed">
                    The call has ended. Please categorize the outcome and save the recording.
                 </p>

                 <div className="bg-slate-100 rounded-2xl p-4 mb-6 border border-slate-200">
                     <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        <span>{new Date(pendingRecording.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <span>{Math.floor(pendingRecording.duration / 60)}:{(pendingRecording.duration % 60).toFixed(0).padStart(2, '0')}</span>
                     </div>
                     <audio controls src={pendingRecording.url} className="w-full h-8 accent-indigo-600" />
                 </div>

                 {/* Outcome Selector */}
                 <div className="mb-6">
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Call Outcome</label>
                     <div className="grid grid-cols-2 gap-2">
                         {(['connected', 'voicemail', 'missed', 'follow_up', 'closed'] as const).map(outcome => (
                             <button
                                key={outcome}
                                onClick={() => setRecordingOutcome(outcome)}
                                className={`px-2 py-2 text-xs font-bold rounded-lg border transition-all ${
                                    recordingOutcome === outcome 
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                                }`}
                             >
                                 {outcome.replace('_', ' ').charAt(0).toUpperCase() + outcome.replace('_', ' ').slice(1)}
                             </button>
                         ))}
                     </div>
                     {recordingOutcome === 'follow_up' && (
                         <div className="mt-2 flex items-start gap-2 text-xs text-indigo-600 bg-indigo-50 p-2 rounded-lg">
                             <AlertCircle className="w-4 h-4 shrink-0" />
                             <span>A task will be automatically created for tomorrow.</span>
                         </div>
                     )}
                 </div>

                 <div className="space-y-3">
                    <button 
                        onClick={handleConfirmSave}
                        disabled={!activeLead}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-4 h-4" />
                        {activeLead ? `Save to ${activeLead.firstName}` : 'Select a Lead to Save'}
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={handleDownloadRecording}
                            className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </button>
                        <button 
                            onClick={handleDiscardRecording}
                            className="w-full py-3 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-100 text-slate-700 hover:text-red-600 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Discard
                        </button>
                    </div>
                 </div>
             </div>
          </div>
      )}

    </div>
  );
};

export default AdminPortal;
