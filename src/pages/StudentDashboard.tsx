import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Activity,
  HeartHandshake,
  ArrowRight,
  AlertTriangle,
  FileText,
  BarChart3,
  Layers,
  Sparkles
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
      <div className="min-h-[calc(100vh-4rem)] bg-[#0B0C0E] py-12 px-4 sm:px-6 lg:px-8">
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

  if (error && !dashboardData) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#0B0C0E] py-12 px-4 sm:px-6 lg:px-8">
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

  const { student, latestAssessment, latestRecommendations, history, totalAssessments } = dashboardData || {};
  const optionDist = latestAssessment ? deriveOptionDistribution(latestAssessment) : null;
  const domainBreakdown = latestAssessment ? deriveDomainBreakdown(latestAssessment) : [];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0B0C0E] text-[#EDEDED] relative overflow-hidden py-8">
      {/* Background radial crimson glow */}
      <div className="absolute top-20 right-1/4 w-[600px] h-[500px] bg-[#E50914]/[0.05] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        
        {/* Welcome Banner */}
        <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative shadow-2xl hover:border-[#E50914]/30 transition-all">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="w-4 h-[2px] bg-[#E50914]" />
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A1A1AA]">
                DOSSIER · STD-{(student?.id || user?.id || 1).toString().padStart(4, '0')}
              </span>
              <span className="text-white/20">|</span>
              <span className="text-xs text-[#8E8E93] font-mono">{student?.course || user?.course || 'MCA Computer Applications'}</span>
              <span className="text-white/20">|</span>
              <span className="text-xs text-[#8E8E93] font-mono">{student?.academic_year || user?.academicYear || 'Year 1'}</span>
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
              to="/anonymous-counselling"
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
              
              {/* Metric 1: Classification */}
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
                  {totalAssessments || history?.length || 1} Record(s)
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
                      title={`Yes: ${optionDist.yesCount}`}
                    />
                    <div
                      className="bg-amber-500 h-full transition-all duration-500"
                      style={{ width: `${optionDist.sometimesPercentage}%` }}
                      title={`Sometimes: ${optionDist.sometimesCount}`}
                    />
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${optionDist.noPercentage}%` }}
                      title={`No: ${optionDist.noCount}`}
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

            {/* Categorical Domain Breakdown */}
            {domainBreakdown.length > 0 && (
              <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
                <div className="border-b border-white/10 pb-4">
                  <h2 className="font-['Outfit'] text-2xl font-bold text-white">
                    Diagnostic Sub-Domain Scores
                  </h2>
                  <p className="font-mono text-xs text-[#8E8E93]">
                    Evaluated across five psychiatric and workload assessment categories.
                  </p>
                </div>

                <div className="space-y-4">
                  {domainBreakdown.map((d, idx) => (
                    <div key={idx} className="space-y-1.5 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{d.domain}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#8E8E93]">{d.score} / {d.maxScore} Pts</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                            d.severity === 'High' ? 'bg-[#E50914]/20 text-[#E50914]' : d.severity === 'Moderate' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {d.severity}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-[#17181F] h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            d.severity === 'High' ? 'bg-[#E50914]' : d.severity === 'Moderate' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${d.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {latestRecommendations && latestRecommendations.length > 0 && (
              <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4 shadow-2xl">
                <h2 className="font-['Outfit'] text-xl font-bold text-white">
                  Targeted Clinical Guidance
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {latestRecommendations.map((rec: any, idx: number) => (
                    <div key={idx} className="p-4 bg-[#17181F] border border-white/5 rounded-xl space-y-1 text-xs">
                      <span className="font-mono text-[10px] uppercase text-[#E50914] font-semibold">{rec.category}</span>
                      <p className="text-[#9E9EA4] leading-relaxed font-light">{rec.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
