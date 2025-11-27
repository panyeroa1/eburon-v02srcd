import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@eburon.ai');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Check role (this would ideally be in a public.users table or custom claim)
        // For MVP, we'll assume if they can login here, they are authorized, 
        // or we fetch their profile.
        // Let's fetch the profile to check role.
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.user.id)
            .single();
        
        if (profileError) {
             // If table doesn't exist yet or no profile, we might let them in if it's the first admin
             // But strictly following requirements:
             console.warn("Could not fetch profile", profileError);
        }

        if (profile && !['admin', 'contractor', 'owner', 'broker'].includes(profile.role)) {
            throw new Error("Unauthorized access");
        }

        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-rose-500 rounded-lg flex items-center justify-center text-white font-bold font-mono text-xl mx-auto mb-4">E</div>
          <h1 className="text-2xl font-bold text-slate-900">Eburon Admin</h1>
          <p className="text-slate-500">Sign in to manage properties</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
              required
              placeholder="admin@eburon.ai"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
              required
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-2 rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
