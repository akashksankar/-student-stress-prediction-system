import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, SEED_QUESTIONS } from '../services/api';
import { StressArea, AnswerChoice, Question } from '../types';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  School,
  Home as HomeIcon,
  Layers,
  Send,
  Zap,
  Activity,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [stressArea, setStressArea] = useState<StressArea>('Both');
  const [questions, setQuestions] = useState<Question[]>(() => {
    return SEED_QUESTIONS.filter(q => q.stressArea === 'Both').slice(0, 20).map((q, idx) => ({ ...q, index: idx + 1 }));
  });
  const [answers, setAnswers] = useState<{ [qId: number]: AnswerChoice }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);

  const loadAreaQuestions = async (area: StressArea) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getQuestions(area);
      if (res && Array.isArray(res.questions) && res.questions.length >= 20) {
        setQuestions(res.questions);
      } else {
        const fallback = SEED_QUESTIONS.filter(q => q.stressArea === area).slice(0, 20).map((q, idx) => ({ ...q, index: idx + 1 }));
        setQuestions(fallback.length >= 20 ? fallback : SEED_QUESTIONS.slice(0, 20).map((q, idx) => ({ ...q, index: idx + 1 })));
      }
    } catch {
      const fallback = SEED_QUESTIONS.filter(q => q.stressArea === area).slice(0, 20).map((q, idx) => ({ ...q, index: idx + 1 }));
      setQuestions(fallback.length >= 20 ? fallback : SEED_QUESTIONS.slice(0, 20).map((q, idx) => ({ ...q, index: idx + 1 })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAreaQuestions(stressArea);
    setActiveQuestionIndex(0);
  }, [stressArea]);

  const handleProceedToQuestions = async () => {
    if (questions.length < 20) {
      await loadAreaQuestions(stressArea);
    }
    setActiveQuestionIndex(0);
    setCurrentStep(2);
  };

  const handleSelectAnswer = (qId: number, choice: AnswerChoice) => {
    setAnswers(prev => ({ ...prev, [qId]: choice }));
    if (activeQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setActiveQuestionIndex(idx => Math.min(idx + 1, questions.length - 1));
      }, 150);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;

  const runningScore = Object.values(answers).reduce((acc, ans) => {
    if (ans === 'Yes') return acc + 2;
    if (ans === 'Sometimes') return acc + 1;
    return acc;
  }, 0);

  const yesCount = Object.values(answers).filter(a => a === 'Yes').length;
  const sometimesCount = Object.values(answers).filter(a => a === 'Sometimes').length;
  const noCount = Object.values(answers).filter(a => a === 'No').length;

  const projectedLevel: 'Low' | 'Moderate' | 'High' =
    runningScore >= 27 ? 'High' : runningScore >= 14 ? 'Moderate' : 'Low';

  const handleSubmitAssessment = async () => {
    if (!allAnswered) {
      setError('Please complete all 20 questionnaire items before submission.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payloadAnswers = questions.map(q => ({
        questionId: q.id,
        answer: answers[q.id]
      }));

      const res = await api.submitAssessment({
        stressArea,
        answers: payloadAnswers
      });

      navigate(`/results/${res.assessmentId}`);
    } catch (err: any) {
      setError(err.message || 'Submission failed.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0B0C0E] text-[#EDEDED] relative overflow-hidden py-8">
      {/* Background radial crimson glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-[#E50914]/[0.05] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7 relative z-10">
        
        {/* Header with Landing Page Kicker & Stepper */}
        <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="w-4 h-[2px] bg-[#E50914]" />
                <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A1A1AA]">
                  DIAGNOSTIC PROTOCOL
                </span>
                <span className="text-white/20">|</span>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#E50914]">
                  20-QUESTION INVENTORY
                </span>
              </div>
              <h1 className="font-['Outfit'] text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                Stress Assessment Matrix
              </h1>
            </div>

            {/* Stepper Markers */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`px-3 py-1.5 rounded-full uppercase tracking-wider text-[11px] font-medium transition-all cursor-pointer ${
                  currentStep === 1 ? 'bg-[#E50914] text-white shadow-sm' : 'bg-white/5 text-[#8E8E93] border border-white/10 hover:text-white'
                }`}
              >
                01 Focus Domain
              </button>
              <span className="text-white/20">/</span>
              <button
                type="button"
                onClick={() => {
                  if (questions.length < 20) {
                    loadAreaQuestions(stressArea);
                  }
                  setCurrentStep(2);
                }}
                className={`px-3 py-1.5 rounded-full uppercase tracking-wider text-[11px] font-medium transition-all cursor-pointer ${
                  currentStep === 2 ? 'bg-[#E50914] text-white shadow-sm' : 'bg-white/5 text-[#8E8E93] border border-white/10 hover:text-white'
                }`}
              >
                02 Questions (20)
              </button>
              <span className="text-white/20">/</span>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className={`px-3 py-1.5 rounded-full uppercase tracking-wider text-[11px] font-medium transition-all cursor-pointer ${
                  currentStep === 3 ? 'bg-[#E50914] text-white shadow-sm' : 'bg-white/5 text-[#8E8E93] border border-white/10 hover:text-white'
                }`}
              >
                03 Analytics Review
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-[#E50914]/10 border border-[#E50914]/40 rounded-xl text-xs font-mono text-[#FF4D57] flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#E50914]" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* STEP 1: STRESS AREA SELECTION */}
        {currentStep === 1 && (
          <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-7 shadow-2xl">
            <div className="space-y-1">
              <h2 className="font-['Outfit'] text-2xl font-bold text-white tracking-tight">
                Select Screening Focus Domain
              </h2>
              <p className="text-sm text-[#9E9EA4] font-light leading-relaxed">
                Choose the primary environment where your pressures originate. Every section contains a dedicated, comprehensive 20-item diagnostic questionnaire designed to calculate your exact stress level and domain triggers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              
              {/* Option: Home */}
              <button
                type="button"
                onClick={() => setStressArea('Home')}
                className={`p-6 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                  stressArea === 'Home'
                    ? 'border-[#E50914] bg-[#17181F] shadow-lg ring-1 ring-[#E50914]'
                    : 'border-white/10 bg-[#14151B] hover:border-white/20'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 text-[#E50914] flex items-center justify-center mb-4">
                  <HomeIcon className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-['Outfit'] text-lg font-bold text-white">Home Environment</h3>
                  <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-white/5 text-[#E50914] border border-[#E50914]/20">
                    20 Items
                  </span>
                </div>
                <p className="text-xs text-[#9E9EA4] mt-2 leading-relaxed font-light">
                  Family expectations, study space noise, domestic chores, financial worries, and household boundaries.
                </p>
                {stressArea === 'Home' && (
                  <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono text-[#E50914]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Selected Domain</span>
                  </div>
                )}
              </button>

              {/* Option: College/School */}
              <button
                type="button"
                onClick={() => setStressArea('College/School')}
                className={`p-6 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                  stressArea === 'College/School'
                    ? 'border-[#E50914] bg-[#17181F] shadow-lg ring-1 ring-[#E50914]'
                    : 'border-white/10 bg-[#14151B] hover:border-white/20'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 text-[#E50914] flex items-center justify-center mb-4">
                  <School className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-['Outfit'] text-lg font-bold text-white">College / Academics</h3>
                  <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-white/5 text-[#E50914] border border-[#E50914]/20">
                    20 Items
                  </span>
                </div>
                <p className="text-xs text-[#9E9EA4] mt-2 leading-relaxed font-light">
                  Continuous evaluation deadlines, exam panic, practical viva, professor communication, and placement stress.
                </p>
                {stressArea === 'College/School' && (
                  <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono text-[#E50914]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Selected Domain</span>
                  </div>
                )}
              </button>

              {/* Option: Both */}
              <button
                type="button"
                onClick={() => setStressArea('Both')}
                className={`p-6 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                  stressArea === 'Both'
                    ? 'border-[#E50914] bg-[#17181F] shadow-lg ring-1 ring-[#E50914]'
                    : 'border-white/10 bg-[#14151B] hover:border-white/20'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 text-[#E50914] flex items-center justify-center mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-['Outfit'] text-lg font-bold text-white">Both Domains</h3>
                  <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-white/5 text-[#E50914] border border-[#E50914]/20">
                    20 Items
                  </span>
                </div>
                <p className="text-xs text-[#9E9EA4] mt-2 leading-relaxed font-light">
                  Combined multidimensional matrix: sleep deprivation, physical somatization, commute, and digital burnout.
                </p>
                {stressArea === 'Both' && (
                  <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono text-[#E50914]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Selected Domain</span>
                  </div>
                )}
              </button>

            </div>

            <div className="p-4 bg-[#14151B] border border-white/5 rounded-xl flex items-center justify-between text-xs font-mono text-[#8E8E93]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#E50914]" />
                <span>Options Logic: Yes (+2 Pts) · Sometimes (+1 Pt) · No (0 Pts)</span>
              </div>
              <span className="text-white">Max Score: 40 Points</span>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                disabled={loading}
                onClick={handleProceedToQuestions}
                className="inline-flex items-center gap-3 px-7 py-3.5 bg-[#E50914] hover:bg-[#c20811] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-md group cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Initializing Question Matrix...' : `Load 20 ${stressArea} Questions`}</span>
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-3 h-3 text-white" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: 20 QUESTIONS MATRIX & LIVE STRESS TELEMETRY */}
        {currentStep === 2 && (
          <div className="space-y-6">
            
            {questions.length === 0 ? (
              <div className="bg-[#111216] border border-white/10 rounded-2xl p-12 text-center space-y-5 shadow-2xl">
                <RefreshCw className="w-10 h-10 text-[#E50914] mx-auto animate-spin" />
                <div className="space-y-1">
                  <h3 className="font-['Outfit'] text-xl font-bold text-white">Loading 20 {stressArea} Questions</h3>
                  <p className="text-xs text-[#9E9EA4]">Preparing your diagnostic assessment items...</p>
                </div>
                <button
                  type="button"
                  onClick={() => loadAreaQuestions(stressArea)}
                  className="px-6 py-2.5 bg-[#E50914] text-white rounded-full font-mono text-xs uppercase tracking-wider hover:bg-[#c20811] cursor-pointer"
                >
                  Load Questions Now
                </button>
              </div>
            ) : (
              <>
            {/* Live Telemetry Bar */}
            <div className="bg-[#111216] border border-white/10 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse" />
                  <span className="text-white font-medium">
                    Question {activeQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className="text-white/20">|</span>
                  <span className="text-[#8E8E93]">{answeredCount} of 20 Answered</span>
                </div>
                
                {/* Real-time Scoring Telemetry */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#71717A]">Projected Score:</span>
                    <span className="text-white font-bold">{runningScore}/40 Pts</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                    projectedLevel === 'High'
                      ? 'bg-[#E50914]/20 text-[#E50914] border border-[#E50914]/40'
                      : projectedLevel === 'Moderate'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}>
                    {projectedLevel} Stress
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#17181F] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#E50914] h-full rounded-full transition-all duration-300"
                  style={{ width: `${(answeredCount / 20) * 100}%` }}
                />
              </div>

              {/* Options Breakdown Pills */}
              <div className="flex items-center justify-between text-[11px] font-mono text-[#8E8E93] pt-1">
                <div className="flex items-center gap-3">
                  <span className="text-[#E50914]">Yes (Trigger): {yesCount}</span>
                  <span className="text-amber-400">Sometimes (Stressor): {sometimesCount}</span>
                  <span className="text-emerald-400">No (Protective): {noCount}</span>
                </div>
                <span>Domain: {stressArea}</span>
              </div>
            </div>

            {/* Active Question Box */}
            {(() => {
              const currentQ = questions[activeQuestionIndex] || questions[0];
              if (!currentQ) return null;
              const currentAnswer = answers[currentQ.id];

              return (
                <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-7 shadow-2xl relative">
                  <div className="flex items-center justify-between text-xs font-mono text-[#8E8E93] border-b border-white/10 pb-4">
                    <span className="text-[#E50914] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      CATEGORY: {currentQ.category}
                    </span>
                    <span>SECTION: {currentQ.stressArea}</span>
                  </div>

                  <div className="py-2">
                    <h2 className="font-['Outfit'] text-2xl sm:text-3xl lg:text-3xl font-bold text-white leading-snug tracking-tight">
                      {currentQ.questionText}
                    </h2>
                  </div>

                  {/* 3 High-Impact Choice Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* Choice: Yes */}
                    <button
                      type="button"
                      onClick={() => handleSelectAnswer(currentQ.id, 'Yes')}
                      className={`p-6 rounded-2xl border text-center transition-all cursor-pointer relative group ${
                        currentAnswer === 'Yes'
                          ? 'border-[#E50914] bg-[#E50914]/15 ring-2 ring-[#E50914] shadow-lg'
                          : 'border-white/10 bg-[#17181F] hover:border-white/25'
                      }`}
                    >
                      <span className="font-['Outfit'] text-2xl font-bold text-white block">Yes</span>
                      <span className={`font-mono text-[11px] block mt-1 tracking-wider ${
                        currentAnswer === 'Yes' ? 'text-[#E50914] font-bold' : 'text-[#8E8E93]'
                      }`}>
                        FREQUENT (+2 PTS)
                      </span>
                      <span className="text-[10px] text-[#71717A] font-light block mt-1">
                        High Risk Trigger
                      </span>
                    </button>

                    {/* Choice: Sometimes */}
                    <button
                      type="button"
                      onClick={() => handleSelectAnswer(currentQ.id, 'Sometimes')}
                      className={`p-6 rounded-2xl border text-center transition-all cursor-pointer relative group ${
                        currentAnswer === 'Sometimes'
                          ? 'border-amber-500 bg-amber-500/15 ring-2 ring-amber-500 shadow-lg'
                          : 'border-white/10 bg-[#17181F] hover:border-white/25'
                      }`}
                    >
                      <span className="font-['Outfit'] text-2xl font-bold text-white block">Sometimes</span>
                      <span className={`font-mono text-[11px] block mt-1 tracking-wider ${
                        currentAnswer === 'Sometimes' ? 'text-amber-400 font-bold' : 'text-[#8E8E93]'
                      }`}>
                        PERIODIC (+1 PT)
                      </span>
                      <span className="text-[10px] text-[#71717A] font-light block mt-1">
                        Moderate Stressor
                      </span>
                    </button>

                    {/* Choice: No */}
                    <button
                      type="button"
                      onClick={() => handleSelectAnswer(currentQ.id, 'No')}
                      className={`p-6 rounded-2xl border text-center transition-all cursor-pointer relative group ${
                        currentAnswer === 'No'
                          ? 'border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500 shadow-lg'
                          : 'border-white/10 bg-[#17181F] hover:border-white/25'
                      }`}
                    >
                      <span className="font-['Outfit'] text-2xl font-bold text-white block">No</span>
                      <span className={`font-mono text-[11px] block mt-1 tracking-wider ${
                        currentAnswer === 'No' ? 'text-emerald-400 font-bold' : 'text-[#8E8E93]'
                      }`}>
                        ABSENT (0 PTS)
                      </span>
                      <span className="text-[10px] text-[#71717A] font-light block mt-1">
                        Protective Resilience
                      </span>
                    </button>

                  </div>

                  {/* Navigation Bottom Controls */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <button
                      type="button"
                      disabled={activeQuestionIndex === 0}
                      onClick={() => setActiveQuestionIndex(i => Math.max(0, i - 1))}
                      className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-full font-mono text-xs uppercase tracking-wider text-[#8E8E93] hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>

                    {activeQuestionIndex < questions.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setActiveQuestionIndex(i => Math.min(questions.length - 1, i + 1))}
                        className="px-6 py-2.5 bg-[#E50914] text-white rounded-full font-mono text-xs uppercase tracking-wider hover:bg-[#c20811] cursor-pointer shadow-md flex items-center gap-2"
                      >
                        <span>Next Question</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="px-6 py-2.5 bg-[#E50914] text-white rounded-full font-mono text-xs uppercase tracking-wider hover:bg-[#c20811] cursor-pointer shadow-md flex items-center gap-2"
                      >
                        <span>Review All Answers</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                </div>
              );
            })()}

            {/* 20 Question Index Navigator */}
            <div className="bg-[#111216] border border-white/10 rounded-2xl p-5 shadow-xl">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A1A1AA] block mb-3">
                Question Index Navigator (1 to 20):
              </span>
              <div className="grid grid-cols-10 sm:grid-cols-20 gap-2 font-mono text-xs">
                {questions.map((q, idx) => {
                  const isCurrent = idx === activeQuestionIndex;
                  const ansValue = answers[q.id];

                  return (
                    <button
                      key={q.id}
                      onClick={() => setActiveQuestionIndex(idx)}
                      className={`h-9 rounded-lg font-semibold transition-all cursor-pointer flex flex-col items-center justify-center ${
                        isCurrent
                          ? 'bg-[#E50914] text-white shadow-md ring-2 ring-white/20'
                          : ansValue === 'Yes'
                          ? 'bg-[#E50914]/20 text-[#E50914] border border-[#E50914]/40 hover:bg-[#E50914]/30'
                          : ansValue === 'Sometimes'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
                          : ansValue === 'No'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-[#17181F] text-[#71717A] border border-white/10 hover:border-white/25'
                      }`}
                    >
                      <span className="text-xs">{idx + 1}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            </>
            )}

          </div>
        )}

        {/* STEP 3: REVIEW & LIVE ANALYTICS PREVIEW */}
        {currentStep === 3 && (
          <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Diagnostic Analytics Summary
                </h2>
                <p className="font-mono text-xs text-[#8E8E93] mt-1">
                  Preview computed score metrics and response breakdown before persisting to your student dossier.
                </p>
              </div>
              <button
                onClick={() => setCurrentStep(2)}
                className="text-xs font-mono text-[#E50914] uppercase tracking-wider hover:underline cursor-pointer"
              >
                Modify Answers &rarr;
              </button>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-[#17181F] border border-white/10 rounded-xl">
                <span className="text-[10px] font-mono text-[#8E8E93] uppercase tracking-wider block">Calculated Score</span>
                <span className="font-['Outfit'] text-3xl font-extrabold text-white">{runningScore} / 40</span>
                <span className="text-[10px] font-mono text-[#71717A] block mt-1">Points Cumulative</span>
              </div>
              <div className="p-4 bg-[#17181F] border border-white/10 rounded-xl">
                <span className="text-[10px] font-mono text-[#8E8E93] uppercase tracking-wider block">Classification</span>
                <span className={`font-['Outfit'] text-2xl font-bold ${
                  projectedLevel === 'High' ? 'text-[#E50914]' : projectedLevel === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {projectedLevel} Stress
                </span>
                <span className="text-[10px] font-mono text-[#71717A] block mt-1">Protocol Tier</span>
              </div>
              <div className="p-4 bg-[#17181F] border border-white/10 rounded-xl">
                <span className="text-[10px] font-mono text-[#8E8E93] uppercase tracking-wider block">Option Breakdown</span>
                <div className="flex items-center gap-2 mt-1 text-xs font-mono">
                  <span className="text-[#E50914]">Y: {yesCount}</span>
                  <span className="text-amber-400">S: {sometimesCount}</span>
                  <span className="text-emerald-400">N: {noCount}</span>
                </div>
                <span className="text-[10px] font-mono text-[#71717A] block mt-1">Response Ratio</span>
              </div>
              <div className="p-4 bg-[#17181F] border border-white/10 rounded-xl">
                <span className="text-[10px] font-mono text-[#8E8E93] uppercase tracking-wider block">Screening Domain</span>
                <span className="font-['Outfit'] text-xl font-bold text-white mt-1 block">{stressArea}</span>
                <span className="text-[10px] font-mono text-[#71717A] block mt-1">20 Questions</span>
              </div>
            </div>

            {!allAnswered && (
              <div className="p-3.5 bg-[#E50914]/10 border border-[#E50914]/40 rounded-xl text-xs font-mono text-[#FF4D57]">
                ATTENTION: {answeredCount} of 20 questions are answered. Please complete all items before computing your final score.
              </div>
            )}

            {/* Detailed Items List */}
            <div className="max-h-80 overflow-y-auto border border-white/10 rounded-xl divide-y divide-white/10 font-mono text-xs">
              {questions.map((q, i) => (
                <div key={q.id} className="p-3.5 flex items-center justify-between gap-4 bg-[#17181F]/50">
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-[#E50914] shrink-0">
                      {(i + 1).toString().padStart(2, '0')}.
                    </span>
                    <div>
                      <p className="text-white text-xs font-medium">{q.questionText}</p>
                      <span className="text-[10px] text-[#71717A]">{q.category}</span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-mono uppercase px-2.5 py-1 rounded-full shrink-0 ${
                    answers[q.id] === 'Yes'
                      ? 'bg-[#E50914]/20 text-[#E50914] border border-[#E50914]/30'
                      : answers[q.id] === 'Sometimes'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : answers[q.id] === 'No'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/10 text-white'
                  }`}>
                    {answers[q.id] || 'Unanswered'}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-full font-mono text-xs uppercase tracking-wider text-[#8E8E93] hover:text-white cursor-pointer"
              >
                Back to Questionnaire
              </button>

              <button
                type="button"
                disabled={submitting || !allAnswered}
                onClick={handleSubmitAssessment}
                className="inline-flex items-center gap-3 px-8 py-3.5 bg-[#E50914] hover:bg-[#c20811] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-md group cursor-pointer disabled:opacity-50"
              >
                <span>{submitting ? 'Analyzing & Persisting...' : 'Calculate Final Score & Report'}</span>
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-3 h-3 text-white" />
                </div>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
