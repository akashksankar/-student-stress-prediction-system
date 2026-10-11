import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t-2 border-[#FF003C]/40 bg-[#0A0A0D] py-8 text-[#A8A7A0] font-mono text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#FF003C]" />
            <p className="font-['Anton'] tracking-wider text-sm text-white uppercase">
              STUDENT STRESS PREDICTION SYSTEM // FRONTLINE DOSSIER
            </p>
          </div>
          <p className="mt-1 text-[11px] text-[#747A78]">
            Master of Computer Applications (MCA) Project · Early screening & institutional wellbeing platform.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-['Barlow_Condensed'] font-bold uppercase tracking-wider">
          <Link to="/anonymous-counselling" className="text-[#FF003C] hover:text-white transition-colors">
            Anonymous WebRTC Room
          </Link>
          <span className="text-[#FF003C]">/</span>
          <span>PostgreSQL 16 Storage</span>
          <span className="text-[#FF003C]">/</span>
          <span>JWT RBAC Enforced</span>
          <span className="text-[#FF003C]">/</span>
          <span>0–40 Scoring Matrix</span>
        </div>
      </div>
    </footer>
  );
};
