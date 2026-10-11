import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  HeartHandshake,
  ShieldCheck,
  Video,
  UserCheck,
  Lock,
  FileText,
  ArrowRight
} from 'lucide-react';

export const CounsellingSupportPage: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await api.getMyCounsellingRequests();
      setRequests(res.requests);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch counselling requests.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#0B0C0E] text-[#EDEDED] relative overflow-hidden py-8">
      {/* Background radial crimson glow */}
      <div className="absolute top-20 right-1/4 w-[600px] h-[450px] bg-[#E50914]/[0.05] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        
        {/* Header */}
        <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="w-4 h-[2px] bg-[#E50914]" />
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A1A1AA]">
                CONFIDENTIAL SUPPORT
              </span>
            </div>
            <h1 className="font-['Outfit'] text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Campus Counselling Services
            </h1>
            <p className="text-sm text-[#9E9EA4] max-w-2xl font-light leading-relaxed">
              High-stress screening scores generate privacy-preserving summary reports for review by Dr. Evelyn Reed. Individual Yes/No answers remain strictly confidential.
            </p>
          </div>

          <Link
            to="/anonymous-counselling"
            className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#E50914] hover:bg-[#c20811] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-md group whitespace-nowrap shrink-0"
          >
            <Video className="w-4 h-4 text-white" />
            <span>Anonymous WebRTC Room</span>
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
              <ArrowRight className="w-3 h-3 text-white" />
            </div>
          </Link>
        </div>

        {/* 3 Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-3 shadow-xl hover:border-[#E50914]/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#17181F] border border-white/10 text-[#E50914] flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="font-['Outfit'] text-lg font-bold text-white tracking-tight">Licensed Counsellor</h3>
            <p className="text-xs text-[#9E9EA4] leading-relaxed font-light">
              Dr. Evelyn Reed, Ph.D., provides structured assistance on exam anxiety, coursework overload, and schedule restructuring.
            </p>
          </div>

          <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-3 shadow-xl hover:border-[#E50914]/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#17181F] border border-white/10 text-[#E50914] flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-['Outfit'] text-lg font-bold text-white tracking-tight">Strict Privacy Protocol</h3>
            <p className="text-xs text-[#9E9EA4] leading-relaxed font-light">
              The counsellor only receives a summarized report (stress area, level, total score, and top factors). Raw answers are withheld.
            </p>
          </div>

          <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-3 shadow-xl hover:border-[#E50914]/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#17181F] border border-white/10 text-[#E50914] flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-['Outfit'] text-lg font-bold text-white tracking-tight">Zero-Disclosure Option</h3>
            <p className="text-xs text-[#9E9EA4] leading-relaxed font-light">
              Prefer not to disclose your student identity? Use the Anonymous Room to connect via encrypted WebRTC without student account logs.
            </p>
          </div>
        </div>

        {/* Requests Section */}
        <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="border-b border-white/10 pb-4 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-[2px] bg-[#E50914]" />
                <h2 className="font-['Outfit'] text-xl font-bold text-white">
                  Formal Support Cases
                </h2>
              </div>
              <p className="font-mono text-xs text-[#8E8E93]">
                Status tracking for reports submitted through completed assessments.
              </p>
            </div>
            <span className="font-mono text-xs text-[#E50914] font-semibold">
              {requests.length} {requests.length === 1 ? 'Case' : 'Cases'}
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center font-mono text-xs text-[#8E8E93] animate-pulse">Loading cases...</div>
          ) : requests.length === 0 ? (
            <div className="py-10 text-center font-mono text-xs text-[#8E8E93] space-y-2">
              <p>You have no pending or reviewed counselling cases.</p>
              <p className="text-[11px] text-[#71717A]">
                When you complete an assessment, you can submit a Summarized Student Stress Report directly from the results page.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => {
                let parsedSummary: any = null;
                try {
                  parsedSummary = JSON.parse(req.summary);
                } catch {}

                return (
                  <div key={req.id} className="p-5 bg-[#17181F] border border-white/5 rounded-2xl space-y-3.5 font-mono text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-white text-sm">CASE #{req.id}</span>
                        <span className="text-white/20">|</span>
                        <span className="text-[#8E8E93]">ASSIGNED: {req.counsellor_name || 'Dr. Evelyn Reed'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          req.status === 'Resolved'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-[#E50914]/15 text-[#E50914] border border-[#E50914]/30'
                        }`}>
                          {req.status}
                        </span>
                        <span className="text-[11px] text-[#71717A]">
                          {new Date(req.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {parsedSummary && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-[#8E8E93] pt-1">
                        <div>AREA: <span className="text-white font-medium ml-1">{parsedSummary.stressArea}</span></div>
                        <div>LEVEL: <span className="text-[#E50914] font-medium ml-1">{parsedSummary.stressLevel}</span></div>
                        <div>SCORE: <span className="text-white font-medium ml-1">{parsedSummary.totalScore}/40</span></div>
                        <div>FACTORS: <span className="text-white ml-1">{parsedSummary.contributingFactors?.slice(0, 2).join(', ')}</span></div>
                      </div>
                    )}

                    {req.notes && (
                      <div className="p-3 bg-[#111216] border border-white/10 rounded-xl text-xs text-[#EDEDED] mt-2">
                        <span className="text-[#E50914] font-medium block mb-1 text-[11px] uppercase tracking-wider">
                          Counsellor Review Notes:
                        </span>
                        <p className="font-sans font-light leading-relaxed">{req.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
