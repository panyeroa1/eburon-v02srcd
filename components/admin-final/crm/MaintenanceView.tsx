
import React, { useState } from 'react';
import { Plus, MapPin, CheckCircle, Clock } from 'lucide-react';
import { Ticket } from '../../../types-admin-final';

interface MaintenanceViewProps {
  tickets: Ticket[];
}

const MaintenanceView: React.FC<MaintenanceViewProps> = ({ tickets }) => {
    const [filterTicketStatus, setFilterTicketStatus] = useState<'ALL' | 'OPEN' | 'SCHEDULED' | 'COMPLETED'>('ALL');

    return (
      <div className="animate-in fade-in duration-500 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Maintenance Tickets</h2>
                <p className="text-slate-500 text-sm">Track repairs and requests</p>
              </div>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
                  <Plus className="w-4 h-4"/> New Ticket
              </button>
          </div>
           <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {(['ALL', 'OPEN', 'SCHEDULED', 'COMPLETED'] as const).map(status => (
                  <button 
                    key={status}
                    onClick={() => setFilterTicketStatus(status)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                        filterTicketStatus === status ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                      {status}
                  </button>
              ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-10">
              {tickets.filter(t => filterTicketStatus === 'ALL' || t.status === filterTicketStatus).map(ticket => (
                  <div key={ticket.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              ticket.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 
                              ticket.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                              {ticket.priority} Priority
                          </span>
                          <span className="text-xs text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 mb-1">{ticket.title}</h3>
                      <p className="text-xs text-slate-500 mb-4 line-clamp-2">{ticket.description}</p>
                      
                      <div className="flex items-center gap-2 text-xs text-slate-600 mb-4 bg-slate-50 p-2 rounded-lg">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{ticket.propertyAddress}</span>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                          <div className={`flex items-center gap-1.5 text-xs font-bold ${
                              ticket.status === 'COMPLETED' ? 'text-emerald-600' : 'text-indigo-600'
                          }`}>
                              {ticket.status === 'COMPLETED' ? <CheckCircle className="w-3.5 h-3.5"/> : <Clock className="w-3.5 h-3.5"/>}
                              {ticket.status}
                          </div>
                          <button className="text-slate-400 hover:text-indigo-600 text-xs font-medium">Details &rarr;</button>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );
};

export default MaintenanceView;
