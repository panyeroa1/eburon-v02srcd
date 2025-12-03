
import React from 'react';
import { BarChart3, Target } from 'lucide-react';

const AnalyticsView: React.FC = () => {
  return (
      <div className="animate-in fade-in duration-500">
           <h2 className="text-2xl font-bold text-slate-800 mb-6">Analytics</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[300px] flex flex-col justify-center items-center text-center">
                   <BarChart3 className="w-16 h-16 text-indigo-100 mb-4"/>
                   <h3 className="text-lg font-bold text-slate-700">Performance Metrics</h3>
                   <div className="flex gap-2 items-end h-32 mt-4">
                        {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                            <div key={i} style={{height: `${h}%`}} className="w-4 bg-emerald-500 rounded-t-sm"></div>
                        ))}
                   </div>
               </div>
               <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[300px] flex flex-col justify-center items-center text-center">
                   <Target className="w-16 h-16 text-indigo-100 mb-4"/>
                   <h3 className="text-lg font-bold text-slate-700">Conversion Goals</h3>
                    <div className="relative w-32 h-32 mt-4">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="75, 100" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-800">75%</div>
                    </div>
               </div>
           </div>
      </div>
  );
};

export default AnalyticsView;
