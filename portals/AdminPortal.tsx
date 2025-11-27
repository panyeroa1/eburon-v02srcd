```typescript
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import AdminAuth from '../components/admin/Auth';
import Dashboard from '../components/admin/Dashboard';
import UserManagement from '../components/admin/UserManagement';
import CreateListing from '../components/admin/CreateListing';
import MaintenanceDashboard from '../components/admin/MaintenanceDashboard';
import { LayoutDashboard, Users, Building, Wrench, LogOut } from 'lucide-react';

const AdminPortal: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
      await supabase.auth.signOut();
      navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AdminAuth onAuthSuccess={() => {}} />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-rose-500">Eburon Admin</h1>
        </div>
        <nav className="mt-6 flex-1">
          <Link to="/" className="flex items-center gap-3 py-2.5 px-4 rounded transition duration-200 hover:bg-slate-800 text-slate-300 hover:text-white">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/users" className="flex items-center gap-3 py-2.5 px-4 rounded transition duration-200 hover:bg-slate-800 text-slate-300 hover:text-white">
            <Users size={20} />
            <span>Users</span>
          </Link>
          <Link to="/listings" className="flex items-center gap-3 py-2.5 px-4 rounded transition duration-200 hover:bg-slate-800 text-slate-300 hover:text-white">
            <Building size={20} />
            <span>Listings</span>
          </Link>
          <Link to="/maintenance" className="flex items-center gap-3 py-2.5 px-4 rounded transition duration-200 hover:bg-slate-800 text-slate-300 hover:text-white">
            <Wrench size={20} />
            <span>Maintenance</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
            <button onClick={handleLogout} className="w-full text-left py-2 px-4 text-slate-400 hover:text-white transition-colors">
                Sign Out
            </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/listings" element={<CreateListing />} />
          <Route path="/maintenance" element={<MaintenanceDashboard />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminPortal;
