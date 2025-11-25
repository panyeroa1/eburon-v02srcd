import React, { useState, useEffect } from 'react';
import { getReservations } from '../services/mockDb';
import { Reservation } from '../types';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'homie@eburon.ai' && password === 'Password25') {
      setIsAuthenticated(true);
      setError('');
      loadData();
    } else {
      setError('Invalid credentials.');
    }
  };

  const loadData = () => {
    const data = getReservations();
    setReservations(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
           <div className="flex justify-center mb-6">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  E
              </div>
           </div>
           <h2 className="text-2xl font-bold text-center mb-6">Eburon Admin Portal</h2>
           <form onSubmit={handleLogin} className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                    placeholder="admin@eburon.ai"
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                    placeholder="••••••••"
                  />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button 
                type="submit"
                className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors"
              >
                Login
              </button>
           </form>
           <button onClick={onBack} className="w-full mt-4 text-slate-500 text-sm hover:underline">
               Back to Realty App
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
       <div className="flex justify-between items-center mb-8">
           <div>
               <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
               <p className="text-slate-500">Welcome back, Administrator.</p>
           </div>
           <button onClick={() => setIsAuthenticated(false)} className="text-rose-500 hover:underline text-sm font-medium">
               Logout
           </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <div className="text-slate-500 text-sm font-medium uppercase">Total Bookings</div>
               <div className="text-3xl font-bold text-slate-900 mt-2">{reservations.length}</div>
           </div>
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <div className="text-slate-500 text-sm font-medium uppercase">Pending Actions</div>
               <div className="text-3xl font-bold text-rose-500 mt-2">{reservations.filter(r => r.status === 'pending').length}</div>
           </div>
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <div className="text-slate-500 text-sm font-medium uppercase">Revenue (Est)</div>
               <div className="text-3xl font-bold text-slate-900 mt-2">€{reservations.length * 50}</div>
           </div>
       </div>

       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="px-6 py-4 border-b border-slate-100 font-semibold text-slate-800">
               Recent Reservations
           </div>
           <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                   <thead className="bg-slate-50 text-slate-500 uppercase font-medium">
                       <tr>
                           <th className="px-6 py-3">ID</th>
                           <th className="px-6 py-3">Property</th>
                           <th className="px-6 py-3">Customer</th>
                           <th className="px-6 py-3">Date</th>
                           <th className="px-6 py-3">Status</th>
                           <th className="px-6 py-3">Action</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                       {reservations.map((res) => (
                           <tr key={res.id} className="hover:bg-slate-50">
                               <td className="px-6 py-4 font-mono text-slate-400">#{res.id}</td>
                               <td className="px-6 py-4">
                                   <div className="font-medium text-slate-900">{res.listingName}</div>
                                   <div className="text-xs text-slate-500">{res.listingAddress}</div>
                               </td>
                               <td className="px-6 py-4">{res.customerName}</td>
                               <td className="px-6 py-4">{new Date(res.date).toLocaleDateString()}</td>
                               <td className="px-6 py-4">
                                   <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
                                       {res.status}
                                   </span>
                               </td>
                               <td className="px-6 py-4">
                                   <button 
                                      onClick={() => alert('This function is under development: Confirm Booking')} 
                                      className="text-blue-600 hover:text-blue-800 font-medium"
                                   >
                                       Review
                                   </button>
                               </td>
                           </tr>
                       ))}
                       {reservations.length === 0 && (
                           <tr>
                               <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                                   No reservations found yet. Go make one in the app!
                               </td>
                           </tr>
                       )}
                   </tbody>
               </table>
           </div>
       </div>
    </div>
  );
};

export default AdminPanel;