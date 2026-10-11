import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = async (role: 'student' | 'admin' | 'counsellor') => {
    setError(null);
    setLoading(true);
    try {
      await quickLogin(role);
      if (role === 'admin') navigate('/admin');
      else if (role === 'counsellor') navigate('/counsellor/console');
      else navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Auto sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#0B0C0E] text-[#EDEDED] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#E50914]/[0.06] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-md w-full bg-[#111216] border border-white/10 rounded-2xl p-8 sm:p-10 space-y-7 shadow-2xl relative z-10 transition-all hover:border-[#E50914]/30">
        
        {/* Micro Kicker with Red Tick */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-4 h-[2px] bg-[#E50914]" />
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A1A1AA]">
              SECURE ACCESS
            </span>
          </div>
          <h2 className="font-['Outfit'] text-3xl font-bold tracking-tight text-white">
            Sign In Portal
          </h2>
          <p className="text-sm text-[#9E9EA4] leading-relaxed font-light">
            Enter authorized student, counsellor, or administrator credentials to begin your session.
          </p>
        </div>

        <div className="w-full red-glow-line" />

        {error && (
          <div className="p-3.5 bg-[#E50914]/10 border border-[#E50914]/40 rounded-xl text-xs font-mono text-[#FF4D57] flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#E50914]" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5">
              Campus Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@stresspredict.edu"
                className="w-full px-4 py-3 pl-10 bg-[#17181F] border border-white/10 rounded-xl focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] outline-none text-xs text-white placeholder-[#71717A] transition-all"
              />
              <Mail className="w-4 h-4 text-[#71717A] absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA]">
                Password
              </label>
              <Link to="/forgot-password" className="text-[11px] text-[#E50914] hover:text-[#ff3b47] hover:underline transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pl-10 bg-[#17181F] border border-white/10 rounded-xl focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] outline-none text-xs text-white placeholder-[#71717A] transition-all"
              />
              <Lock className="w-4 h-4 text-[#71717A] absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-[#E50914] hover:bg-[#c20811] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-md group flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="font-mono text-xs">VERIFYING JWT...</span>
            ) : (
              <>
                <span>Authenticate Session</span>
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-3 h-3 text-white" />
                </div>
              </>
            )}
          </button>
        </form>

        {/* Evaluator Quick Access Strip */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] animate-ping" />
            <p className="text-[11px] font-mono uppercase tracking-widest text-[#A1A1AA]">
              One-Click Evaluator Clearance
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={() => handleQuick('student')}
              className="py-2 px-2 bg-[#17181F] border border-white/10 hover:border-[#E50914] hover:text-[#E50914] text-white rounded-lg transition-all text-center"
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => handleQuick('counsellor')}
              className="py-2 px-2 bg-[#17181F] border border-white/10 hover:border-[#E50914] hover:text-[#E50914] text-white rounded-lg transition-all text-center"
            >
              Counsellor
            </button>
            <button
              type="button"
              onClick={() => handleQuick('admin')}
              className="py-2 px-2 bg-[#17181F] border border-white/10 hover:border-[#E50914] hover:text-[#E50914] text-white rounded-lg transition-all text-center"
            >
              Admin
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-[#8E8E93] pt-1">
          <span>Need new clearance? </span>
          <Link to="/register" className="text-[#E50914] font-medium hover:underline ml-1">
            Register Student Account
          </Link>
        </div>

      </div>
    </div>
  );
};
