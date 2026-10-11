import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { StressArea, AnswerChoice, Question } from '../types';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  School,
  Home as HomeIcon,
  Layers,
  Send
} from 'lucide-react';

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [stressArea, setStressArea] = useState<StressArea>('Both');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [qId: number]: AnswerChoice }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);

  const handleProceedToQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getQuestions(stressArea);
      setQuestions(res.questions);
      setActiveQuestionIndex(0);
      setCurrentStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to load questionnaire.');
    } finally {
      setLoading(false);
    }
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
  const allAnswered = questions.length === 20 && answeredCount === 20;

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
    <div className="min-h-[calc(100vh-5rem)] bg-[#0B0C0E] text-[#EDEDED] relative overflow-hidden py-8">
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
                  DIAGNOSTIC MATRIX
                </span>
              </div>
              <h1 className="font-['Outfit'] text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                20-Item Stress Screening Protocol
              </h1>
            </div>

            {/* Stepper Markers */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className={`px-3 py-1.5 rounded-full uppercase tracking-wider text-[11px] font-medium transition-all ${
                currentStep === 1 ? 'bg-[#E50914] text-white shadow-sm' : 'bg-white/5 text-[#8E8E93] border border-white/10'
              }`}>
                01 Area
              </span>
              <span className="text-white/20">/</span>
              <span className={`px-3 py-1.5 rounded-full uppercase tracking-wider text-[11px] font-medium transition-all ${
                currentStep === 2 ? 'bg-[#E50914] text-white shadow-sm' : 'bg-white/5 text-[#8E8E93] border border-white/10'
              }`}>
                02 Questions
              </span>
              <span className="text-white/20">/</span>
              <span className={`px-3 py-1.5 rounded-full uppercase tracking-wider text-[11px] font-medium transition-all ${
                currentStep === 3 ? 'bg-[#E50914] text-white shadow-sm' : 'bg-white/5 text-[#8E8E93] border border-white/10'
              }`}>
                03 Submit
              </span>
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
                Select Primary Focus Area
              </h2>
              <p className="text-sm text-[#9E9EA4] font-light leading-relaxed">
                Indicate whether your recent pressure originates mainly from home environments, academic and campus demands, or both. This filters relevant questions alongside universal lifestyle indicators.
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
                <h3 className="font-['Outfit'] text-lg font-bold text-white">Home Environment</h3>
                <p className="text-xs text-[#9E9EA4] mt-2 leading-relaxed font-light">
                  Family expectations, study corner disturbances, domestic responsibilities, and routine conflicts.
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
                <h3 className="font-['Outfit'] text-lg font-bold text-white">College / Academics</h3>
                <p className="text-xs text-[#9E9EA4] mt-2 leading-relaxed font-light">
                  Coursework deadlines, examination anxiety, instructor communication, and career prospects.
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
                <h3 className="font-['Outfit'] text-lg font-bold text-white">Both Domains</h3>
                <p className="text-xs text-[#9E9EA4] mt-2 leading-relaxed font-light">
                  Combined multidimensional pressures spanning exams, commute, screen time, and home dynamics.
                </p>
                {stressArea === 'Both' && (
                  <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono text-[#E50914]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Selected Domain</span>
                  </div>
                )}
              </button>

            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                disabled={loading}
                onClick={handleProceedToQuestions}
                className="inline-flex items-center gap-3 px-7 py-3.5 bg-[#E50914] hover:bg-[#c20811] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-md group cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Initializing Question Bank...' : 'Load 20-Item Matrix'}</span>
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-3 h-3 text-white" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: 20 QUESTIONS MATRIX */}
        {currentStep === 2 && questions.length > 0 && (
          <div className="space-y-6">
            
            {/* Progress bar card */}
            <div className="bg-[#111216] border border-white/10 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between text-xs font-mono mb-2.5">
                <span className="text-white font-medium">
                  Item {activeQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-[#E50914] font-semibold">
                  {answeredCount} / 20 Completed ({Math.round((answeredCount / 20) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-[#17181F] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#E50914] h-full rounded-full transition-all duration-300"
                  style={{ width: `${(answeredCount / 20) * 100}%` }}
                />
              </div>
            </div>

            {/* Active Question Box */}
            {(() => {
              const currentQ = questions[activeQuestionIndex];
              const currentAnswer = answers[currentQ.id];

              return (
                <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-7 shadow-2xl relative">
                  <div className="flex items-center justify-between text-xs font-mono text-[#8E8E93] border-b border-white/10 pb-4">
                    <span className="text-[#E50914] uppercase tracking-wider font-semibold">
                      CATEGORY: {currentQ.category}
                    </span>
                    <span>AREA: {currentQ.stressArea}</span>
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
                      className={`p-6 rounded-2xl border text-center transition-all cursor-pointer ${
                        currentAnswer === 'Yes'
                          ? 'border-[#E50914] bg-[#E50914]/15 ring-2 ring-[#E50914]'
                          : 'border-white/10 bg-[#17181F] hover:border-white/25'
                      }`}
                    >
                      <span className="font-['Outfit'] text-2xl font-bold text-white block">Yes</span>
                      <span className={`font-mono text-[11px] block mt-1 tracking-wider ${
                        currentAnswer === 'Yes' ? 'text-[#E50914] font-bold' : 'text-[#8E8E93]'
                      }`}>
                        FREQUENTLY (2 PTS)
                      </span>
                    </button>

                    {/* Choice: Sometimes */}
                    <button
                      type="button"
                      onClick={() => handleSelectAnswer(currentQ.id, 'Sometimes')}
                      className={`p-6 rounded-2xl border text-center transition-all cursor-pointer ${
                        currentAnswer === 'Sometimes'
                          ? 'border-[#E50914] bg-[#E50914]/15 ring-2 ring-[#E50914]'
                          : 'border-white/10 bg-[#17181F] hover:border-white/25'
                      }`}
                    >
                      <span className="font-['Outfit'] text-2xl font-bold text-white block">Sometimes</span>
                      <span className={`font-mono text-[11px] block mt-1 tracking-wider ${
                        currentAnswer === 'Sometimes' ? 'text-[#E50914] font-bold' : 'text-[#8E8E93]'
                      }`}>
                        OCCASIONALLY (1 PT)
                      </span>
                    </button>

                    {/* Choice: No */}
                    <button
                      type="button"
                      onClick={() => handleSelectAnswer(currentQ.id, 'No')}
                      className={`p-6 rounded-2xl border text-center transition-all cursor-pointer ${
                        currentAnswer === 'No'
                          ? 'border-[#E50914] bg-[#E50914]/15 ring-2 ring-[#E50914]'
                          : 'border-white/10 bg-[#17181F] hover:border-white/25'
                      }`}
                    >
                      <span className="font-['Outfit'] text-2xl font-bold text-white block">No</span>
                      <span className={`font-mono text-[11px] block mt-1 tracking-wider ${
                        currentAnswer === 'No' ? 'text-[#E50914] font-bold' : 'text-[#8E8E93]'
                      }`}>
                        RARELY / NEVER (0 PTS)
                      </span>
                    </button>

                  </div>

                  {/* Bottom Navigation */}
                  <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                    <button
                      type="button"
                      disabled={activeQuestionIndex === 0}
                      onClick={() => setActiveQuestionIndex(i => Math.max(0, i - 1))}
                      className="px-5 py-2.5 bg-[#17181F] border border-white/10 rounded-full text-white font-mono text-xs uppercase tracking-wider hover:border-white/25 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
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
                        <span>Next Item</span>
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

            {/* Jump palette */}
            <div className="bg-[#111216] border border-white/10 rounded-2xl p-5 shadow-xl">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A1A1AA] block mb-3">
                Question Index Navigator:
              </span>
              <div className="grid grid-cols-10 sm:grid-cols-20 gap-2 font-mono text-xs">
                {questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isCurrent = idx === activeQuestionIndex;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setActiveQuestionIndex(idx)}
                      className={`h-8 rounded-lg font-semibold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#E50914] text-white shadow-md'
                          : isAnswered
                          ? 'bg-white/20 text-white hover:bg-white/30'
                          : 'bg-[#17181F] text-[#71717A] border border-white/10 hover:border-white/25'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* STEP 3: REVIEW & SUBMISSION */}
        {currentStep === 3 && (
          <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Verify Responses Before Scoring
                </h2>
                <p className="font-mono text-xs text-[#8E8E93] mt-1">
                  Responses will be securely validated and persisted to your student profile via PostgreSQL.
                </p>
              </div>
              <button
                onClick={() => setCurrentStep(2)}
                className="text-xs font-mono text-[#E50914] uppercase tracking-wider hover:underline"
              >
                Edit Items &rarr;
              </button>
            </div>

            {!allAnswered && (
              <div className="p-3.5 bg-[#E50914]/10 border border-[#E50914]/40 rounded-xl text-xs font-mono text-[#FF4D57]">
                ATTENTION: Only {answeredCount} of 20 questions are answered. Please complete all items before computing your score.
              </div>
            )}

            <div className="max-h-96 overflow-y-auto border border-white/10 rounded-xl divide-y divide-white/10 font-mono text-xs">
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
                  <span className={`text-[11px] font-mono uppercase px-2.5 py-1 rounded-full ${
                    answers[q.id] === 'Yes'
                      ? 'bg-[#E50914]/15 text-[#E50914] border border-[#E50914]/30'
                      : answers[q.id] === 'Sometimes'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-white/10 text-white'
                  }`}>
                    {answers[q.id] || 'UNANSWERED'}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 bg-[#17181F] border border-white/10 rounded-full text-white font-mono text-xs uppercase tracking-wider hover:border-white/20"
              >
                Back to Questions
              </button>

              <button
                type="button"
                disabled={!allAnswered || submitting}
                onClick={handleSubmitAssessment}
                className="inline-flex items-center gap-3 px-7 py-3.5 bg-[#E50914] hover:bg-[#c20811] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-md group cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span>Computing Prediction & Guidance...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Calculate Stress Prediction</span>
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                      <ArrowRight className="w-3 h-3 text-white" />
                    </div>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
