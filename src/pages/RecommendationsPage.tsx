import React, { useState } from 'react';
import { StressLevel } from '../types';
import { Clock, Moon, Sparkles, BookOpen, Coffee, Dumbbell, ShieldAlert, HeartHandshake, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RecommendationsPage: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<StressLevel>('Moderate');

  const guidanceData: Record<StressLevel, Array<{ category: string; title: string; desc: string; icon: any }>> = {
    Low: [
      {
        category: 'CIRCADIAN RHYTHM',
        title: '7–8 Hour Consistent Sleep Window',
        desc: 'Going to bed and rising at the exact same hour stabilizes cortisol output and preserves baseline cognitive bandwidth.',
        icon: Moon
      },
      {
        category: 'INTERVAL STUDYING',
        title: '45/10 Interval Work Cycles',
        desc: 'Work in focused 45-minute blocks followed by 10 minutes of screen-free eye rest and light physical movement.',
        icon: Clock
      },
      {
        category: 'PHYSICAL CONDITIONING',
        title: 'Aerobic Movement 4 Days Weekly',
        desc: 'Engaging in 25 minutes of brisk walking or sports clears residual mental fatigue and reinforces deep sleep architecture.',
        icon: Dumbbell
      },
      {
        category: 'SCREEN HYGIENE',
        title: '30-Minute Digital Wind-Down',
        desc: 'Discontinue phone scrolling at least 30 minutes before sleep to prevent blue light suppression of melatonin.',
        icon: Coffee
      }
    ],
    Moderate: [
      {
        category: 'TIME MANAGEMENT',
        title: 'Priority Quadrant Matrix Planning',
        desc: 'Categorize assignments by urgency vs importance. Prevent spending prime morning hours on low-value peripheral chores.',
        icon: BookOpen
      },
      {
        category: 'SYLLABUS CHUNKING',
        title: 'Micro-Milestone Study Blocks',
        desc: 'Break large course modules into 2-page or single-problem daily goals to eliminate panicked pre-exam cramming.',
        icon: Clock
      },
      {
        category: 'BREATHWORK & RESET',
        title: '4-7-8 Diaphragmatic Cycles',
        desc: 'When feeling mid-day study fatigue, inhale for 4 seconds, hold for 7, and exhale slowly for 8. Repeat 4 full cycles.',
        icon: Sparkles
      },
      {
        category: 'COLLABORATIVE STUDY',
        title: 'Focused Study Teams',
        desc: 'Partner with 1–2 classmates to share summary notes, which distributes isolated test anxiety and validates understanding.',
        icon: HeartHandshake
      }
    ],
    High: [
      {
        category: 'DIRECT INTERVENTION',
        title: 'Confidential Campus Counselling',
        desc: 'Schedule a session with Dr. Evelyn Reed to structure an academic workload relief and deadline restructuring plan.',
        icon: HeartHandshake
      },
      {
        category: 'FACULTY COMMUNICATION',
        title: 'Course Advisor Consultation',
        desc: 'Speak to faculty advisors regarding realistic deadline flexibility when overlapping project milestones induce severe sleep deficit.',
        icon: ShieldAlert
      },
      {
        category: 'RECOVERY NIGHT',
        title: 'Mandatory Recovery Sleep Block',
        desc: 'Commit to an early bedtime tonight without coursework guilt. Chronic sleep debt elevates perceived stress by over 40%.',
        icon: Moon
      },
      {
        category: 'ANONYMOUS COMM',
        title: 'Anonymous WebRTC Video/Audio Room',
        desc: 'Launch the zero-disclosure Anonymous Room to speak with a verified counsellor without recording your student identity.',
        icon: Sparkles
      }
    ]
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#0B0C0E] text-[#EDEDED] relative overflow-hidden py-8">
      {/* Background radial crimson glow */}
      <div className="absolute top-20 left-1/3 w-[600px] h-[450px] bg-[#E50914]/[0.05] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        
        {/* Header */}
        <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="w-4 h-[2px] bg-[#E50914]" />
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A1A1AA]">
                CLINICAL PROTOCOLS
              </span>
            </div>
            <h1 className="font-['Outfit'] text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Personalized Guidance Matrix
            </h1>
            <p className="text-sm text-[#9E9EA4] max-w-2xl font-light leading-relaxed">
              Targeted behavioral habits and stress mitigation protocols tailored to specific screening scores.
            </p>
          </div>

          {/* Tab Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-white/10">
            {(['Low', 'Moderate', 'High'] as StressLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-5 py-2.5 rounded-full font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  selectedLevel === lvl
                    ? 'bg-[#E50914] text-white shadow-md font-semibold'
                    : 'bg-[#17181F] text-[#8E8E93] border border-white/10 hover:border-white/25 hover:text-white'
                }`}
              >
                {lvl} Stress ({lvl === 'Low' ? '0–13 Pts' : lvl === 'Moderate' ? '14–26 Pts' : '27–40 Pts'})
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guidanceData[selectedLevel].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-3.5 shadow-xl hover:border-[#E50914]/40 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#E50914] font-semibold">
                    {item.category}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-[#17181F] border border-white/10 text-[#E50914] flex items-center justify-center group-hover:border-[#E50914]/30 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-['Outfit'] text-xl font-bold text-white tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#9E9EA4] leading-relaxed font-light">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Callout */}
        <div className="bg-[#111216] border border-[#E50914]/40 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
              <h3 className="font-['Outfit'] text-xl font-bold text-white">
                Need Immediate Confidential Discussion?
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#9E9EA4] font-light">
              Connect directly via peer-to-peer WebRTC in the zero-disclosure Anonymous Room.
            </p>
          </div>
          <Link
            to="/anonymous-counselling"
            className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#E50914] hover:bg-[#c20811] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-md group shrink-0"
          >
            <span>Open Anonymous Room</span>
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
              <ArrowRight className="w-3 h-3 text-white" />
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
};
