import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    course: 'MCA Computer Applications',
    academicYear: 'Year 1',
    age: '21'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        course: formData.course,
        academicYear: formData.academicYear,
        age: parseInt(formData.age, 10) || 21
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#0B0C0E] text-[#EDEDED] relative overflow-hidden">
      {/* Background crimson ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-[#E50914]/[0.06] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-lg w-full bg-[#111216] border border-white/10 rounded-2xl p-8 sm:p-10 space-y-7 shadow-2xl relative z-10 transition-all hover:border-[#E50914]/30">
        
        {/* Micro Kicker with Red Tick */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-4 h-[2px] bg-[#E50914]" />
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A1A1AA]">
              STUDENT ENROLLMENT
            </span>
          </div>
          <h2 className="font-['Outfit'] text-3xl font-bold tracking-tight text-white">
            Register Account
          </h2>
          <p className="text-sm text-[#9E9EA4] leading-relaxed font-light">
            Create an encrypted student profile to track stress biomarkers and access confidential support.
          </p>
        </div>

        <div className="w-full red-glow-line" />

        {error && (
          <div className="p-3.5 bg-[#E50914]/10 border border-[#E50914]/40 rounded-xl text-xs font-mono text-[#FF4D57] flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#E50914]" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5">
              Full Legal Name
            </label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Alex Vance"
              className="w-full px-4 py-3 bg-[#17181F] border border-white/10 rounded-xl focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] outline-none text-xs text-white placeholder-[#71717A] transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5">
              Campus Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="alex.vance@stresspredict.edu"
              className="w-full px-4 py-3 bg-[#17181F] border border-white/10 rounded-xl focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] outline-none text-xs text-white placeholder-[#71717A] transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5">
                Degree / Course
              </label>
              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="w-full px-3 py-3 bg-[#17181F] border border-white/10 rounded-xl focus:border-[#E50914] outline-none text-xs text-white"
              >
                <option value="MCA Computer Applications">MCA</option>
                <option value="B.Tech Computer Science">B.Tech CS</option>
                <option value="B.Tech Electronics">B.Tech ECE</option>
                <option value="B.Sc Data Science">B.Sc Data</option>
                <option value="MBA Management">MBA</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5">
                Academic Year
              </label>
              <select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                className="w-full px-3 py-3 bg-[#17181F] border border-white/10 rounded-xl focus:border-[#E50914] outline-none text-xs text-white"
              >
                <option value="Year 1">Year 1</option>
                <option value="Year 2">Year 2</option>
                <option value="Year 3">Year 3</option>
                <option value="Year 4">Year 4</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5">
                Age
              </label>
              <input
                type="number"
                name="age"
                min="16"
                max="60"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-3 py-3 bg-[#17181F] border border-white/10 rounded-xl focus:border-[#E50914] outline-none text-xs text-white text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5">
                Create Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#17181F] border border-white/10 rounded-xl focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] outline-none text-xs text-white placeholder-[#71717A] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#17181F] border border-white/10 rounded-xl focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] outline-none text-xs text-white placeholder-[#71717A] transition-all"
              />
            </div>
          </div>

          <div className="p-3 bg-[#17181F]/70 border border-white/5 rounded-xl text-[11px] text-[#8E8E93] flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#E50914] shrink-0" />
            <span>Encrypted with PostgreSQL relational security and bcrypt cryptographic hashing.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-[#E50914] hover:bg-[#c20811] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-md group flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="font-mono text-xs">ENROLLING RECORD...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-3 h-3 text-white" />
                </div>
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-[#8E8E93] pt-1 border-t border-white/10">
          <span>Already registered? </span>
          <Link to="/login" className="text-[#E50914] font-medium hover:underline ml-1">
            Sign In to Existing Profile
          </Link>
        </div>

      </div>
    </div>
  );
};
