
import React from 'react';
import { DollarSign, CheckSquare, Mail, CheckCircle } from 'lucide-react';
import { User } from '../../../types-admin-final';

interface DashboardViewProps {
  currentUser: User;
  pendingTasks: number;
}

const DashboardView: React.FC<DashboardViewProps> = ({ currentUser, pendingTasks }) => {
  return (
      <div className="animate-in fade-in duration-500">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Welcome back, {currentUser.name.split(' ')[0]}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                  { label: currentUser.role === 'BROKER' ? 'Revenue' : 'Balance', val: '€42.5k', change: '+12%', icon: DollarSign, color: 'bg-indigo-500' },
                  { label: 'Pending Tasks', val: pendingTasks, change: 'Keep it up', icon: CheckSquare, color: 'bg-amber-500' },
                  { label: 'Messages', val: '12', change: 'New', icon: Mail, color: 'bg-blue-500' },
                  { label: 'Rating', val: '4.9', change: '+0.1', icon: CheckCircle, color: 'bg-emerald-500' }
              ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
                      <div>
                          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                          <h3 className="text-2xl font-bold text-slate-900">{stat.val}</h3>
                          <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-emerald-600' : 'text-slate-500'} flex items-center mt-1`}>
                              {stat.change} this month
                          </span>
                      </div>
                      <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg shadow-indigo-100`}>
                          <stat.icon className="w-5 h-5" />
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );
};

export default DashboardView;
