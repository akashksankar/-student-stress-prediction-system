import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { FileText, ArrowRight, Activity, Calendar, ShieldCheck } from 'lucide-react';

export const AssessmentHistoryPage: React.FC = () => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getStudentAssessments();
      setAssessments(res.assessments || []);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve assessment history.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0B0C0E] text-[#EDEDED] relative overflow-hidden py-8">
      {/* Background radial crimson glow */}
      <div className="absolute top-20 right-1/3 w-[600px] h-[400px] bg-[#E50914]/[0.05] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7 relative z-10">
        
        {/* Header Banner */}
        <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="w-4 h-[2px] bg-[#E50914]" />
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A1A1AA]">
                ARCHIVE DOSSIER
              </span>
            </div>
            <h1 className="font-['Outfit'] text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Assessment History Log
            </h1>
            <p className="text-sm text-[#9E9EA4] font-light leading-relaxed">
              Historical ledger of all 20-item screening inventories completed under your encrypted profile.
            </p>
          </div>

          <Link
            to="/assessment"
            className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#E50914] hover:bg-[#c20811] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-md group shrink-0"
          >
            <Activity className="w-4 h-4 text-white" />
            <span>New Screening</span>
            <ArrowRight className="w-3 h-3 text-white" />
          </Link>
        </div>

        {loading ? (
          <div className="bg-[#111216] border border-white/10 rounded-2xl p-12 text-center font-mono text-xs text-[#8E8E93] animate-pulse">
            LOADING HISTORICAL ARCHIVES...
          </div>
        ) : error && assessments.length === 0 ? (
          <div className="p-4 bg-[#E50914]/10 border border-[#E50914]/40 rounded-xl text-xs font-mono text-[#FF4D57]">
            {error}
          </div>
        ) : assessments.length === 0 ? (
          <div className="bg-[#111216] border border-white/10 rounded-2xl p-12 text-center space-y-4 shadow-xl max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#71717A]">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-['Outfit'] text-xl font-bold text-white">No Past Records Detected</h3>
              <p className="text-xs text-[#9E9EA4] font-light">Complete your first assessment to record a diagnostic baseline.</p>
            </div>
            <Link
              to="/assessment"
              className="inline-block mt-2 px-6 py-3 bg-[#E50914] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#c20811] transition-all shadow-md"
            >
              Take First Assessment
            </Link>
          </div>
        ) : (
          <div className="bg-[#111216] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] bg-[#14151B]">
                    <th className="py-3.5 px-5">Record ID</th>
                    <th className="py-3.5 px-5">Date Completed</th>
                    <th className="py-3.5 px-5">Domain Focus</th>
                    <th className="py-3.5 px-5 text-center">Score</th>
                    <th className="py-3.5 px-5">Classification</th>
                    <th className="py-3.5 px-5 text-right">Dossier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {assessments.map((a) => (
                    <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5 text-[#E50914] font-bold">ASM-{a.id.toString().padStart(4, '0')}</td>
                      <td className="py-4 px-5 text-white">{new Date(a.completed_at || a.completedAt).toLocaleDateString()}</td>
                      <td className="py-4 px-5">{a.stress_area || a.stressArea} (20 Items)</td>
                      <td className="py-4 px-5 text-center text-white font-bold">{a.total_score || a.totalScore} / 40</td>
                      <td className="py-4 px-5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          (a.stress_level || a.stressLevel) === 'High'
                            ? 'bg-[#E50914]/20 text-[#E50914] border border-[#E50914]/40'
                            : (a.stress_level || a.stressLevel) === 'Moderate'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}>
                          {a.stress_level || a.stressLevel}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Link
                          to={`/results/${a.id}`}
                          className="text-[#E50914] hover:underline uppercase text-[11px] inline-flex items-center gap-1"
                        >
                          <span>View Report</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
