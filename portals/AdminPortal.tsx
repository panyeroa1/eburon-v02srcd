import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';
import AdminLogin from '../components/admin/Login';
import Dashboard from '../components/admin/Dashboard';
import UserManagement from '../components/admin/UserManagement';
import CreateListing from '../components/admin/CreateListing';
import MaintenanceDashboard from '../components/admin/MaintenanceDashboard';
import { LayoutDashboard, Users, Building, Wrench } from 'lucide-react';

const AdminPortal: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session && location.pathname !== '/login') {
          navigate('/login');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session && location.pathname !== '/login') {
          navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  const handleLogout = async () => {
      await supabase.auth.signOut();
      navigate('/login');
  };

  if (!session && location.pathname === '/login') {
      return <AdminLogin />;
  }

  if (!session) return null;

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
