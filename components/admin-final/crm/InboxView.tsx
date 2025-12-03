
import React from 'react';
import { MessageSquare, Mail, Inbox as InboxIcon } from 'lucide-react';
import { MOCK_EMAILS } from '../../../constants-admin-final';

const InboxView: React.FC = () => {
  return (
      <div className="animate-in fade-in duration-500 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
              <div>
                   <h2 className="text-2xl font-bold text-slate-800">Inbox</h2>
                   <p className="text-slate-500 text-sm">Unified messaging (Email, WhatsApp)</p>
              </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex">
              <div className="w-full md:w-1/3 border-r border-slate-100 flex flex-col">
                   <div className="p-4 border-b border-slate-100">
                       <input type="text" placeholder="Search messages..." className="w-full px-4 py-2 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"/>
                   </div>
                   <div className="overflow-y-auto flex-1">
                       {MOCK_EMAILS.map(email => (
                           <div key={email.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${!email.read ? 'bg-indigo-50/30' : ''}`}>
                               <div className="flex justify-between items-start mb-1">
                                   <div className="flex items-center gap-2">
                                        {email.source === 'WHATSAPP' ? (
                                            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white"><MessageSquare className="w-3 h-3"/></div>
                                        ) : (
                                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white"><Mail className="w-3 h-3"/></div>
                                        )}
                                        <span className={`text-sm font-bold ${!email.read ? 'text-slate-900' : 'text-slate-600'}`}>{email.from}</span>
                                   </div>
                                   <span className="text-xs text-slate-400">{email.date}</span>
                               </div>
                               <div className={`text-sm mb-1 ${!email.read ? 'font-bold text-slate-800' : 'text-slate-700'}`}>{email.subject}</div>
                               <div className="text-xs text-slate-500 truncate">{email.preview}</div>
                           </div>
                       ))}
                   </div>
              </div>
              <div className="hidden md:flex flex-1 flex-col items-center justify-center text-slate-400 bg-slate-50/30">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                      <InboxIcon className="w-8 h-8 text-slate-300"/>
                  </div>
                  <p className="text-sm font-medium">Select a message to view conversation</p>
              </div>
          </div>
      </div>
  );
};

export default InboxView;
