import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ShieldCheck,
  Brain,
  HeartHandshake,
  ArrowRight,
  School,
  Home,
  Layers,
  Sparkles,
  BarChart3,
  Video
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0B0C0E] text-[#EDEDED] relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#E50914]/[0.06] rounded-full blur-[160px] pointer-events-none" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 relative z-10 space-y-12">
        
        <div className="max-w-3xl space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-5 h-[2px] bg-[#E50914]" />
            <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#A1A1AA]">
              CLINICAL PSYCHOLOGY & AI SYSTEM
            </span>
          </div>

          <h1 className="font-['Outfit'] text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Predictive Student <br />
            <span className="text-[#E50914]">Stress Diagnostic</span> Matrix
          </h1>

          <p className="text-base sm:text-lg text-[#9E9EA4] leading-relaxed font-light max-w-2xl">
            A production clinical-grade screening platform designed for university students. 
            Evaluate academic and household stressors through 20 validated items, calculate real-time risk tiers, and connect with confidential campus counselling.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              to="/assessment"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#E50914] hover:bg-[#c20811] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-xl group"
            >
              <Activity className="w-4 h-4" />
              <span>Start 20-Item Screening</span>
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-3 h-3 text-white" />
              </div>
            </Link>

            <Link
              to="/anonymous-counselling"
              className="inline-flex items-center gap-2 px-6 py-4 bg-[#14151B] hover:bg-[#1a1b23] text-white border border-white/10 rounded-full text-xs font-medium uppercase tracking-wider transition-all"
            >
              <Video className="w-4 h-4 text-[#E50914]" />
              <span>Anonymous WebRTC Session</span>
            </Link>
          </div>
        </div>

        {/* 3 Domain Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
          
          <div className="p-8 bg-[#111216] border border-white/10 rounded-2xl space-y-4 hover:border-[#E50914]/40 transition-all shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
              <School className="w-6 h-6" />
            </div>
            <h3 className="font-['Outfit'] text-xl font-bold text-white">College / Academics</h3>
            <p className="text-xs text-[#9E9EA4] leading-relaxed font-light">
              Examination anxiety, continuous internal deadlines, CGPA benchmark strain, coding laboratory viva, and placement fears.
            </p>
            <div className="text-[11px] font-mono text-[#E50914]">20 Formulated Items &rarr;</div>
          </div>

          <div className="p-8 bg-[#111216] border border-white/10 rounded-2xl space-y-4 hover:border-[#E50914]/40 transition-all shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
              <Home className="w-6 h-6" />
            </div>
            <h3 className="font-['Outfit'] text-xl font-bold text-white">Home Environment</h3>
            <p className="text-xs text-[#9E9EA4] leading-relaxed font-light">
              Family grade expectations, domestic chore conflicts, study desk privacy, financial discussions, and routine boundaries.
            </p>
            <div className="text-[11px] font-mono text-[#E50914]">20 Formulated Items &rarr;</div>
          </div>

          <div className="p-8 bg-[#111216] border border-white/10 rounded-2xl space-y-4 hover:border-[#E50914]/40 transition-all shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-['Outfit'] text-xl font-bold text-white">Both Domains</h3>
            <p className="text-xs text-[#9E9EA4] leading-relaxed font-light">
              Cumulative lifestyle matrix: sleep deprivation, physical somatization, commute fatigue, and digital avoidance loops.
            </p>
            <div className="text-[11px] font-mono text-[#E50914]">20 Formulated Items &rarr;</div>
          </div>

        </div>

      </div>

    </div>
  );
};
