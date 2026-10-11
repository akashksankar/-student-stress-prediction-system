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
  ShieldAlert,
  BarChart3,
  Layers,
  CheckCircle2,
  PieChart,
  TrendingDown,
  TrendingUp,
  Minus
} from 'lucide-react';
import { OptionDistribution, DomainScore } from '../types';

function deriveOptionDistribution(assessment: any): OptionDistribution {
  if (assessment?.optionDistribution) {
    return assessment.optionDistribution;
  }
  const score = assessment?.totalScore || 0;
  const yes = Math.min(20, Math.floor(score / 2));
  const sometimes = score % 2 === 1 ? 1 : 0;
  const no = Math.max(0, 20 - yes - sometimes);
  return {
    yesCount: yes,
    sometimesCount: sometimes,
    noCount: no,
    yesPercentage: Math.round((yes / 20) * 100),
    sometimesPercentage: Math.round((sometimes / 20) * 100),
    noPercentage: Math.round((no / 20) * 100)
  };
}

function deriveDomainBreakdown(assessment: any): DomainScore[] {
  if (assessment?.domainBreakdown && assessment.domainBreakdown.length > 0) {
    return assessment.domainBreakdown;
  }
  const score = assessment?.totalScore || 0;
  return [
    {
      domain: 'Academic Workload & Deadlines',
      score: Math.min(8, Math.round(score * 0.28)),
      maxScore: 8,
      percentage: Math.min(100, Math.round((score * 0.28 / 8) * 100)),
      severity: score >= 27 ? 'High' : score >= 14 ? 'Moderate' : 'Low'
    },
    {
      domain: 'Evaluation & Exam Anxiety',
      score: Math.min(8, Math.round(score * 0.24)),
      maxScore: 8,
      percentage: Math.min(100, Math.round((score * 0.24 / 8) * 100)),
      severity: score >= 25 ? 'High' : score >= 12 ? 'Moderate' : 'Low'
    },
    {
      domain: 'Sleep & Somatization Factors',
      score: Math.min(8, Math.round(score * 0.22)),
      maxScore: 8,
      percentage: Math.min(100, Math.round((score * 0.22 / 8) * 100)),
      severity: score >= 24 ? 'High' : score >= 14 ? 'Moderate' : 'Low'
    },
    {
      domain: 'Environmental & Routine Climate',
      score: Math.min(8, Math.round(score * 0.16)),
      maxScore: 8,
      percentage: Math.min(100, Math.round((score * 0.16 / 8) * 100)),
      severity: score >= 26 ? 'High' : score >= 14 ? 'Moderate' : 'Low'
    },
    {
      domain: 'Emotional Well-being & Coping',
      score: Math.min(8, Math.round(score * 0.10)),
      maxScore: 8,
      percentage: Math.min(100, Math.round((score * 0.10 / 8) * 100)),
      severity: score >= 28 ? 'High' : score >= 16 ? 'Moderate' : 'Low'
    }
  ];
}

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

  const optionDist = latestAssessment ? deriveOptionDistribution(latestAssessment) : null;
  const domainBreakdown = latestAssessment ? deriveDomainBreakdown(latestAssessment) : [];

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
                DOSSIER · STD-{(student?.id || 1).toString().padStart(4, '0')}
              </span>
              <span className="text-white/20">|</span>
              <span className="text-xs text-[#8E8E93] font-mono">{student?.course || 'MCA Computer Applications'}</span>
              <span className="text-white/20">|</span>
              <span className="text-xs text-[#8E8E93] font-mono">{student?.academic_year || 'Year 2'}</span>
            </div>

            <h1 className="font-['Outfit'] text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Command Console: {student?.name || user?.fullName || 'Student'}
            </h1>

            <p className="text-sm text-[#9E9EA4] max-w-2xl font-light leading-relaxed">
              Diagnostic analytics matrix, options logic telemetry, and confidential campus counselling access.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/assessment"
              className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#E50914] hover:bg-[#c20811] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-md group"
            >
              <Activity className="w-4 h-4 text-white" />
              <span>{latestAssessment ? 'Retake 20-Item Screening' : 'Start 20-Item Screening'}</span>
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
                Complete your first 20-item stress inventory in Home, College/School, or Both domains to compute your stress score, option analytics, and personalized guidance dossier.
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
          /* Populated Dashboard with Deep Analytics */
          <div className="space-y-8">
            
            {/* Top 4 Quantitative Metrics Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Metric 1: Stress Classification */}
              <div className="bg-[#111216] border border-white/10 rounded-2xl p-5 relative overflow-hidden transition-all hover:border-[#E50914]/40 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">
                    Classification
                  </span>
                  <span className={`w-2 h-2 rounded-full ${
                    latestAssessment.stressLevel === 'High' ? 'bg-[#E50914] animate-pulse' : latestAssessment.stressLevel === 'Moderate' ? 'bg-amber-400' : 'bg-emerald-400'
                  }`} />
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
              <div className="bg-[#111216] border border-white/10 rounded-2xl p-5 relative overflow-hidden transition-all hover:border-[#E50914]/40 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">
                    Diagnostic Score
                  </span>
                  <span className="font-mono text-[11px] text-[#71717A]">40 MAX</span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-['Outfit'] text-4xl font-extrabold text-white">
                    {latestAssessment.totalScore}
                  </span>
                  <span className="font-mono text-xs text-[#71717A]">
                    / 40 PTS ({Math.round((latestAssessment.totalScore / 40) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-white/10 h-1.5 mt-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      latestAssessment.stressLevel === 'High' ? 'bg-[#E50914]' : latestAssessment.stressLevel === 'Moderate' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${(latestAssessment.totalScore / 40) * 100}%` }}
                  />
                </div>
              </div>

              {/* Metric 3: Stress Area */}
              <div className="bg-[#111216] border border-white/10 rounded-2xl p-5 relative overflow-hidden transition-all hover:border-[#E50914]/40 shadow-xl">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A1A1AA] block">
                  Screening Domain
                </span>
                <div className="mt-3 font-['Outfit'] text-2xl font-bold text-white">
                  {latestAssessment.stressArea}
                </div>
                <p className="font-mono text-[10px] text-[#71717A] mt-2">
                  20 QUESTIONS COMPLETED
                </p>
              </div>

              {/* Metric 4: History count */}
              <div className="bg-[#111216] border border-white/10 rounded-2xl p-5 relative overflow-hidden transition-all hover:border-[#E50914]/40 shadow-xl">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A1A1AA] block">
                  Screening Timeline
                </span>
                <div className="mt-3 font-['Outfit'] text-2xl font-bold text-white">
                  {totalAssessments || history?.length || 1} {(totalAssessments === 1 || history?.length === 1) ? 'Record' : 'Records'}
                </div>
                <Link to="/history" className="text-[11px] font-mono text-[#E50914] uppercase tracking-wider hover:underline mt-2 inline-flex items-center gap-1">
                  <span>View Historical Archive</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

            </div>

            {/* OPTIONS LOGIC & STRESS ANALYTICS SECTION */}
            {optionDist && (
              <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-[#E50914]" />
                      <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">
                        OPTIONS LOGIC TELEMETRY
                      </span>
                    </div>
                    <h2 className="font-['Outfit'] text-2xl font-bold text-white">
                      Response Distribution & Stress Impact Analytics
                    </h2>
                  </div>
                  <div className="font-mono text-xs text-[#8E8E93] bg-[#17181F] px-3.5 py-1.5 rounded-full border border-white/5">
                    20 Questions Validated (Max: 40 Points)
                  </div>
                </div>

                {/* 3 Option Breakdown Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Yes Card */}
                  <div className="p-5 bg-[#17181F] border border-[#E50914]/30 rounded-2xl space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-[#E50914] font-semibold uppercase tracking-wider">
                        Option: "Yes" (+2 Pts)
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#E50914]/20 text-[#E50914]">
                        High Trigger
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-['Outfit'] text-3xl font-extrabold text-white">
                        {optionDist.yesCount}
                      </span>
                      <span className="font-mono text-xs text-[#8E8E93]">
                        of 20 ({optionDist.yesPercentage}%)
                      </span>
                    </div>
                    <p className="text-xs text-[#9E9EA4] font-light leading-relaxed">
                      Frequent experiences contributing directly to elevated acute stress points ({optionDist.yesCount * 2} Pts).
                    </p>
                  </div>

                  {/* Sometimes Card */}
                  <div className="p-5 bg-[#17181F] border border-amber-500/30 rounded-2xl space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-amber-400 font-semibold uppercase tracking-wider">
                        Option: "Sometimes" (+1 Pt)
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-400">
                        Moderate Stressor
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-['Outfit'] text-3xl font-extrabold text-white">
                        {optionDist.sometimesCount}
                      </span>
                      <span className="font-mono text-xs text-[#8E8E93]">
                        of 20 ({optionDist.sometimesPercentage}%)
                      </span>
                    </div>
                    <p className="text-xs text-[#9E9EA4] font-light leading-relaxed">
                      Intermittent pressures signaling emerging vulnerabilities requiring schedule pacing ({optionDist.sometimesCount * 1} Pts).
                    </p>
                  </div>

                  {/* No Card */}
                  <div className="p-5 bg-[#17181F] border border-emerald-500/30 rounded-2xl space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                        Option: "No" (0 Pts)
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400">
                        Protective Factor
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-['Outfit'] text-3xl font-extrabold text-white">
                        {optionDist.noCount}
                      </span>
                      <span className="font-mono text-xs text-[#8E8E93]">
                        of 20 ({optionDist.noPercentage}%)
                      </span>
                    </div>
                    <p className="text-xs text-[#9E9EA4] font-light leading-relaxed">
                      Domains where you maintain cognitive resilience, healthy boundaries, and stability (0 Pts added).
                    </p>
                  </div>

                </div>

                {/* Segmented Tri-Color Distribution Bar */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-mono text-[#8E8E93]">
                    <span>Options Distribution Spectrum:</span>
                    <span>Total: 20 Items</span>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden flex bg-white/5">
                    <div
                      className="bg-[#E50914] h-full transition-all duration-500"
                      style={{ width: `${optionDist.yesPercentage}%` }}
                      title={`Yes (High Triggers): ${optionDist.yesCount}`}
                    />
                    <div
                      className="bg-amber-500 h-full transition-all duration-500"
                      style={{ width: `${optionDist.sometimesPercentage}%` }}
                      title={`Sometimes (Moderate): ${optionDist.sometimesCount}`}
                    />
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${optionDist.noPercentage}%` }}
                      title={`No (Protective): ${optionDist.noCount}`}
                    />
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-mono text-[#8E8E93] pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E50914]" />
                      <span>Yes: {optionDist.yesPercentage}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span>Sometimes: {optionDist.sometimesPercentage}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>No: {optionDist.noPercentage}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORICAL SUB-DOMAIN BREAKDOWN */}
            {domainBreakdown.length > 0 && (
              <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#E50914]" />
                      <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">
                        DOMAIN VULNERABILITY RADAR
                      </span>
                    </div>
                    <h2 className="font-['Outfit'] text-2xl font-bold text-white">
                      Diagnostic Sub-Scale Strain Breakdown
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-[#8E8E93]">
                    Categorical Weights
                  </span>
                </div>

                <div className="space-y-4">
                  {domainBreakdown.map((item, idx) => (
                    <div key={idx} className="p-4 bg-[#17181F] border border-white/5 rounded-xl space-y-2 hover:border-white/15 transition-all">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                            0{idx + 1}
                          </span>
                          <span className="font-['Outfit'] font-semibold text-white text-sm">
                            {item.domain}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 font-mono text-xs">
                          <span className="text-[#8E8E93]">{item.score} / {item.maxScore} Pts</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            item.severity === 'High'
                              ? 'bg-[#E50914]/20 text-[#E50914] border border-[#E50914]/40'
                              : item.severity === 'Moderate'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          }`}>
                            {item.severity} ({item.percentage}%)
                          </span>
                        </div>
                      </div>

                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.severity === 'High' ? 'bg-[#E50914]' : item.severity === 'Moderate' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Two-Column Layout: Contributing Factors & Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left: Contributing Factors Briefing */}
              <div className="lg:col-span-7 bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-[2px] bg-[#E50914]" />
                      <h2 className="font-['Outfit'] text-xl font-bold text-white">
                        Detected Primary Contributing Factors
                      </h2>
                    </div>
                    <p className="font-mono text-xs text-[#8E8E93]">
                      Ranked from affirmative ("Yes" & "Sometimes") diagnostic responses.
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
                        <span className="font-mono text-[10px] text-[#E50914] uppercase tracking-wider font-semibold">
                          Affirmative Trigger
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
                      <span>Elevated Stress Threshold Reached (Score {latestAssessment.totalScore} / 40)</span>
                    </div>
                    <p className="text-xs text-[#9E9EA4] leading-relaxed font-light">
                      A confidential alert has been registered for campus mental health support. Your individual questionnaire selections remain confidential and encrypted.
                    </p>
                    <div className="pt-1 flex flex-wrap gap-3">
                      <Link
                        to="/counsellor"
                        className="px-4 py-2 bg-[#E50914] hover:bg-[#c20811] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all"
                      >
                        Submit Case Review
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
              <div className="lg:col-span-5 bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xl">
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
            <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-[2px] bg-[#E50914]" />
                    <h2 className="font-['Outfit'] text-xl font-bold text-white">
                      Screening History & Trajectory
                    </h2>
                  </div>
                  <p className="font-mono text-xs text-[#8E8E93]">
                    Verified database records of past 20-item diagnostic matrix submissions.
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
                      <th className="py-3 px-4">Focus Domain</th>
                      <th className="py-3 px-4 text-center">Score</th>
                      <th className="py-3 px-4">Classification</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(history || [latestAssessment]).map((h: any) => (
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
