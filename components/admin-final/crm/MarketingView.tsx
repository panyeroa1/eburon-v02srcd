
import React from 'react';
import { Plus } from 'lucide-react';
import { MOCK_CAMPAIGNS } from '../../../constants-admin-final';

const MarketingView: React.FC = () => {
  return (
      <div className="animate-in fade-in duration-500">
           <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Marketing</h2>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex gap-2 items-center">
                    <Plus className="w-4 h-4" /> New Campaign
                </button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {MOCK_CAMPAIGNS.map(camp => (
                   <div key={camp.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                       <div className="flex justify-between items-start mb-4">
                           <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                               camp.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                           }`}>
                               {camp.status}
                           </span>
                           <span className="text-xs font-bold text-slate-400">{camp.platform}</span>
                       </div>
                       <h3 className="font-bold text-slate-900 mb-6">{camp.name}</h3>
                       <div className="flex justify-between items-end">
                           <div>
                               <p className="text-xs text-slate-500 uppercase font-bold mb-1">Clicks</p>
                               <p className="text-xl font-bold text-slate-800">{camp.clicks}</p>
                           </div>
                            <div>
                               <p className="text-xs text-slate-500 uppercase font-bold mb-1">Spend</p>
                               <p className="text-xl font-bold text-slate-800">{camp.spend}</p>
                           </div>
                       </div>
                   </div>
               ))}
           </div>
      </div>
  );
};

export default MarketingView;
