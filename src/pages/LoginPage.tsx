import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0B0C0E] text-[#EDEDED] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#E50914]/[0.05] rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#111216] border border-white/10 rounded-2xl p-8 space-y-6 shadow-2xl relative z-10">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#E50914] flex items-center justify-center text-white font-['Outfit'] font-bold text-xl mx-auto shadow-lg">
            SP
          </div>
          <h1 className="font-['Outfit'] text-2xl font-bold tracking-tight text-white">
            Portal Authentication
          </h1>
          <p className="font-mono text-xs text-[#8E8E93]">
            Access your encrypted stress assessment dossier
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-[#E50914]/10 border border-[#E50914]/40 rounded-xl text-xs font-mono text-[#FF4D57] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#E50914]" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5">
              Email Address:
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@stresspredict.edu"
                className="w-full pl-10 pr-4 py-3 bg-[#17181F] border border-white/10 rounded-xl focus:border-[#E50914] outline-none text-xs text-white placeholder-[#71717A]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA]">
                Password:
              </label>
              <Link to="/forgot-password" className="text-[10px] font-mono text-[#E50914] hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 bg-[#17181F] border border-white/10 rounded-xl focus:border-[#E50914] outline-none text-xs text-white placeholder-[#71717A]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#E50914] hover:bg-[#c20811] text-white rounded-xl text-xs font-mono uppercase tracking-wider font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Demo Fast Login Strip */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider block text-center">
            Fast Demo Profiles:
          </span>
          <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
            <button
              type="button"
              onClick={() => handleQuickDemo('alex.student@stresspredict.edu', 'Student@12345')}
              className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-center text-white cursor-pointer"
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('counsellor@stresspredict.edu', 'Counsellor@12345')}
              className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-center text-white cursor-pointer"
            >
              Counsellor
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@stresspredict.edu', 'Admin@12345')}
              className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-center text-white cursor-pointer"
            >
              Admin
            </button>
          </div>
        </div>

        <p className="text-center font-mono text-xs text-[#8E8E93]">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#E50914] hover:underline font-semibold">
            Register Here
          </Link>
        </p>

      </div>

    </div>
  );
};
