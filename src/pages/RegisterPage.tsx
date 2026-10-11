import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Lock, Mail, User, School, Calendar, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('MCA Computer Applications');
  const [academicYear, setAcademicYear] = useState('Year 1');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register({
        fullName,
        email,
        password,
        course,
        academicYear
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0B0C0E] text-[#EDEDED] flex items-center justify-center p-4 relative overflow-hidden py-12">
      
      {/* Background radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#E50914]/[0.05] rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-lg bg-[#111216] border border-white/10 rounded-2xl p-8 space-y-6 shadow-2xl relative z-10">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#E50914] flex items-center justify-center text-white font-['Outfit'] font-bold text-xl mx-auto shadow-lg">
            SP
          </div>
          <h1 className="font-['Outfit'] text-2xl font-bold tracking-tight text-white">
            Student Profile Enrollment
          </h1>
          <p className="font-mono text-xs text-[#8E8E93]">
            Create your confidential stress diagnostic student account
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-[#E50914]/10 border border-[#E50914]/40 rounded-xl text-xs font-mono text-[#FF4D57] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#E50914]" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5">
              Full Name:
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full pl-10 pr-4 py-3 bg-[#17181F] border border-white/10 rounded-xl focus:border-[#E50914] outline-none text-xs text-white placeholder-[#71717A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5">
              University Email:
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full pl-10 pr-4 py-3 bg-[#17181F] border border-white/10 rounded-xl focus:border-[#E50914] outline-none text-xs text-white placeholder-[#71717A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5">
                Degree / Course:
              </label>
              <input
                type="text"
                required
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full px-3.5 py-3 bg-[#17181F] border border-white/10 rounded-xl focus:border-[#E50914] outline-none text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5">
                Academic Year:
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3.5 py-3 bg-[#17181F] border border-white/10 rounded-xl focus:border-[#E50914] outline-none text-xs text-white"
              >
                <option value="Year 1">Year 1</option>
                <option value="Year 2">Year 2</option>
                <option value="Year 3">Year 3</option>
                <option value="Year 4">Year 4</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5">
                Password:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#17181F] border border-white/10 rounded-xl focus:border-[#E50914] outline-none text-xs text-white placeholder-[#71717A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5">
                Confirm Password:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#17181F] border border-white/10 rounded-xl focus:border-[#E50914] outline-none text-xs text-white placeholder-[#71717A]"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#E50914] hover:bg-[#c20811] text-white rounded-xl text-xs font-mono uppercase tracking-wider font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Creating Account...' : 'Enroll Student Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <p className="text-center font-mono text-xs text-[#8E8E93]">
          Already enrolled?{' '}
          <Link to="/login" className="text-[#E50914] hover:underline font-semibold">
            Sign In Here
          </Link>
        </p>

      </div>

    </div>
  );
};
