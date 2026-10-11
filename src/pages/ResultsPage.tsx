import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { AssessmentResult } from '../types';
import {
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  ArrowRight,
  RotateCcw,
  ShieldAlert,
  Flame,
  FileText
} from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [requestNote, setRequestNote] = useState('');
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadResult(id);
    }
  }, [id]);

  const loadResult = async (assessmentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAssessmentResult(assessmentId);
      setResult(res.assessment);
    } catch (err: any) {
      setError(err.message || 'Failed to load assessment results.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCounsellingRequest = async () => {
    if (!result) return;
    setRequestSubmitting(true);
    try {
      const res = await api.requestCounselling({
        assessmentId: result.id,
        note: requestNote
      });
      setRequestSuccess(res.message);
      loadResult(result.id.toString());
    } catch (err: any) {
      setError(err.message || 'Could not submit counselling request.');
    } finally {
      setRequestSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-[#0B0C0E] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="h-40 bg-[#111216] border border-white/10 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-[#111216] border border-white/10 rounded-2xl animate-pulse" />
            <div className="h-64 bg-[#111216] border border-white/10 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-[#0B0C0E] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto p-8 bg-[#111216] border border-[#E50914]/40 rounded-2xl text-xs font-mono space-y-4">
          <div className="flex items-center gap-2.5 text-white font-['Outfit'] text-base font-semibold">
            <AlertTriangle className="w-5 h-5 text-[#E50914]" />
            <span>Result Retrieval Error</span>
          </div>
          <p className="text-[#9E9EA4]">{error || 'Assessment record could not be found.'}</p>
          <Link to="/dashboard" className="inline-block px-5 py-2.5 bg-[#E50914] text-white rounded-full font-mono text-xs uppercase tracking-wider hover:bg-[#c20811] transition-all">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#0B0C0E] text-[#EDEDED] relative overflow-hidden py-8">
      {/* Background radial crimson glow */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-[#E50914]/[0.05] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        
        {/* Top Banner with Massive Score Display */}
        <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-7 shadow-2xl relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="w-4 h-[2px] bg-[#E50914]" />
                <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A1A1AA]">
                  DOSSIER ASM-{result.id.toString().padStart(4, '0')}
                </span>
                <span className="text-white/20">|</span>
                <span className="text-xs text-[#8E8E93] font-mono">DOMAIN: {result.stressArea}</span>
                <span className="text-white/20">|</span>
                <span className="text-xs text-[#8E8E93] font-mono">{new Date(result.completedAt).toLocaleDateString()}</span>
              </div>
              <h1 className="font-['Outfit'] text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                Prediction Analysis & Score
              </h1>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                to="/assessment"
                className="px-4 py-2.5 bg-[#17181F] border border-white/10 hover:border-white/25 text-white font-mono rounded-full text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#E50914]" />
                <span>Retake</span>
              </Link>
              <Link
                to="/history"
                className="px-5 py-2.5 bg-[#E50914] text-white font-mono rounded-full text-xs uppercase tracking-wider hover:bg-[#c20811] transition-all shadow-md"
              >
                <span>Archive Log</span>
              </Link>
            </div>
          </div>

          {/* Score & Category Stencil Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            <div className="md:col-span-5 bg-[#17181F] border border-white/10 rounded-2xl p-6 text-center space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A1A1AA] block">
                Cumulative Inventory Score
              </span>
              <div className="font-['Outfit'] text-6xl sm:text-7xl font-extrabold text-white tracking-tight leading-none pt-2">
                {result.totalScore}
                <span className="text-2xl font-normal text-[#71717A]"> / 40</span>
              </div>
              <p className="font-mono text-[10px] text-[#71717A] pt-1 uppercase">
                0–40 Certified Screening Scale
              </p>
            </div>

            <div className="md:col-span-7 space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">
                  Prediction Level:
                </span>
                <span className={`px-3 py-1 rounded-full font-mono text-xs uppercase tracking-wider font-semibold ${
                  result.stressLevel === 'High'
                    ? 'bg-[#E50914]/15 text-[#E50914] border border-[#E50914]/40'
                    : result.stressLevel === 'Moderate'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40'
                }`}>
                  {result.stressLevel} Stress
                </span>
              </div>

              {/* Threshold Gauge */}
              <div className="w-full bg-[#17181F] h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#E50914] rounded-full transition-all duration-500"
                  style={{ width: `${(result.totalScore / 40) * 100}%` }}
                />
              </div>

              <div className="flex justify-between font-mono text-[10px] text-[#71717A]">
                <span>LOW (0–13)</span>
                <span>MODERATE (14–26)</span>
                <span>HIGH (27–40)</span>
              </div>

              <p className="text-xs sm:text-sm text-[#9E9EA4] leading-relaxed font-light pt-1">
                {result.stressLevel === 'Low' && 'Your score reflects balanced routine resilience. General preventative wellness habits and short breaks will help maintain your baseline.'}
                {result.stressLevel === 'Moderate' && 'Your score shows notable strain across specific academic or lifestyle categories. Structured planning, break schedules, and sleep protection are recommended.'}
                {result.stressLevel === 'High' && 'Your score suggests significant cumulative fatigue and pressure. We strongly advise taking advantage of confidential campus counselling support.'}
              </p>
            </div>

          </div>

        </div>

        {/* Options Distribution Analytics Strip */}
        {(() => {
          const opt = result.optionDistribution || {
            yesCount: Math.min(20, Math.floor(result.totalScore / 2)),
            sometimesCount: result.totalScore % 2 === 1 ? 1 : 0,
            noCount: Math.max(0, 20 - Math.min(20, Math.floor(result.totalScore / 2)) - (result.totalScore % 2 === 1 ? 1 : 0)),
            yesPercentage: Math.round((Math.min(20, Math.floor(result.totalScore / 2)) / 20) * 100),
            sometimesPercentage: Math.round(((result.totalScore % 2 === 1 ? 1 : 0) / 20) * 100),
            noPercentage: Math.round((Math.max(0, 20 - Math.min(20, Math.floor(result.totalScore / 2)) - (result.totalScore % 2 === 1 ? 1 : 0)) / 20) * 100)
          };

          return (
            <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-[2px] bg-[#E50914]" />
                    <h2 className="font-['Outfit'] text-xl font-bold text-white">
                      Options Logic Breakdown & Responses
                    </h2>
                  </div>
                  <p className="font-mono text-xs text-[#8E8E93]">
                    Distribution of 20 diagnostic responses across scoring weights.
                  </p>
                </div>
                <span className="text-xs font-mono text-[#8E8E93]">
                  20 Validated Items
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-[#17181F] border border-[#E50914]/20 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#E50914] font-semibold">Yes (+2 Pts each)</span>
                  <div className="font-['Outfit'] text-2xl font-bold text-white">{opt.yesCount} <span className="text-xs text-[#8E8E93]">({opt.yesPercentage}%)</span></div>
                  <p className="text-[11px] text-[#9E9EA4]">Acute triggers contributing {opt.yesCount * 2} points</p>
                </div>

                <div className="p-4 bg-[#17181F] border border-amber-500/20 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold">Sometimes (+1 Pt each)</span>
                  <div className="font-['Outfit'] text-2xl font-bold text-white">{opt.sometimesCount} <span className="text-xs text-[#8E8E93]">({opt.sometimesPercentage}%)</span></div>
                  <p className="text-[11px] text-[#9E9EA4]">Emerging stressors contributing {opt.sometimesCount * 1} points</p>
                </div>

                <div className="p-4 bg-[#17181F] border border-emerald-500/20 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">No (0 Pts)</span>
                  <div className="font-['Outfit'] text-2xl font-bold text-white">{opt.noCount} <span className="text-xs text-[#8E8E93]">({opt.noPercentage}%)</span></div>
                  <p className="text-[11px] text-[#9E9EA4]">Protective resilience domains (0 points added)</p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Two Columns: Factors & Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Contributing Factors */}
          <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xl">
            <div className="border-b border-white/10 pb-3 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-[2px] bg-[#E50914]" />
                <h2 className="font-['Outfit'] text-xl font-bold text-white">
                  Contributing Factors
                </h2>
              </div>
              <p className="font-mono text-xs text-[#8E8E93]">
                Dimensions contributing most heavily to your score.
              </p>
            </div>

            <div className="space-y-2.5">
              {result.contributingFactors?.map((f, i) => (
                <div key={i} className="p-3.5 bg-[#17181F] border border-white/5 rounded-xl flex items-center justify-between text-xs font-mono">
                  <span className="text-white font-medium tracking-wide">
                    {f}
                  </span>
                  <span className="text-[#E50914] font-semibold">FACTOR #{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Personalized Guidance */}
          <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xl">
            <div className="border-b border-white/10 pb-3 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-[2px] bg-[#E50914]" />
                <h2 className="font-['Outfit'] text-xl font-bold text-white">
                  Targeted Guidance
                </h2>
              </div>
              <p className="font-mono text-xs text-[#8E8E93]">
                Actionable habits matched to {result.stressLevel} stress.
              </p>
            </div>

            <div className="space-y-3">
              {result.recommendations?.map((rec) => (
                <div key={rec.id} className="p-4 bg-[#17181F] border border-white/5 rounded-xl text-xs space-y-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#E50914] font-semibold">
                    {rec.category}
                  </span>
                  <p className="text-xs text-[#EDEDED] leading-relaxed font-light">
                    {rec.suggestion}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* SUMMARIZED STUDENT STRESS REPORT & COUNSELLING REFERRAL */}
        <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
          <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="w-4 h-[2px] bg-[#E50914]" />
                <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A1A1AA]">
                  CONFIDENTIAL DOSSIER
                </span>
              </div>
              <h2 className="font-['Outfit'] text-2xl font-bold tracking-tight text-white">
                Summarized Student Stress Report
              </h2>
            </div>
            <Link
              to="/anonymous-counselling"
              className="inline-flex items-center gap-2 text-xs font-mono text-[#E50914] uppercase tracking-wider hover:underline"
            >
              <span>Launch Anonymous WebRTC Room</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Privacy Safeguarded Clinical Report Card */}
          <div className="bg-[#17181F] border border-white/10 rounded-2xl p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-white font-medium uppercase tracking-wider">
                Privacy Safeguarded Summary Dossier
              </span>
              <span className="text-[#E50914]">ASM-{result.id.toString().padStart(4, '0')}</span>
            </div>

            <p className="text-xs text-[#9E9EA4] leading-relaxed font-sans font-light">
              Privacy Policy Notice: In accordance with academic wellbeing standards, your individual Yes/Sometimes/No questionnaire answers are strictly withheld. The counsellor only receives the summarized diagnostic indicators below.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-white/10">
              <div>
                <span className="text-[10px] text-[#71717A] block uppercase tracking-wider">Primary Area</span>
                <span className="font-bold text-white uppercase text-sm mt-0.5 block">{result.stressArea}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#71717A] block uppercase tracking-wider">Classification</span>
                <span className="font-bold text-[#E50914] uppercase text-sm mt-0.5 block">{result.stressLevel} Stress</span>
              </div>
              <div>
                <span className="text-[10px] text-[#71717A] block uppercase tracking-wider">Total Score</span>
                <span className="font-['Outfit'] font-bold text-white text-base mt-0.5 block">{result.totalScore} / 40</span>
              </div>
              <div>
                <span className="text-[10px] text-[#71717A] block uppercase tracking-wider">Screening Date</span>
                <span className="font-medium text-white text-xs mt-0.5 block">{new Date(result.completedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {result.counsellingRequest ? (
            <div className="p-4 bg-[#17181F] border border-[#E50914]/40 rounded-xl text-xs font-mono space-y-2">
              <div className="flex items-center gap-2 text-white font-['Outfit'] font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5 text-[#E50914]" />
                <span>Counselling Support Request Filed</span>
              </div>
              <p className="text-[#9E9EA4]">
                STATUS: <span className="font-bold text-white uppercase">{result.counsellingRequest.status}</span> · FILED ON {new Date(result.counsellingRequest.created_at).toLocaleDateString()}
              </p>
              <p className="text-[11px] text-[#71717A]">
                Campus counsellor Dr. Evelyn Reed will review this summarized report and contact you.
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#A1A1AA] mb-1.5">
                  Optional Student Note for Counsellor:
                </label>
                <textarea
                  rows={2}
                  value={requestNote}
                  onChange={(e) => setRequestNote(e.target.value)}
                  placeholder="Share any preferred meeting times or specific concerns (optional)..."
                  className="w-full px-4 py-3 bg-[#17181F] border border-white/10 rounded-xl focus:border-[#E50914] outline-none text-xs text-white placeholder-[#71717A]"
                />
              </div>

              <button
                type="button"
                disabled={requestSubmitting}
                onClick={handleCreateCounsellingRequest}
                className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#E50914] hover:bg-[#c20811] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-md group cursor-pointer disabled:opacity-50"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>{requestSubmitting ? 'Transmitting Report...' : 'Transmit Report to Counsellor'}</span>
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-3 h-3 text-white" />
                </div>
              </button>
            </div>
          )}

        </div>

        <div className="text-center font-mono text-[10px] text-[#71717A] max-w-xl mx-auto py-2">
          NOTICE: The Student Stress Prediction System is an academic early-screening instrument. It does not provide medical diagnoses or prescriptions.
        </div>

      </div>
    </div>
  );
};
