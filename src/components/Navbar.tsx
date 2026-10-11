import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, HeartHandshake, ShieldCheck, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#0B0C0E]/90 backdrop-blur-xl border-b border-white/[0.08] text-[#EDEDED]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-8">
          
          {/* Brand Wordmark (Inspired by "CL." and "Darnit2" in the reference concepts) */}
          <Link
            to={user ? (user.role === 'admin' ? '/admin' : user.role === 'counsellor' ? '/counsellor/console' : '/dashboard') : '/'}
            className="flex items-center gap-3 group focus:outline-none shrink-0"
          >
            <div className="flex items-center">
              <span className="font-['Outfit'] font-black text-2xl tracking-tighter text-white">
                SP
              </span>
              <span className="text-[#E50914] font-black text-2xl font-['Outfit'] leading-none">.</span>
            </div>
            <span className="hidden sm:inline-block font-mono text-[11px] uppercase tracking-[0.25em] text-[#8E8E93] border-l border-white/10 pl-3">
              WELLBEING SYSTEM
            </span>
          </Link>

          {/* Minimalist Navigation Links (Exact reference inspiration: wide tracking uppercase) */}
          <nav className="hidden md:flex items-center gap-8 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#9E9EA4]">
            {user?.role === 'student' && (
              <>
                <Link
                  to="/dashboard"
                  className={`transition-colors hover:text-white ${isActive('/dashboard') ? 'text-white border-b border-[#E50914] pb-1' : ''}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/assessment"
                  className={`transition-colors hover:text-white ${isActive('/assessment') ? 'text-white border-b border-[#E50914] pb-1' : ''}`}
                >
                  Assessment
                </Link>
                <Link
                  to="/history"
                  className={`transition-colors hover:text-white ${isActive('/history') ? 'text-white border-b border-[#E50914] pb-1' : ''}`}
                >
                  History
                </Link>
                <Link
                  to="/recommendations"
                  className={`transition-colors hover:text-white ${isActive('/recommendations') ? 'text-white border-b border-[#E50914] pb-1' : ''}`}
                >
                  Guidance
                </Link>
                <Link
                  to="/counsellor"
                  className={`transition-colors hover:text-white ${isActive('/counsellor') ? 'text-white border-b border-[#E50914] pb-1' : ''}`}
                >
                  Counsellor
                </Link>
              </>
            )}

            {user?.role === 'admin' && (
              <>
                <Link
                  to="/admin"
                  className={`transition-colors hover:text-white ${isActive('/admin') ? 'text-white border-b border-[#E50914] pb-1' : ''}`}
                >
                  Overview
                </Link>
                <Link to="/admin?tab=students" className="transition-colors hover:text-white">
                  Roster
                </Link>
                <Link to="/admin?tab=questions" className="transition-colors hover:text-white">
                  Question Bank
                </Link>
                <Link to="/admin?tab=counselling" className="transition-colors hover:text-white">
                  Cases
                </Link>
                <Link to="/admin?tab=reports" className="transition-colors hover:text-white">
                  Reports
                </Link>
              </>
            )}

            {user?.role === 'counsellor' && (
              <>
                <Link
                  to="/counsellor/console"
                  className={`transition-colors hover:text-white ${isActive('/counsellor/console') ? 'text-white border-b border-[#E50914] pb-1' : ''}`}
                >
                  Console
                </Link>
                <Link to="/counsellor/console?tab=queue" className="transition-colors hover:text-white">
                  Anonymous Queue
                </Link>
                <Link to="/counsellor/console?tab=requests" className="transition-colors hover:text-white">
                  Student Reports
                </Link>
              </>
            )}

            {!user && (
              <>
                <Link to="/" className={`transition-colors hover:text-white ${isActive('/') ? 'text-white border-b border-[#E50914] pb-1' : ''}`}>
                  Overview
                </Link>
                <Link
                  to="/anonymous-counselling"
                  className="transition-colors text-[#EDEDED] flex items-center gap-1.5 hover:text-[#E50914]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E50914]" />
                  <span>Anonymous WebRTC</span>
                </Link>
              </>
            )}
          </nav>

          {/* User Account / Session Actions */}
          <div className="flex items-center gap-4 shrink-0">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="font-semibold text-xs text-white tracking-wide truncate max-w-[140px]">
                    {user.fullName}
                  </span>
                  <span className="font-mono text-[10px] text-[#E50914] uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#9E9EA4] border border-white/10 rounded-full hover:border-[#E50914] hover:text-white transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold tracking-wider uppercase text-[#9E9EA4] hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 text-xs font-semibold tracking-wider uppercase text-white bg-[#E50914] rounded-full hover:bg-[#c20811] transition-all shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
