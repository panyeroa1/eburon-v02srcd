
import React, { useState, useEffect } from 'react';
import { Phone, Mic, MicOff, PhoneOff, Disc, Delete, Search, User, X, Check } from 'lucide-react';
import { CallState, Lead } from '../../types-admin';

interface DialerProps {
  callState: CallState;
  onCallStart: (phoneNumber: string) => void;
  onCallEnd: () => void;
  activeLeadName?: string;
  activeLeadPhone?: string;
  inputVolume: number;
  outputVolume: number;
  onToggleRecording: (isRecording: boolean) => void;
  isRecording: boolean;
  leads: Lead[];
  onLeadSelected: (lead: Lead) => void;
}

const Dialer: React.FC<DialerProps> = ({
  callState,
  onCallStart,
  onCallEnd,
  activeLeadName,
  activeLeadPhone,
  inputVolume,
  outputVolume,
  onToggleRecording,
  isRecording,
  leads,
  onLeadSelected
}) => {
  const [dialNumber, setDialNumber] = useState(activeLeadPhone || '');
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (activeLeadPhone) {
        setDialNumber(activeLeadPhone);
    }
  }, [activeLeadPhone]);

  useEffect(() => {
    let interval: any;
    if (callState === CallState.ACTIVE) {
      interval = setInterval(() => setDuration(d => d + 1), 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handlePadClick = (num: string) => {
    if (callState === CallState.IDLE) {
      setDialNumber(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setDialNumber(prev => prev.slice(0, -1));
  };

  const handleSearchSelect = (lead: Lead) => {
      onLeadSelected(lead);
      setDialNumber(lead.phone);
      setSearchTerm('');
      setShowSearch(false);
  };

  const filteredLeads = leads.filter(l => 
      l.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone.includes(searchTerm)
  );

  const activeVisualizerHeight = Math.min(100, outputVolume * 200);
  const inputVisualizerHeight = Math.min(100, inputVolume * 200);

  return (
    <div className="flex flex-col h-full bg-white text-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border-[8px] border-slate-900 relative ring-4 ring-slate-300 box-content">
      {/* Dynamic Island / Header */}
      <div className="absolute top-0 left-0 right-0 h-12 flex justify-center items-start pt-3 z-50 pointer-events-none">
        <div className="bg-black rounded-full px-5 py-2 flex items-center justify-center gap-3 transition-all duration-300 ease-in-out min-w-[100px] h-[30px]">
             {callState === CallState.ACTIVE && (
                 <div className="flex gap-1 items-end h-3">
                     <div className="w-1 bg-green-500 animate-pulse h-3 rounded-full"></div>
                     <div className="w-1 bg-green-500 animate-pulse h-2 rounded-full animation-delay-75"></div>
                     <div className="w-1 bg-green-500 animate-pulse h-4 rounded-full animation-delay-150"></div>
                 </div>
             )}
             {isRecording && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>}
        </div>
      </div>

      {/* Screen Content */}
      <div className="flex-1 flex flex-col p-6 items-center relative overflow-hidden z-10 bg-slate-50">
        
        {/* Status Bar Dummy */}
        <div className="w-full flex justify-between items-center text-[10px] font-bold text-slate-900 px-2 mb-2 pt-1">
             <span>9:41</span>
             <div className="flex gap-1">
                 <div className="w-4 h-2.5 bg-slate-900 rounded-[2px] opacity-20"></div>
                 <div className="w-4 h-2.5 bg-slate-900 rounded-[2px] opacity-20"></div>
                 <div className="w-4 h-2.5 bg-slate-900 rounded-[2px]"></div>
             </div>
        </div>

        {/* Search Bar (Only visible in IDLE) */}
        {callState === CallState.IDLE && (
            <div className="w-full mb-4 relative z-20">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowSearch(!!e.target.value);
                        }}
                        placeholder="Search contacts..."
                        className="w-full bg-slate-200/70 hover:bg-slate-200 focus:bg-white text-slate-900 text-sm rounded-xl pl-9 pr-8 py-2.5 outline-none transition-all border border-transparent focus:border-blue-500/30 focus:shadow-sm placeholder:text-slate-500"
                    />
                    {searchTerm && (
                        <button 
                            onClick={() => { setSearchTerm(''); setShowSearch(false); }}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 bg-slate-300 rounded-full text-slate-600 hover:bg-slate-400"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>

                {/* Search Results Overlay */}
                {showSearch && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-xl rounded-xl shadow-lg border border-slate-200/50 max-h-60 overflow-y-auto z-30 divide-y divide-slate-100">
                        {filteredLeads.length > 0 ? (
                            filteredLeads.map(lead => {
                                const isSelected = dialNumber === lead.phone;
                                return (
                                    <button
                                        key={lead.id}
                                        onClick={() => handleSearchSelect(lead)}
                                        className={`w-full px-4 py-3 flex items-center gap-3 transition-colors text-left ${
                                            isSelected ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-blue-50 border-l-4 border-transparent'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                            isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'
                                        }`}>
                                            {lead.firstName[0]}{lead.lastName[0]}
                                        </div>
                                        <div className="flex-1">
                                            <div className={`text-sm font-semibold ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                                                {lead.firstName} {lead.lastName}
                                            </div>
                                            <div className={`text-xs ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`}>
                                                {lead.phone}
                                            </div>
                                        </div>
                                        {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="p-4 text-center text-xs text-slate-400">No contacts found</div>
                        )}
                    </div>
                )}
            </div>
        )}

        {/* Call Status / Number Display */}
        <div className="flex-1 w-full flex flex-col items-center justify-center transition-all duration-300 min-h-[120px]">
          {callState === CallState.IDLE ? (
             <div className="text-center w-full px-2">
                 <input 
                    type="text" 
                    value={dialNumber}
                    readOnly
                    aria-label="Dialed number"
                    className="bg-transparent text-4xl text-center font-semibold text-slate-900 w-full focus:outline-none tracking-tight mb-2 h-12"
                    placeholder=""
                />
                 {activeLeadName && (
                     <div className="text-indigo-600 font-medium text-sm bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full inline-block animate-in fade-in slide-in-from-bottom-2 shadow-sm">
                        {activeLeadName}
                     </div>
                 )}
                 {!dialNumber && !activeLeadName && (
                     <div className="text-slate-300 text-lg font-light">Enter number</div>
                 )}
             </div>
          ) : (
             <div className="text-center animate-in fade-in zoom-in duration-300">
                 <div className="relative w-28 h-28 mx-auto mb-6">
                     <div className="absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-20"></div>
                     <div className="w-full h-full bg-gradient-to-b from-slate-100 to-slate-200 rounded-full flex items-center justify-center shadow-xl border-4 border-white relative z-10">
                        <span className="text-4xl text-slate-700 font-bold">
                            {(activeLeadName || 'Laurent')[0]}
                        </span>
                     </div>
                 </div>
                 
                 <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight leading-tight px-4">{activeLeadName || 'Unknown'}</h2>
                 
                 {activeLeadName && (
                    <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                        CRM Lead
                    </div>
                 )}
                 
                 <p className="text-slate-500 mb-6 text-base font-medium font-mono tracking-wide">{dialNumber}</p>
                 
                 {/* Timer / Status Pill */}
                 <div className="inline-flex items-center justify-center px-5 py-2 bg-slate-100 rounded-full backdrop-blur-sm shadow-inner">
                    {callState === CallState.CONNECTING && <p className="text-sm font-medium text-slate-600 animate-pulse">Connecting...</p>}
                    {callState === CallState.ACTIVE && <p className="text-lg font-mono text-slate-800 font-bold tracking-widest">{formatTime(duration)}</p>}
                 </div>
             </div>
          )}
        </div>

        {/* Visualizer (Active State) */}
        {callState === CallState.ACTIVE && (
            <div className="w-full h-16 flex items-center justify-center gap-1.5 mb-8 opacity-80">
                 {[...Array(4)].map((_, i) => (
                    <div 
                        key={`in-${i}`}
                        className="w-1.5 bg-slate-800 rounded-full transition-all duration-100"
                        style={{ height: `${Math.max(6, inputVisualizerHeight * (Math.random() + 0.3))}px` }}
                    />
                 ))}
                 <div className="w-2"></div>
                 {[...Array(4)].map((_, i) => (
                    <div 
                        key={`out-${i}`}
                        className="w-1.5 bg-blue-500 rounded-full transition-all duration-100"
                        style={{ height: `${Math.max(6, activeVisualizerHeight * (Math.random() + 0.3))}px` }}
                    />
                 ))}
            </div>
        )}

        {/* Keypad (Idle State) */}
        {callState === CallState.IDLE && (
            <div className="grid grid-cols-3 gap-x-6 gap-y-4 mb-8 w-full max-w-[280px]">
                {['1','2','3','4','5','6','7','8','9','*','0','#'].map((key) => (
                    <button 
                        key={key} 
                        onClick={() => handlePadClick(key)}
                        className="w-[72px] h-[72px] rounded-full bg-slate-200 hover:bg-slate-300 flex flex-col items-center justify-center transition-all active:scale-95 active:bg-slate-400 group"
                    >
                        <span className="text-3xl font-normal text-slate-900 leading-none mb-0.5">{key}</span>
                        {/* Letters below numbers */}
                        {key !== '*' && key !== '#' && key !== '1' && (
                            <span className="text-[9px] font-bold text-slate-500 tracking-[2px] h-3">
                                {key === '2' ? 'ABC' : key === '3' ? 'DEF' : key === '4' ? 'GHI' : key === '5' ? 'JKL' : key === '6' ? 'MNO' : key === '7' ? 'PQRS' : key === '8' ? 'TUV' : key === '9' ? 'WXYZ' : ''}
                            </span>
                        )}
                         {key === '1' && <span className="text-[9px] text-transparent h-3 select-none">.</span>}
                         {(key === '*' || key === '#') && <span className="h-3"></span>}
                    </button>
                ))}
            </div>
        )}

        {/* Action Buttons Area */}
        <div className="w-full flex justify-center items-center gap-6 mb-8 min-h-[80px]">
            {callState === CallState.IDLE ? (
                 <div className="w-full grid grid-cols-3 items-center">
                    <div className="flex justify-center">
                        {/* Placeholder for future left button */}
                    </div>
                    <div className="flex justify-center">
                        <button 
                            onClick={() => onCallStart(dialNumber)}
                            disabled={!dialNumber}
                            className="w-[72px] h-[72px] bg-green-500 hover:bg-green-600 active:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 transition-all transform active:scale-95"
                        >
                            <Phone className="w-8 h-8 text-white fill-current" />
                        </button>
                    </div>
                    <div className="flex justify-center">
                        {dialNumber && (
                             <button 
                                onClick={handleDelete}
                                className="text-slate-300 hover:text-slate-500 transition-colors p-4 rounded-full"
                             >
                                <Delete className="w-7 h-7" />
                            </button>
                        )}
                    </div>
                 </div>
            ) : (
                <div className="grid grid-cols-3 gap-6 w-full max-w-[280px]">
                    <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className={`w-[72px] h-[72px] rounded-full flex flex-col items-center justify-center gap-1 transition-colors ${isMuted ? 'bg-white text-slate-900 border border-slate-200' : 'bg-slate-200/80 text-slate-900'}`}
                    >
                        {isMuted ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                        <span className="text-[10px] font-medium">mute</span>
                    </button>
                    
                    <button 
                        onClick={onCallEnd}
                        className="w-[72px] h-[72px] bg-red-500 hover:bg-red-600 rounded-full flex flex-col items-center justify-center shadow-lg shadow-red-500/30 transition-all transform active:scale-95"
                    >
                        <PhoneOff className="w-8 h-8 text-white fill-current" />
                    </button>

                    <button 
                        onClick={() => onToggleRecording(!isRecording)}
                        className={`w-[72px] h-[72px] rounded-full flex flex-col items-center justify-center gap-1 transition-colors ${isRecording ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-slate-200/80 text-slate-900'}`}
                    >
                        <Disc className={`w-8 h-8 ${isRecording ? 'animate-pulse' : ''}`} />
                         <span className="text-[10px] font-medium">{isRecording ? 'rec' : 'record'}</span>
                    </button>
                </div>
            )}
        </div>
        
        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-slate-900 rounded-full opacity-20"></div>
      </div>
    </div>
  );
};

export default Dialer;
