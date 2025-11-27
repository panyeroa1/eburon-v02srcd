import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { MaintenanceRequest } from '../../types';
import { Home, Wrench, LogOut, Plus } from 'lucide-react';

interface ProfileProps {
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'maintenance'>('home');
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  
  // New Request Form State
  const [newRequest, setNewRequest] = useState({
    type: 'plumbing',
    description: '',
    propertyName: 'My Apartment' // In a real app, fetch from user's lease
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('userId', user.id) // Assuming we link requests to users
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('maintenance_requests')
        .insert([{
          userId: user.id,
          type: newRequest.type,
          description: newRequest.description,
          propertyName: newRequest.propertyName,
          status: 'open',
          createdAt: new Date().toISOString()
        }]);

      if (error) throw error;

      setShowRequestForm(false);
      setNewRequest({ type: 'plumbing', description: '', propertyName: 'My Apartment' });
      fetchRequests();
    } catch (err) {
      console.error("Error submitting request:", err);
      alert("Failed to submit request");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 pb-24">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900">My Profile</h2>
        <button 
          onClick={onLogout}
          className="text-slate-400 hover:text-rose-500 transition-colors"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-slate-100 mb-8">
        <button
          onClick={() => setActiveTab('home')}
          className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === 'home' ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <div className="flex items-center gap-2">
            <Home size={18} />
            <span>My Home</span>
          </div>
          {activeTab === 'home' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-rose-500 rounded-full"></div>}
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === 'maintenance' ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <div className="flex items-center gap-2">
            <Wrench size={18} />
            <span>Maintenance</span>
          </div>
          {activeTab === 'maintenance' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-rose-500 rounded-full"></div>}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'home' ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-2xl">
              🏠
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Current Lease</h3>
              <p className="text-slate-500">Kouter 1, 9000 Gent</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-slate-50">
              <span className="text-slate-500">Monthly Rent</span>
              <span className="font-semibold">€950.00</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-50">
              <span className="text-slate-500">Lease Start</span>
              <span className="font-semibold">01 Sep 2024</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-50">
              <span className="text-slate-500">Lease End</span>
              <span className="font-semibold">31 Aug 2025</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-slate-500">Landlord</span>
              <span className="font-semibold">Eburon Estates</span>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100">
             <button className="w-full py-3 bg-slate-50 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-colors">
                Download Lease Agreement
             </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-900">Maintenance Requests</h3>
            <button 
              onClick={() => setShowRequestForm(true)}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-slate-800"
            >
              <Plus size={16} />
              New Request
            </button>
          </div>

          {showRequestForm && (
            <div className="bg-slate-50 p-6 rounded-xl mb-6 border border-slate-100">
              <h4 className="font-bold mb-4">Submit New Request</h4>
              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div>
                  <label htmlFor="issueType" className="block text-sm font-medium text-slate-700 mb-1">Issue Type</label>
                  <select
                    id="issueType"
                    value={newRequest.type}
                    onChange={e => setNewRequest({...newRequest, type: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="appliance">Appliance</option>
                    <option value="general">General Repair</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={newRequest.description}
                    onChange={e => setNewRequest({...newRequest, description: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    rows={3}
                    placeholder="Describe the issue..."
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowRequestForm(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-4">
            {loading ? (
              <p className="text-center text-slate-400 py-8">Loading...</p>
            ) : requests.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-400">No maintenance requests yet.</p>
              </div>
            ) : (
              requests.map(req => (
                <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900 capitalize">{req.type}</span>
                      <span className="text-xs text-slate-400">• {new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-600">{req.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                    ${req.status === 'open' ? 'bg-red-50 text-red-700' : 
                      req.status === 'pending' ? 'bg-amber-50 text-amber-700' : 
                      'bg-green-50 text-green-700'}`}>
                    {req.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
