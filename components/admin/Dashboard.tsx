import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { Users, Home, Wrench, Activity } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalListings: 0,
    activeMaintenance: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch counts from Supabase
        // Note: This assumes tables 'listings', 'maintenance_requests', 'users' exist
        // If 'users' is not accessible (auth schema), we might need a public profile table
        
        const { count: listingsCount } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true });

        const { count: maintenanceCount } = await supabase
          .from('maintenance_requests')
          .select('*', { count: 'exact', head: true })
          .neq('status', 'resolved');

        // For users, we might not have access to auth.users count directly from client
        // We'll try to count from a 'profiles' or 'users' table if it exists
        const { count: usersCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalListings: listingsCount || 0,
          activeMaintenance: maintenanceCount || 0,
          totalUsers: usersCount || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
      <div className={`p-4 rounded-full ${color} text-white`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{loading ? '...' : value}</h3>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Listings" 
          value={stats.totalListings} 
          icon={Home} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Active Maintenance" 
          value={stats.activeMaintenance} 
          icon={Wrench} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={Users} 
          color="bg-emerald-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-slate-800">Recent Activity</h3>
            <Activity size={18} className="text-slate-400" />
          </div>
          <div className="text-slate-500 text-sm text-center py-8">
            No recent activity to show.
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-slate-800">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left transition-colors">
              <span className="block font-semibold text-slate-700">+ Add Listing</span>
              <span className="text-xs text-slate-400">Create a new property</span>
            </button>
            <button className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left transition-colors">
              <span className="block font-semibold text-slate-700">+ Add User</span>
              <span className="text-xs text-slate-400">Invite contractor or owner</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
