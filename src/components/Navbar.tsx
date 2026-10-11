import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  LogOut,
  User,
  ShieldAlert,
  HeartHandshake,
  LayoutDashboard,
  LogIn,
  UserPlus
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-[#111216]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-[#E50914] flex items-center justify-center text-white font-['Outfit'] font-bold text-lg shadow-lg group-hover:scale-105 transition-transform">
              SP
            </div>
            <div className="flex flex-col">
              <span className="font-['Outfit'] font-bold text-base text-white tracking-tight flex items-center gap-1.5">
                StressPredict <span className="text-[#E50914] text-xs font-mono font-medium px-1.5 py-0.5 rounded bg-[#E50914]/15 border border-[#E50914]/30">MCA</span>
              </span>
              <span className="text-[10px] font-mono text-[#8E8E93] uppercase tracking-wider">
                Intelligence Matrix
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/assessment"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                isActive('/assessment') ? 'bg-[#E50914] text-white shadow-sm' : 'text-[#8E8E93] hover:text-white hover:bg-white/5'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Assessment</span>
            </Link>

            <Link
              to="/anonymous-counselling"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                isActive('/anonymous-counselling') ? 'bg-[#E50914] text-white shadow-sm' : 'text-[#8E8E93] hover:text-white hover:bg-white/5'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Anonymous Support</span>
            </Link>

            {user && (
              <Link
                to={user.role === 'admin' ? '/admin' : user.role === 'counsellor' ? '/counsellor' : '/dashboard'}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  isActive('/dashboard') || isActive('/admin') || isActive('/counsellor')
                    ? 'bg-[#E50914] text-white shadow-sm'
                    : 'text-[#8E8E93] hover:text-white hover:bg-white/5'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
            )}
          </div>

          {/* Right Action Profile / Auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-medium text-white">{user.fullName}</span>
                  <span className="text-[10px] font-mono text-[#E50914] uppercase">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-white/5 hover:bg-[#E50914]/20 text-[#8E8E93] hover:text-[#E50914] border border-white/10 transition-all cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-[#8E8E93] hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-[#E50914] hover:bg-[#c20811] text-white rounded-lg text-xs font-mono uppercase tracking-wider transition-all shadow-md"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};
