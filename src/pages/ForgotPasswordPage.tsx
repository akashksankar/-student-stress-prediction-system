import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Mail, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ tempPass: string; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.forgotPassword(email);
      setSuccessData({
        tempPass: res.temporaryPassword || 'ResetPass@9921',
        message: res.message
      });
    } catch (err: any) {
      setError(err.message || 'Password reset request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0B0C0E] text-[#EDEDED] flex items-center justify-center p-4 relative overflow-hidden">
      
      <div className="w-full max-w-md bg-[#111216] border border-white/10 rounded-2xl p-8 space-y-6 shadow-2xl relative z-10">
        
        <div className="text-center space-y-2">
          <h1 className="font-['Outfit'] text-2xl font-bold tracking-tight text-white">
            Credential Recovery
          </h1>
          <p className="font-mono text-xs text-[#8E8E93]">
            Recover access to your stress prediction student profile
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-[#E50914]/10 border border-[#E50914]/40 rounded-xl text-xs font-mono text-[#FF4D57] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#E50914]" />
            <span>{error}</span>
          </div>
        )}

        {successData ? (
          <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Temporary Password Generated</span>
            </div>
            <p className="text-[#9E9EA4] leading-relaxed">
              Use this temporary credential to sign in:
            </p>
            <div className="p-3 bg-[#17181F] border border-white/10 rounded-lg text-white font-bold text-center tracking-wider text-sm select-all">
              {successData.tempPass}
            </div>
            <Link
              to="/login"
              className="block w-full py-2.5 bg-[#E50914] text-white rounded-lg text-center uppercase tracking-wider font-semibold hover:bg-[#c20811] transition-all"
            >
              Proceed to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5">
                Registered University Email:
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#E50914] hover:bg-[#c20811] text-white rounded-xl text-xs font-mono uppercase tracking-wider font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Processing...' : 'Send Recovery Token'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link to="/login" className="text-xs font-mono text-[#8E8E93] hover:text-white inline-flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sign In</span>
          </Link>
        </div>

      </div>

    </div>
  );
};
