import React, { useState, useEffect, useRef } from 'react';
import Dialer from './Dialer';
import { CallState, AgentPersona } from '../../types-admin-final';
import { GeminiLiveService } from '../../services/admin-final/geminiLiveService';
import { LEO_SYSTEM_PROMPT } from '../../constants-admin-final';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const WebCall: React.FC = () => {
  const [callState, setCallState] = useState<CallState>(CallState.IDLE);
  const [activeLeadName, setActiveLeadName] = useState<string>('Leo (AI Agent)');
  const [transcript, setTranscript] = useState<Array<{ role: 'agent' | 'user', text: string }>>([]);
  
  const serviceRef = useRef<GeminiLiveService | null>(null);

  useEffect(() => {
    // Initialize service
    if (!serviceRef.current && GEMINI_API_KEY) {
      serviceRef.current = new GeminiLiveService({
        apiKey: GEMINI_API_KEY,
      });

      // Setup callbacks
      serviceRef.current.onConnect = () => {
        setCallState(CallState.TALKING);
        setTranscript(prev => [...prev, { role: 'agent', text: 'Connected to Gemini Live' }]);
      };

      serviceRef.current.onDisconnect = () => {
        setCallState(CallState.IDLE);
        setTranscript(prev => [...prev, { role: 'agent', text: 'Call Ended' }]);
      };

      serviceRef.current.onError = (error) => {
        console.error('Gemini Service Error:', error);
        setCallState(CallState.IDLE);
        alert('Error connecting to Gemini Live. Check console for details.');
      };
      
      serviceRef.current.onAgentSpeaking = () => {
          // Visual indicator could go here
      };
    }

    return () => {
      if (serviceRef.current) {
        serviceRef.current.disconnect();
      }
    };
  }, []);

  const handleCallStart = async (number: string, persona: AgentPersona) => {
    if (!GEMINI_API_KEY) {
      alert('Please set VITE_GEMINI_API_KEY in .env');
      return;
    }

    setCallState(CallState.RINGING);
    
    try {
      await serviceRef.current?.connect({
        apiKey: GEMINI_API_KEY,
        voiceName: 'Aoede',
        systemInstruction: LEO_SYSTEM_PROMPT
      });
    } catch (error) {
      setCallState(CallState.IDLE);
    }
  };

  const handleCallEnd = () => {
    serviceRef.current?.disconnect();
    setCallState(CallState.IDLE);
  };

  const handleMuteToggle = (isMuted: boolean) => {
    // Implement mute logic in service if needed
    // serviceRef.current?.setMute(isMuted);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Web Call (Gemini Live)</h1>
                <p className="text-slate-500">Real-time voice conversation with Leo using Gemini Multimodal Live API</p>
            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <Dialer
                    callState={callState}
                    activeLeadName={activeLeadName}
                    onCallStart={handleCallStart}
                    onCallEnd={handleCallEnd}
                    onMuteToggle={handleMuteToggle}
                    transcript={transcript}
                />
            </div>
        </div>
      </div>
    </div>
  );
};

export default WebCall;
