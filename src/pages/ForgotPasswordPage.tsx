import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { KeyRound, ArrowLeft, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ message: string; temporaryPassword?: string; note?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await api.forgotPassword(email);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Unable to process reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#0B0C0E] text-[#EDEDED] relative overflow-hidden">
      {/* Background crimson ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#E50914]/[0.06] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-md w-full bg-[#111216] border border-white/10 rounded-2xl p-8 sm:p-10 space-y-7 shadow-2xl relative z-10 transition-all hover:border-[#E50914]/30">
        
        {/* Micro Kicker with Red Tick */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-4 h-[2px] bg-[#E50914]" />
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A1A1AA]">
              SECURITY RECOVERY
            </span>
          </div>
          <h2 className="font-['Outfit'] text-3xl font-bold tracking-tight text-white">
            Reset Clearance
          </h2>
          <p className="text-sm text-[#9E9EA4] leading-relaxed font-light">
            Local academic testing mode: retrieve an instantaneous temporary password credential for your registered email.
          </p>
        </div>

        <div className="w-full red-glow-line" />

        {error && (
          <div className="p-3.5 bg-[#E50914]/10 border border-[#E50914]/40 rounded-xl text-xs font-mono text-[#FF4D57] flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#E50914]" />
            <span>{error}</span>
          </div>
        )}

        {result ? (
          <div className="space-y-4">
            <div className="p-5 bg-[#17181F] border border-[#E50914]/40 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-white font-['Outfit'] font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5 text-[#E50914]" />
                <span>Temporary Clearance Generated</span>
              </div>
              <p className="text-xs text-[#9E9EA4] leading-relaxed">{result.note}</p>
              {result.temporaryPassword && (
                <div className="p-3 bg-[#0B0C0E] border border-white/10 rounded-lg text-center font-mono font-bold text-sm text-[#E50914] tracking-wider select-all">
                  {result.temporaryPassword}
                </div>
              )}
            </div>

            <Link
              to="/login"
              className="w-full py-3.5 bg-[#E50914] hover:bg-[#c20811] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Return to Sign In</span>
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <ArrowRight className="w-3 h-3 text-white" />
              </div>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5">
                Registered Student / Faculty Email
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
                <KeyRound className="w-4 h-4 text-[#71717A] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 bg-[#E50914] hover:bg-[#c20811] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-md group flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="font-mono text-xs">QUERYING DIRECTORY...</span>
              ) : (
                <>
                  <span>Issue Temporary Password</span>
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                    <ArrowRight className="w-3 h-3 text-white" />
                  </div>
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-white/10">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-[#8E8E93] hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
