import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { MaintenanceRequest } from '../../types';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

const MaintenanceDashboard: React.FC = () => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'pending' | 'resolved'>('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: 'open' | 'pending' | 'resolved') => {
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  };

  const filteredRequests = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Maintenance Oversight</h2>
        <div className="flex gap-2">
          {['all', 'open', 'pending', 'resolved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors
                ${filter === f ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="col-span-full text-center text-slate-400 py-12">Loading requests...</p>
        ) : filteredRequests.length === 0 ? (
          <p className="col-span-full text-center text-slate-400 py-12">No maintenance requests found.</p>
        ) : (
          filteredRequests.map((req) => (
            <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                  ${req.status === 'open' ? 'bg-red-100 text-red-800' : 
                    req.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                    'bg-green-100 text-green-800'}`}>
                  {req.status === 'open' && <AlertCircle size={12} />}
                  {req.status === 'pending' && <Clock size={12} />}
                  {req.status === 'resolved' && <CheckCircle size={12} />}
                  {req.status}
                </span>
                <span className="text-xs text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</span>
              </div>
              
              <h3 className="font-bold text-slate-900 mb-1">{req.type} - {req.propertyName}</h3>
              <p className="text-slate-600 text-sm mb-4 flex-grow">{req.description}</p>
              
              {req.imageUrl && (
                <img src={req.imageUrl} alt="Issue" className="w-full h-32 object-cover rounded-lg mb-4" />
              )}

              <div className="pt-4 border-t border-slate-100 mt-auto">
                <label className="block text-xs font-medium text-slate-500 mb-2">Update Status</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => updateStatus(req.id, 'pending')}
                    disabled={req.status === 'pending'}
                    className="flex-1 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 rounded hover:bg-amber-100 disabled:opacity-50"
                  >
                    In Progress
                  </button>
                  <button 
                    onClick={() => updateStatus(req.id, 'resolved')}
                    disabled={req.status === 'resolved'}
                    className="flex-1 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded hover:bg-green-100 disabled:opacity-50"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MaintenanceDashboard;
