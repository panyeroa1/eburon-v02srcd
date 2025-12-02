
import React, { useState } from 'react';
import { UserRole, User } from '../../types-admin';
import { Building, User as UserIcon, Home, Wrench, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { db } from '../../services/admin/db';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('BROKER');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        // 1. Sign Up
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        if (data.user) {
          const newUser: User = {
            id: data.user.id,
            email: email,
            name: name,
            role: role,
            avatar: `https://ui-avatars.com/api/?name=${name}&background=random`
          };
          
          // 2. Save Profile
          await db.createUserProfile(newUser);
          onLogin(newUser);
        }
      } else {
        // 1. Sign In
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;

        if (data.user) {
          // 2. Fetch Profile
          let userProfile = await db.getUserProfile(data.user.id);
          
          // Fallback if profile missing in DB (or DB table missing)
          if (!userProfile) {
              userProfile = {
                  id: data.user.id,
                  email: data.user.email || '',
                  name: data.user.email?.split('@')[0] || 'User',
                  role: role, // Default to selected role for demo purposes if DB fetch fails
                  avatar: `https://ui-avatars.com/api/?name=${data.user.email}&background=random`
              };
          }
          
          onLogin(userProfile);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (r: UserRole) => {
    switch (r) {
      case 'BROKER': return <Building className="w-5 h-5" />;
      case 'OWNER': return <UserIcon className="w-5 h-5" />;
      case 'RENTER': return <Home className="w-5 h-5" />;
      case 'CONTRACTOR': return <Wrench className="w-5 h-5" />;
    }
  };

  const getRoleDescription = (r: UserRole) => {
    switch (r) {
      case 'BROKER': return 'Property Manager / Agency';
      case 'OWNER': return 'Landlord / Property Owner';
      case 'RENTER': return 'Tenant / Resident';
      case 'CONTRACTOR': return 'Service Provider / Technician';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-2 mb-6">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">E</div>
             <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Eburon</h2>
        </div>
        <h2 className="mt-2 text-center text-2xl font-bold text-slate-900">
          {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{' '}
          <button 
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            {mode === 'signin' ? 'start your 14-day free trial' : 'sign in to existing account'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all pr-10"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-2">
                {mode === 'signup' ? 'I am a...' : 'Login as (if first time)'}
              </label>
              <div className="grid grid-cols-1 gap-3">
                {(['BROKER', 'OWNER', 'RENTER', 'CONTRACTOR'] as UserRole[]).map((r) => (
                  <div 
                    key={r}
                    onClick={() => setRole(r)}
                    className={`relative rounded-xl border p-4 flex cursor-pointer focus:outline-none transition-all ${
                      role === r 
                        ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-500' 
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center">
                        <div className={`flex items-center justify-center h-5 w-5 rounded-full border ${role === r ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                            {role === r && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <div className="ml-3 flex items-center gap-2">
                            <span className={`block text-sm font-medium ${role === r ? 'text-indigo-900' : 'text-slate-900'}`}>
                                {r.charAt(0) + r.slice(1).toLowerCase()}
                            </span>
                             <span className={`text-xs ${role === r ? 'text-indigo-700' : 'text-slate-500'}`}>
                                - {getRoleDescription(r)}
                            </span>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'signin' ? 'Sign in' : 'Create account')}
              </button>
            </div>
          </form>

          {mode === 'signin' && (
             <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500">Demo Quick Login</span>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-4 gap-2">
                    {(['BROKER', 'OWNER', 'RENTER', 'CONTRACTOR'] as UserRole[]).map((r) => (
                        <button
                            key={r}
                            onClick={() => {
                                setRole(r);
                                setEmail(`demo.${r.toLowerCase()}@eburon.com`);
                                setPassword('password');
                                // In a real app we wouldn't auto-submit, but for demo speed:
                                setTimeout(() => {
                                    // Hacky auto-fill for demo feel
                                    const evt = new Event('submit', { cancelable: true });
                                }, 100);
                            }}
                            className="flex flex-col items-center justify-center py-2 px-1 border border-slate-200 rounded-lg hover:bg-slate-50 text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                        >
                            {getRoleIcon(r)}
                            <span className="mt-1 text-[10px] uppercase">{r.slice(0,3)}</span>
                        </button>
                    ))}
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
