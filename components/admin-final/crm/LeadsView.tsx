
import React from 'react';
import { User as UserIcon, ChevronRight } from 'lucide-react';
import { Lead, User } from '../../../types-admin-final';

interface LeadsViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead | null) => void;
  selectedLeadId: string | null;
  currentUser: User;
}

const LeadsView: React.FC<LeadsViewProps> = ({ leads, onSelectLead, selectedLeadId, currentUser }) => {
  return (
    <>
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Leads</h2>
                <p className="text-slate-500 text-sm mt-1">Manage and track your potential clients</p>
            </div>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Add Lead
            </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4 hidden md:table-cell">Interest</th>
                        <th className="px-6 py-4 hidden sm:table-cell">Status</th>
                        <th className="px-6 py-4"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {leads.map((lead) => (
                        <tr 
                            key={lead.id} 
                            onClick={() => onSelectLead(lead)}
                            className={`hover:bg-slate-50 cursor-pointer transition-colors ${selectedLeadId === lead.id ? 'bg-indigo-50/60' : ''}`}
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                                        {lead.firstName[0]}{lead.lastName[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-semibold text-slate-900 truncate">{lead.firstName} {lead.lastName}</div>
                                        <div className="text-xs text-slate-500 truncate">{lead.phone}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 hidden md:table-cell whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-100">
                                    {lead.interest}
                                </span>
                            </td>
                            <td className="px-6 py-4 hidden sm:table-cell whitespace-nowrap">
                                <span className="text-slate-600 font-medium text-sm">{lead.status}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </>
  );
};

export default LeadsView;
