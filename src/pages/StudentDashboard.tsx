import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Activity,
  HeartHandshake,
  ArrowRight,
  Flame,
  AlertTriangle,
  FileText,
  Calendar,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getStudentDashboard();
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load student dashboard.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-[#0B0C0E] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-32 bg-[#111216] border border-white/10 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="h-28 bg-[#111216] border border-white/10 rounded-2xl animate-pulse" />
            <div className="h-28 bg-[#111216] border border-white/10 rounded-2xl animate-pulse" />
            <div className="h-28 bg-[#111216] border border-white/10 rounded-2xl animate-pulse" />
            <div className="h-28 bg-[#111216] border border-white/10 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-[#0B0C0E] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto p-6 bg-[#111216] border border-[#E50914]/40 rounded-2xl text-xs font-mono space-y-4">
          <div className="flex items-center gap-2.5 text-white font-['Outfit'] text-base font-semibold">
            <AlertTriangle className="w-5 h-5 text-[#E50914]" />
            <span>Dashboard Synchronization Error</span>
          </div>
          <p className="text-[#9E9EA4]">{error}</p>
          <button
            onClick={loadDashboard}
            className="px-5 py-2.5 bg-[#E50914] text-white rounded-full font-mono text-xs uppercase tracking-wider hover:bg-[#c20811] transition-all cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const { student, latestAssessment, latestRecommendations, history, totalAssessments, counsellingRequests } = dashboardData;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#0B0C0E] text-[#EDEDED] relative overflow-hidden py-8">
      {/* Background radial crimson glow */}
      <div className="absolute top-20 right-1/4 w-[600px] h-[500px] bg-[#E50914]/[0.05] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        
        {/* Welcome Banner — Editorial Poster Style */}
        <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative shadow-2xl hover:border-[#E50914]/30 transition-all">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="w-4 h-[2px] bg-[#E50914]" />
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A1A1AA]">
                DOSSIER · STD-{student.id.toString().padStart(4, '0')}
              </span>
              <span className="text-white/20">|</span>
              <span className="text-xs text-[#8E8E93] font-mono">{student.course}</span>
              <span className="text-white/20">|</span>
              <span className="text-xs text-[#8E8E93] font-mono">{student.academic_year}</span>
            </div>

            <h1 className="font-['Outfit'] text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Command Console: {student.name}
            </h1>

            <p className="text-sm text-[#9E9EA4] max-w-2xl font-light leading-relaxed">
              Diagnostic overview, detected contributing factor telemetry, and confidential campus counselling access.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/assessment"
              className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#E50914] hover:bg-[#c20811] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-md group"
            >
              <Activity className="w-4 h-4 text-white" />
              <span>{latestAssessment ? 'Retake Screening' : 'Start 20-Item Screening'}</span>
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-3 h-3 text-white" />
              </div>
            </Link>
            <Link
              to="/counsellor"
              className="inline-flex items-center gap-2 px-5 py-3.5 bg-[#17181F] hover:bg-[#1f2029] text-white border border-white/10 hover:border-white/20 rounded-full text-xs font-medium uppercase tracking-wider transition-all"
            >
              <HeartHandshake className="w-4 h-4 text-[#E50914]" />
              <span>Counselling</span>
            </Link>
          </div>
        </div>

        {/* Main Body */}
        {!latestAssessment ? (
          /* Empty State */
          <div className="bg-[#111216] border border-white/10 rounded-2xl p-12 text-center max-w-2xl mx-auto space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-[#E50914]/10 border border-[#E50914]/30 text-white font-['Outfit'] font-bold text-2xl flex items-center justify-center mx-auto">
              SP<span className="text-[#E50914]">.</span>
            </div>
            <div className="space-y-2">
              <h2 className="font-['Outfit'] text-2xl font-bold tracking-tight text-white">
                No Assessment Recorded Yet
              </h2>
              <p className="text-sm text-[#9E9EA4] leading-relaxed max-w-md mx-auto font-light">
                Complete your first 20-item stress inventory to establish your baseline score, category classification, and personalized guidance dossier.
              </p>
            </div>
            <Link
              to="/assessment"
              className="inline-flex items-center gap-3 px-7 py-3.5 bg-[#E50914] text-white font-semibold text-xs uppercase tracking-wider rounded-full hover:bg-[#c20811] transition-all shadow-md group"
            >
              <span>Begin 20-Item Screening</span>
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-3 h-3 text-white" />
              </div>
            </Link>
          </div>
        ) : (
          /* Populated Dashboard */
          <div className="space-y-8">
            
            {/* Top 4 Poster Metric Cards Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Metric 1: Stress Classification */}
              <div className="bg-[#111216] border border-white/10 rounded-2xl p-5 relative overflow-hidden transition-all hover:border-[#E50914]/40">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">
                    Classification
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse" />
                </div>
                <div className="mt-3">
                  <span className={`inline-block font-['Outfit'] font-bold text-2xl tracking-tight ${
                    latestAssessment.stressLevel === 'High'
                      ? 'text-[#E50914]'
                      : latestAssessment.stressLevel === 'Moderate'
                      ? 'text-[#F59E0B]'
                      : 'text-[#10B981]'
                  }`}>
                    {latestAssessment.stressLevel} Stress
                  </span>
                </div>
                <p className="font-mono text-[10px] text-[#71717A] mt-2">
                  EVALUATED: {new Date(latestAssessment.completedAt).toLocaleDateString()}
                </p>
              </div>

              {/* Metric 2: Score */}
              <div className="bg-[#111216] border border-white/10 rounded-2xl p-5 relative overflow-hidden transition-all hover:border-[#E50914]/40">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">
                    Inventory Score
                  </span>
                  <span className="font-mono text-[11px] text-[#71717A]">40 MAX</span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-['Outfit'] text-4xl font-extrabold text-white">
                    {latestAssessment.totalScore}
                  </span>
                  <span className="font-mono text-xs text-[#71717A]">/ 40 PTS</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 mt-3 rounded-full overflow-hidden">
                  <div
                    className="bg-[#E50914] h-full rounded-full transition-all duration-500"
                    style={{ width: `${(latestAssessment.totalScore / 40) * 100}%` }}
                  />
                </div>
              </div>

              {/* Metric 3: Stress Area */}
              <div className="bg-[#111216] border border-white/10 rounded-2xl p-5 relative overflow-hidden transition-all hover:border-[#E50914]/40">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A1A1AA] block">
                  Reported Focus Area
                </span>
                <div className="mt-3 font-['Outfit'] text-2xl font-bold text-white">
                  {latestAssessment.stressArea}
                </div>
                <p className="font-mono text-[10px] text-[#71717A] mt-2">
                  SCREENING DOMAIN
                </p>
              </div>

              {/* Metric 4: History count */}
              <div className="bg-[#111216] border border-white/10 rounded-2xl p-5 relative overflow-hidden transition-all hover:border-[#E50914]/40">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A1A1AA] block">
                  Completed Screenings
                </span>
                <div className="mt-3 font-['Outfit'] text-2xl font-bold text-white">
                  {totalAssessments} {totalAssessments === 1 ? 'Record' : 'Records'}
                </div>
                <Link to="/history" className="text-[11px] font-mono text-[#E50914] uppercase tracking-wider hover:underline mt-2 inline-flex items-center gap-1">
                  <span>View Archive</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

            </div>

            {/* Two-Column Poster Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left: Contributing Factors Briefing */}
              <div className="lg:col-span-7 bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-[2px] bg-[#E50914]" />
                      <h2 className="font-['Outfit'] text-xl font-bold text-white">
                        Detected Contributing Factors
                      </h2>
                    </div>
                    <p className="font-mono text-xs text-[#8E8E93]">
                      Identified from affirmative questionnaire responses.
                    </p>
                  </div>
                  <Link
                    to={`/results/${latestAssessment.id}`}
                    className="text-xs font-mono text-[#E50914] uppercase tracking-wider hover:underline flex items-center gap-1"
                  >
                    <span>Full Result</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {latestAssessment.contributingFactors?.length > 0 ? (
                    latestAssessment.contributingFactors.map((f: string, i: number) => (
                      <div
                        key={i}
                        className="p-3.5 bg-[#17181F] border border-white/5 rounded-xl flex items-center justify-between text-xs hover:border-white/15 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#E50914]/15 border border-[#E50914]/40 text-[#E50914] font-mono text-[11px] flex items-center justify-center font-bold">
                            0{i + 1}
                          </span>
                          <span className="font-medium text-white tracking-wide">
                            {f}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-[#E50914] uppercase tracking-wider">
                          Affirmative
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-[#17181F] rounded-xl text-xs text-[#8E8E93] text-center font-mono">
                      No acute contributing factors detected in this screening session.
                    </div>
                  )}
                </div>

                {/* High stress alert banner */}
                {latestAssessment.stressLevel === 'High' && (
                  <div className="p-5 bg-[#E50914]/10 border border-[#E50914]/40 rounded-xl text-white space-y-3">
                    <div className="flex items-center gap-2.5 text-sm font-['Outfit'] font-bold text-white">
                      <ShieldAlert className="w-5 h-5 text-[#E50914] shrink-0" />
                      <span>Elevated Stress Threshold Reached (Score 27–40)</span>
                    </div>
                    <p className="text-xs text-[#9E9EA4] leading-relaxed">
                      A privacy-preserving summary has been flagged for campus wellness staff. Your individual question answers remain confidential.
                    </p>
                    <div className="pt-1 flex flex-wrap gap-3">
                      <Link
                        to="/counsellor"
                        className="px-4 py-2 bg-[#E50914] hover:bg-[#c20811] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all"
                      >
                        Submit Support Case
                      </Link>
                      <Link
                        to="/anonymous-counselling"
                        className="px-4 py-2 bg-[#17181F] hover:bg-[#1f2029] text-white border border-white/10 rounded-full text-xs font-semibold uppercase tracking-wider transition-all"
                      >
                        Open Anonymous Room
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Personalized Guidance */}
              <div className="lg:col-span-5 bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-[2px] bg-[#E50914]" />
                      <h2 className="font-['Outfit'] text-xl font-bold text-white">
                        Targeted Guidance
                      </h2>
                    </div>
                    <p className="font-mono text-xs text-[#8E8E93]">
                      Action plan for {latestAssessment.stressLevel} stress.
                    </p>
                  </div>
                  <Link
                    to="/recommendations"
                    className="text-xs font-mono text-[#E50914] uppercase tracking-wider hover:underline"
                  >
                    All Guidance &rarr;
                  </Link>
                </div>

                <div className="space-y-3">
                  {latestRecommendations?.slice(0, 4).map((rec: any, idx: number) => (
                    <div key={idx} className="p-4 bg-[#17181F] border border-white/5 rounded-xl text-xs space-y-1.5 hover:border-white/15 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#E50914] font-semibold">
                          {rec.category}
                        </span>
                        <span className="font-mono text-[10px] text-[#71717A]">
                          LEVEL: {rec.stress_level || latestAssessment.stressLevel}
                        </span>
                      </div>
                      <p className="text-xs text-[#EDEDED] leading-relaxed font-light">
                        {rec.suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Assessment History Table */}
            <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-[2px] bg-[#E50914]" />
                    <h2 className="font-['Outfit'] text-xl font-bold text-white">
                      Recent Screening Timeline
                    </h2>
                  </div>
                  <p className="font-mono text-xs text-[#8E8E93]">
                    Verified database records of past inventories.
                  </p>
                </div>
                <Link to="/history" className="text-xs font-mono text-[#E50914] uppercase tracking-wider hover:underline">
                  Full Archive &rarr;
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA]">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Domain Focus</th>
                      <th className="py-3 px-4 text-center">Score</th>
                      <th className="py-3 px-4">Classification</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {history.map((h: any) => (
                      <tr key={h.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[#8E8E93]">
                          {new Date(h.completedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-white font-medium">
                          {h.stressArea}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-[#E50914]">
                          {h.totalScore} / 40
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                            h.stressLevel === 'High'
                              ? 'bg-[#E50914]/15 text-[#E50914] border border-[#E50914]/30'
                              : h.stressLevel === 'Moderate'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {h.stressLevel}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link to={`/results/${h.id}`} className="text-xs font-mono text-[#E50914] hover:underline">
                            View Dossier &rarr;
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
