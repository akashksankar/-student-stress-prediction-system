import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Activity,
  HeartHandshake,
  ShieldCheck,
  Brain,
  Database,
  Lock,
  Compass
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user, quickLogin } = useAuth();
  const navigate = useNavigate();

  // Active slide index (inspired by the 01 / 05 stepper in the reference images)
  const [activeSlide, setActiveSlide] = useState(1);

  const slides = [
    {
      id: 1,
      title: "Comprehensive screening for student academic stress & routine pressure.",
      subtitle: "20-Item Standard Matrix",
      category: "ALGORITHMIC DIAGNOSTIC",
      tagline: "Rule-based scoring mapping questionnaire responses to Low, Moderate, and High classifications with validated precision.",
      statNumber: "0–40",
      statLabel: "Total Score Points",
      metric: "PostgreSQL 16 Storage"
    },
    {
      id: 2,
      title: "Context-aware stress area selection across home and college life.",
      subtitle: "Tri-Domain Architecture",
      category: "CONTEXT INTELLIGENCE",
      tagline: "Students indicate whether strain arises from domestic environments, campus course loads, or combined lifestyle stressors.",
      statNumber: "3",
      statLabel: "Target Stress Areas",
      metric: "Home · College · Both"
    },
    {
      id: 3,
      title: "Summarized stress reporting with strict student privacy safeguards.",
      subtitle: "Clinical Support Routing",
      category: "CONFIDENTIAL PROTOCOL",
      tagline: "High-stress cases generate summary referral reports for campus counsellor review. Individual questionnaire items remain strictly private.",
      statNumber: "100%",
      statLabel: "Privacy Safeguarded",
      metric: "Withholds Raw Responses"
    },
    {
      id: 4,
      title: "Encrypted WebRTC room for zero-disclosure peer-to-peer counselling.",
      subtitle: "Real-Time Communications",
      category: "ANONYMOUS COMM CHANNEL",
      tagline: "Connect via audio, video, or real-time text chat with ephemeral cryptographic tokens and random guest aliases.",
      statNumber: "0",
      statLabel: "Personal Identifiers Needed",
      metric: "P2P WebRTC Signaling"
    }
  ];

  const current = slides[activeSlide - 1];

  const handleNext = () => {
    setActiveSlide((prev) => (prev < slides.length ? prev + 1 : 1));
  };

  const handlePrev = () => {
    setActiveSlide((prev) => (prev > 1 ? prev - 1 : slides.length));
  };

  const handleDemoAccess = async (role: 'student' | 'admin' | 'counsellor') => {
    try {
      await quickLogin(role);
      if (role === 'admin') navigate('/admin');
      else if (role === 'counsellor') navigate('/counsellor/console');
      else navigate('/dashboard');
    } catch (err: any) {
      console.error('Demo login error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-[#EDEDED] relative overflow-hidden flex flex-col justify-between">
      
      {/* Subtle radial crimson ambience in the backdrop */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#E50914]/[0.07] rounded-full blur-[140px] pointer-events-none" />

      {/* MAIN HERO VIEWPORT — DIRECT COCA-COLA & VOLVO MINIMALIST CONCEPT INSPIRATION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full flex-1 flex flex-col justify-center">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative">
          
          {/* LEFT VERTICAL RAIL STEPPER (Exact inspiration from Coca-Cola & Volvo concepts: 01 / 05) */}
          <div className="hidden lg:flex lg:col-span-1 flex-col items-center justify-center space-y-6 text-xs font-mono text-[#8E8E93]">
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <div className="w-0.5 h-12 bg-white/10" />
            
            {/* Active circular pill counter */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-7 h-7 rounded-full border border-[#E50914] flex items-center justify-center text-[10px] text-white font-bold font-mono">
                0{activeSlide}
              </div>
              <span className="text-[10px] text-[#71717A] font-mono">/ 0{slides.length}</span>
            </div>

            <div className="w-0.5 h-12 bg-white/10" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          </div>

          {/* MAIN EDITORIAL CONTENT (Left Column of Hero) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Top Micro Kicker with Red Accent Tick Line (Exact Volvo concept style) */}
            <div className="flex items-center gap-3">
              <span className="w-5 h-[2px] bg-[#E50914]" />
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A1A1AA]">
                {current.category}
              </span>
            </div>

            {/* Headline with Neo-Grotesque Precision & Elegance */}
            <h1 className="font-['Outfit'] text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.15] text-balance">
              {current.title}
            </h1>

            {/* Description Prose */}
            <p className="text-sm sm:text-base text-[#9E9EA4] leading-relaxed max-w-xl font-light">
              {current.tagline}
            </p>

            {/* Fine Hairline Red Divider */}
            <div className="w-full red-glow-line my-4" />

            {/* Minimalist Metrics Strip */}
            <div className="flex items-center gap-8 py-2">
              <div>
                <span className="block font-['Outfit'] font-bold text-2xl text-white">
                  {current.statNumber}
                </span>
                <span className="text-[11px] text-[#71717A] tracking-wider uppercase font-medium">
                  {current.statLabel}
                </span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <span className="block font-semibold text-xs text-[#E50914] uppercase tracking-wider">
                  {current.subtitle}
                </span>
                <span className="text-[11px] text-[#71717A]">
                  {current.metric}
                </span>
              </div>
            </div>

            {/* CTAs with Circular Arrow Pill (Inspired by Volvo concept) */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              {user ? (
                <Link
                  to={user.role === 'admin' ? '/admin' : user.role === 'counsellor' ? '/counsellor/console' : '/dashboard'}
                  className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#E50914] hover:bg-[#c20811] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-md group"
                >
                  <span>Go to Dashboard</span>
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                    <ArrowRight className="w-3 h-3 text-white" />
                  </div>
                </Link>
              ) : (
                <>
                  <Link
                    to="/assessment"
                    className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#E50914] hover:bg-[#c20811] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-md group"
                  >
                    <span>Take Assessment</span>
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                      <ArrowRight className="w-3 h-3 text-white" />
                    </div>
                  </Link>

                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#141519] border border-white/10 hover:border-white/30 text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all"
                  >
                    <span>Sign In</span>
                  </Link>
                </>
              )}

              <Link
                to="/anonymous-counselling"
                className="inline-flex items-center gap-2 px-5 py-3.5 text-xs font-medium text-[#A1A1AA] hover:text-white transition-colors"
              >
                <HeartHandshake className="w-4 h-4 text-[#E50914]" />
                <span>Anonymous Room</span>
              </Link>
            </div>

          </div>

          {/* RIGHT VISUAL STAGE: ARCHITECTURAL RED PILLAR & SLICK CARDS (Exact Darnit2/Volvo layout) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* The Signature Architectural Red Monolith Slice (As in the Volvo/Darnit2 image) */}
            <div className="absolute right-6 top-0 bottom-0 w-44 sm:w-52 bg-[#E50914] rounded-2xl -z-10 shadow-2xl opacity-90 hidden sm:block" />

            {/* Foreground Luxury Matte Showcase Card */}
            <div className="w-full max-w-md bg-[#121317]/95 border border-white/10 rounded-2xl p-7 shadow-2xl space-y-6 relative z-10 backdrop-blur-xl">
              
              {/* Header pill of the showcase card */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E50914]" />
                  <span className="font-mono text-[10px] text-white tracking-[0.2em] uppercase font-bold">
                    SYSTEM DOSSIER // MCA-2026
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#71717A]">
                  STATUS: LIVE
                </span>
              </div>

              {/* Central Abstract Wellbeing Pulse Graphic */}
              <div className="h-44 rounded-xl bg-gradient-to-b from-[#181920] to-[#0E0F13] border border-white/[0.06] flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(#e50914_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
                
                {/* Minimalist central circle glyph */}
                <div className="w-16 h-16 rounded-full border border-[#E50914]/40 flex items-center justify-center relative">
                  <div className="w-10 h-10 rounded-full bg-[#E50914]/20 border border-[#E50914] flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  {/* Subtle orbiting ring */}
                  <div className="absolute inset-0 rounded-full border border-dashed border-white/20 animate-spin" style={{ animationDuration: '20s' }} />
                </div>

                <div className="mt-3 text-center">
                  <span className="text-[11px] font-['Outfit'] font-bold text-white tracking-wider uppercase block">
                    NEURAL SCREENING ENGINE
                  </span>
                  <span className="text-[10px] text-[#71717A] font-mono">
                    20 Questions · Scoring Matrix 0–40
                  </span>
                </div>
              </div>

              {/* Segmented Specs */}
              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#181920]/60 border border-white/[0.04]">
                  <span className="text-[#8E8E93]">PostgreSQL Engine:</span>
                  <span className="text-white font-semibold">Active & Relational</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#181920]/60 border border-white/[0.04]">
                  <span className="text-[#8E8E93]">JWT Authorization:</span>
                  <span className="text-white font-semibold">256-Bit Cryptographic</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#181920]/60 border border-white/[0.04]">
                  <span className="text-[#8E8E93]">WebRTC Signalling:</span>
                  <span className="text-[#E50914] font-semibold">Peer-to-Peer Ready</span>
                </div>
              </div>

              {/* Bottom Pagination & Slide Stepper Controls (Exact Coca-Cola concept bottom-right '< >' buttons) */}
              <div className="pt-2 flex items-center justify-between border-t border-white/[0.08]">
                <div className="text-[11px] font-mono text-[#71717A]">
                  Slide 0{activeSlide} / 0{slides.length}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrev}
                    aria-label="Previous slide"
                    className="w-8 h-8 rounded-full bg-[#1A1B22] border border-white/10 hover:border-[#E50914] text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Next slide"
                    className="w-8 h-8 rounded-full bg-[#1A1B22] border border-white/10 hover:border-[#E50914] text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* QUICK EVALUATOR CLEARANCE PANEL (Minimalist Dark Strip) */}
      <div className="border-t border-white/[0.08] bg-[#0E0F13]/90 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8E8E93]">
            <span className="w-2 h-2 rounded-full bg-[#E50914]" />
            <span className="text-white font-semibold">MCA EVALUATOR ACCESS:</span>
            <span>Click to auto-authenticate with pre-seeded role tokens:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDemoAccess('student')}
              className="px-3 py-1.5 rounded-full bg-[#16171E] border border-white/10 hover:border-[#E50914] text-xs font-medium text-white transition-colors cursor-pointer"
            >
              Student (Alex Morgan)
            </button>
            <button
              onClick={() => handleDemoAccess('counsellor')}
              className="px-3 py-1.5 rounded-full bg-[#16171E] border border-white/10 hover:border-[#E50914] text-xs font-medium text-white transition-colors cursor-pointer"
            >
              Counsellor (Dr. Reed)
            </button>
            <button
              onClick={() => handleDemoAccess('admin')}
              className="px-3 py-1.5 rounded-full bg-[#16171E] border border-white/10 hover:border-[#E50914] text-xs font-medium text-white transition-colors cursor-pointer"
            >
              Administrator
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
