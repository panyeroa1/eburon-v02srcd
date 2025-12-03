
import React, { useState } from 'react';
import { X, Phone, Mail, PhoneIncoming, PhoneMissed, Voicemail, CalendarDays, Phone as PhoneIcon } from 'lucide-react';
import { Lead } from '../../../types-admin-final';

interface DetailPaneProps {
  activeLead: Lead;
  onSelectLead: (lead: Lead | null) => void;
  onUpdateLead: (lead: Lead) => void;
}

const DetailPane: React.FC<DetailPaneProps> = ({ activeLead, onSelectLead, onUpdateLead }) => {
    const [noteInput, setNoteInput] = useState('');

    const handleSaveNote = () => {
        if (!noteInput.trim()) return;
        const timestamp = new Date().toLocaleString();
        const newNoteEntry = `[${timestamp}] Call Note: ${noteInput.trim()}`;
        const updatedNotes = activeLead.notes ? `${activeLead.notes}\n\n${newNoteEntry}` : newNoteEntry;
        const updatedLead = { ...activeLead, notes: updatedNotes };
        onUpdateLead(updatedLead);
        setNoteInput('');
    };

    const getStatusIcon = (outcome: string) => {
        switch(outcome) {
            case 'connected': return <PhoneIncoming className="w-4 h-4 text-emerald-500" />;
            case 'missed': return <PhoneMissed className="w-4 h-4 text-red-500" />;
            case 'voicemail': return <Voicemail className="w-4 h-4 text-amber-500" />;
            case 'follow_up': return <CalendarDays className="w-4 h-4 text-indigo-500" />;
            default: return <PhoneIcon className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div className="w-full lg:w-[380px] shrink-0 bg-white border-l border-slate-200 shadow-2xl overflow-y-auto z-20 lg:relative absolute inset-0 lg:inset-auto animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Lead Details</h3>
                <button onClick={() => onSelectLead(null)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="p-6">
                 <div className="flex items-center gap-4 mb-6">
                     <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-indigo-200">
                        {activeLead.firstName[0]}{activeLead.lastName[0]}
                     </div>
                     <div>
                        <h2 className="text-xl font-bold text-slate-900">{activeLead.firstName} {activeLead.lastName}</h2>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${activeLead.status === 'New' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                            {activeLead.status}
                        </span>
                     </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                    <a href={`tel:${activeLead.phone}`} className="flex flex-col items-center justify-center p-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl transition-colors group cursor-pointer">
                        <div className="w-8 h-8 bg-indigo-200 text-indigo-700 rounded-full flex items-center justify-center mb-2 group-hover:bg-white group-hover:scale-110 transition-all shadow-sm">
                            <Phone className="w-4 h-4 fill-current" />
                        </div>
                        <span className="text-xs font-bold text-indigo-900">Call Mobile</span>
                        <span className="text-[10px] text-indigo-600 font-medium truncate max-w-full">{activeLead.phone}</span>
                    </a>
                    
                    <a href={`mailto:${activeLead.email}`} className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl transition-colors group cursor-pointer">
                        <div className="w-8 h-8 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center mb-2 group-hover:bg-white group-hover:scale-110 transition-all shadow-sm">
                            <Mail className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-900">Send Email</span>
                        <span className="text-[10px] text-slate-500 font-medium truncate max-w-full">{activeLead.email}</span>
                    </a>
                </div>

                 <div className="mb-6">
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">History</h4>
                     {activeLead.recordings.map(rec => (
                         <div key={rec.id} className="bg-slate-50 p-3 rounded-lg mb-2 flex justify-between items-center">
                             <div className="flex items-center gap-2">
                                {getStatusIcon(rec.outcome)}
                                <span className="text-sm font-medium">{new Date(rec.timestamp).toLocaleDateString()}</span>
                             </div>
                             <span className="text-xs font-mono">{rec.duration}s</span>
                         </div>
                     ))}
                     {activeLead.recordings.length === 0 && <p className="text-xs text-slate-400 italic">No calls yet.</p>}
                 </div>
                 <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes</h4>
                    <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 mb-3 max-h-40 overflow-y-auto whitespace-pre-wrap">
                        {activeLead.notes || 'No notes available.'}
                    </div>
                    <textarea 
                        value={noteInput} 
                        onChange={e => setNoteInput(e.target.value)} 
                        className="w-full p-3 border border-slate-200 rounded-lg text-sm bg-white min-h-[100px] outline-none focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="Add a new note..."
                    />
                    <button onClick={handleSaveNote} className="mt-2 w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors">Save Note</button>
                 </div>
            </div>
        </div>
    );
};

export default DetailPane;
