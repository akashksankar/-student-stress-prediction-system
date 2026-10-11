import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0B0C0E] border-t border-white/10 text-xs font-mono text-[#8E8E93] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E50914]" />
          <span className="text-white font-['Outfit'] font-bold">Student Stress Prediction System</span>
          <span className="text-white/20">|</span>
          <span>MCA Clinical Informatics</span>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-[11px]">
          <Link to="/assessment" className="hover:text-white transition-colors">Assessment</Link>
          <Link to="/anonymous-counselling" className="hover:text-white transition-colors">Anonymous WebRTC</Link>
          <Link to="/login" className="hover:text-white transition-colors">Portal Login</Link>
          <span className="text-white/20">|</span>
          <span className="text-[#71717A]">Strictly Confidential & GDPR Compliant</span>
        </div>

      </div>
    </footer>
  );
};
