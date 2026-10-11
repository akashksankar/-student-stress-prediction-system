import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import {
  Users,
  Activity,
  FileText,
  Download,
  Plus,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Search
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [counsellingRequests, setCounsellingRequests] = useState<any[]>([]);
  
  const [searchStudent, setSearchStudent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQText, setNewQText] = useState('');
  const [newQCat, setNewQCat] = useState('Academic Workload');
  const [newQArea, setNewQArea] = useState('College/School');
  const [newQWeight, setNewQWeight] = useState(1);

  useEffect(() => {
    loadAllAdminData();
  }, [currentTab]);

  const loadAllAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (currentTab === 'overview') {
        const d = await api.getAdminDashboard();
        setDashboardData(d);
      } else if (currentTab === 'students') {
        const s = await api.getAdminStudents(searchStudent);
        setStudents(s.students);
      } else if (currentTab === 'questions') {
        const q = await api.getAdminQuestions();
        setQuestions(q.questions);
      } else if (currentTab === 'counselling') {
        const c = await api.getAdminCounsellingRequests();
        setCounsellingRequests(c.requests);
      } else if (currentTab === 'reports') {
        const r = await api.getAdminReports();
        setReports(r.reports);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve administrative data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchStudents = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const s = await api.getAdminStudents(searchStudent);
      setStudents(s.students);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAdminQuestion({
        questionText: newQText,
        category: newQCat,
        stressArea: newQArea,
        weight: newQWeight
      });
      setShowAddQuestion(false);
      setNewQText('');
      const q = await api.getAdminQuestions();
      setQuestions(q.questions);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleQuestionActive = async (qId: number, currentActive: boolean) => {
    try {
      await api.updateAdminQuestion(qId, { isActive: !currentActive });
      const q = await api.getAdminQuestions();
      setQuestions(q.questions);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGenerateReport = async () => {
    try {
      await api.generateAdminReport('comprehensive_institutional_stress_report');
      const r = await api.getAdminReports();
      setReports(r.reports);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleExportCsv = () => {
    window.location.href = '/api/admin/export/csv';
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#0B0C0E] text-[#EDEDED] relative overflow-hidden py-8">
      {/* Background radial crimson glow */}
      <div className="absolute top-20 right-1/4 w-[600px] h-[450px] bg-[#E50914]/[0.05] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7 relative z-10">
        
        {/* Admin Header */}
        <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="w-4 h-[2px] bg-[#E50914]" />
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A1A1AA]">
                ADMIN CLEARANCE
              </span>
              <span className="text-white/20">|</span>
              <span className="text-xs text-[#8E8E93] font-mono">POSTGRESQL 16 PRODUCTION</span>
            </div>
            <h1 className="font-['Outfit'] text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Institutional Operations Console
            </h1>
            <p className="text-sm text-[#9E9EA4] font-light">
              Database-backed screening analytics, question repository controls, and student rosters.
            </p>
          </div>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#E50914] hover:bg-[#c20811] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-md group shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Export CSV Dossier</span>
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
              <ArrowRight className="w-3 h-3 text-white" />
            </div>
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-[#E50914]/10 border border-[#E50914]/40 rounded-xl text-xs font-mono text-[#FF4D57] flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#E50914]" />
            <span>{error}</span>
          </div>
        )}

        {/* Admin Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto font-mono text-xs">
          <button
            onClick={() => setSearchParams({ tab: 'overview' })}
            className={`px-4 py-2 rounded-full uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
              currentTab === 'overview'
                ? 'bg-[#E50914] text-white shadow-md font-semibold'
                : 'text-[#8E8E93] hover:text-white bg-[#17181F] border border-white/10'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'students' })}
            className={`px-4 py-2 rounded-full uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
              currentTab === 'students'
                ? 'bg-[#E50914] text-white shadow-md font-semibold'
                : 'text-[#8E8E93] hover:text-white bg-[#17181F] border border-white/10'
            }`}
          >
            Student Roster
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'questions' })}
            className={`px-4 py-2 rounded-full uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
              currentTab === 'questions'
                ? 'bg-[#E50914] text-white shadow-md font-semibold'
                : 'text-[#8E8E93] hover:text-white bg-[#17181F] border border-white/10'
            }`}
          >
            Question Bank
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'counselling' })}
            className={`px-4 py-2 rounded-full uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
              currentTab === 'counselling'
                ? 'bg-[#E50914] text-white shadow-md font-semibold'
                : 'text-[#8E8E93] hover:text-white bg-[#17181F] border border-white/10'
            }`}
          >
            Support Cases
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'reports' })}
            className={`px-4 py-2 rounded-full uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
              currentTab === 'reports'
                ? 'bg-[#E50914] text-white shadow-md font-semibold'
                : 'text-[#8E8E93] hover:text-white bg-[#17181F] border border-white/10'
            }`}
          >
            Institutional Reports
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {currentTab === 'overview' && dashboardData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#111216] border border-white/10 rounded-2xl p-5 shadow-xl hover:border-[#E50914]/40 transition-all">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A1A1AA] block">
                  Registered Students
                </span>
                <div className="mt-3 font-['Outfit'] text-4xl font-extrabold text-white">
                  {dashboardData.metrics.totalStudents}
                </div>
                <p className="font-mono text-[10px] text-[#71717A] mt-2">ROSTER ACCOUNTS</p>
              </div>

              <div className="bg-[#111216] border border-white/10 rounded-2xl p-5 shadow-xl hover:border-[#E50914]/40 transition-all">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A1A1AA] block">
                  Completed Screenings
                </span>
                <div className="mt-3 font-['Outfit'] text-4xl font-extrabold text-[#E50914]">
                  {dashboardData.metrics.totalAssessments}
                </div>
                <p className="font-mono text-[10px] text-[#71717A] mt-2">20-ITEM SUBMISSIONS</p>
              </div>

              <div className="bg-[#111216] border border-white/10 rounded-2xl p-5 shadow-xl hover:border-[#E50914]/40 transition-all">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A1A1AA] block">
                  Pending Support Cases
                </span>
                <div className="mt-3 font-['Outfit'] text-4xl font-extrabold text-white">
                  {dashboardData.metrics.pendingCounsellingRequests}
                </div>
                <p className="font-mono text-[10px] text-[#71717A] mt-2">AWAITING REVIEW</p>
              </div>

              <div className="bg-[#111216] border border-white/10 rounded-2xl p-5 shadow-xl hover:border-[#E50914]/40 transition-all">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A1A1AA] block mb-2">
                  Classification Ratios
                </span>
                <div className="font-mono text-xs space-y-1.5 pt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8E8E93]">Low (0–13):</span>
                    <span className="font-semibold text-white">{dashboardData.metrics.stressLevels.Low}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8E8E93]">Moderate (14–26):</span>
                    <span className="font-semibold text-amber-400">{dashboardData.metrics.stressLevels.Moderate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8E8E93]">High (27–40):</span>
                    <span className="font-semibold text-[#E50914]">{dashboardData.metrics.stressLevels.High}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xl">
              <div className="pb-3 border-b border-white/10 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-[2px] bg-[#E50914]" />
                  <h2 className="font-['Outfit'] text-xl font-bold text-white">
                    Recent Verified Assessments
                  </h2>
                </div>
                <p className="font-mono text-xs text-[#8E8E93]">
                  Latest submissions across the university network.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA]">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Course</th>
                      <th className="py-3 px-4">Domain</th>
                      <th className="py-3 px-4 text-center">Score</th>
                      <th className="py-3 px-4">Classification</th>
                      <th className="py-3 px-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {dashboardData.recentAssessments.map((a: any) => (
                      <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-medium text-white">{a.student_name}</td>
                        <td className="py-3.5 px-4 text-[#8E8E93]">{a.course}</td>
                        <td className="py-3.5 px-4">{a.stress_area}</td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-[#E50914]">{a.total_score} / 40</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                            a.stress_level === 'High'
                              ? 'bg-[#E50914]/15 text-[#E50914] border border-[#E50914]/30'
                              : a.stress_level === 'Moderate'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {a.stress_level}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-[#8E8E93]">
                          {new Date(a.completed_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STUDENTS ROSTER */}
        {currentTab === 'students' && (
          <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-[2px] bg-[#E50914]" />
                  <h2 className="font-['Outfit'] text-xl font-bold text-white">
                    Registered Student Roster
                  </h2>
                </div>
                <p className="font-mono text-xs text-[#8E8E93]">Search active student database records.</p>
              </div>
              <form onSubmit={handleSearchStudents} className="flex gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search name or email..."
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    className="px-4 py-2 pl-9 bg-[#17181F] border border-white/10 rounded-xl text-white text-xs outline-none focus:border-[#E50914]"
                  />
                  <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-3" />
                </div>
                <button type="submit" className="px-5 py-2 bg-[#E50914] text-white rounded-xl font-mono text-xs uppercase hover:bg-[#c20811] transition-all">
                  Search
                </button>
              </form>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA]">
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Campus Email</th>
                    <th className="py-3 px-4">Course / Year</th>
                    <th className="py-3 px-4 text-center">Screenings</th>
                    <th className="py-3 px-4 text-right">Enrolled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[#8E8E93]">STD-{s.id.toString().padStart(4, '0')}</td>
                      <td className="py-3.5 px-4 font-medium text-white">{s.name}</td>
                      <td className="py-3.5 px-4 font-mono text-[#8E8E93]">{s.email}</td>
                      <td className="py-3.5 px-4 text-white">{s.course} ({s.academic_year})</td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-[#E50914]">{s.assessment_count}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-[#8E8E93]">
                        {new Date(s.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: QUESTION BANK */}
        {currentTab === 'questions' && (
          <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-[2px] bg-[#E50914]" />
                  <h2 className="font-['Outfit'] text-xl font-bold text-white">
                    Questionnaire Bank Repository
                  </h2>
                </div>
                <p className="font-mono text-xs text-[#8E8E93]">
                  20 active items calibrated across Home, College/School, and Both.
                </p>
              </div>
              <button
                onClick={() => setShowAddQuestion(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E50914] text-white rounded-full font-mono text-xs uppercase tracking-wider hover:bg-[#c20811] shadow-md transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>

            {showAddQuestion && (
              <form onSubmit={handleAddQuestion} className="p-5 bg-[#17181F] border border-white/10 rounded-2xl space-y-4 font-mono text-xs">
                <h3 className="font-['Outfit'] text-base font-bold text-white">Create Inventory Item</h3>
                <div>
                  <label className="block text-[11px] text-[#A1A1AA] uppercase tracking-wider mb-1.5">Prompt Text:</label>
                  <input
                    type="text"
                    required
                    value={newQText}
                    onChange={(e) => setNewQText(e.target.value)}
                    placeholder="e.g. Do you feel excessive strain from continuous evaluation tests?"
                    className="w-full px-4 py-2.5 bg-[#111216] border border-white/10 rounded-xl text-white outline-none focus:border-[#E50914]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#A1A1AA] uppercase tracking-wider mb-1.5">Category:</label>
                    <input
                      type="text"
                      required
                      value={newQCat}
                      onChange={(e) => setNewQCat(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#111216] border border-white/10 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#A1A1AA] uppercase tracking-wider mb-1.5">Stress Area:</label>
                    <select
                      value={newQArea}
                      onChange={(e) => setNewQArea(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#111216] border border-white/10 rounded-xl text-white"
                    >
                      <option value="College/School">College/School</option>
                      <option value="Home">Home</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#A1A1AA] uppercase tracking-wider mb-1.5">Weight (Pts):</label>
                    <input
                      type="number"
                      value={newQWeight}
                      onChange={(e) => setNewQWeight(parseInt(e.target.value, 10))}
                      className="w-full px-3.5 py-2 bg-[#111216] border border-white/10 rounded-xl text-white text-center"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddQuestion(false)}
                    className="px-4 py-2 bg-[#111216] text-[#8E8E93] hover:text-white rounded-lg border border-white/10"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-[#E50914] text-white rounded-lg font-mono text-xs uppercase hover:bg-[#c20811]">
                    Save Question
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA]">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Question Prompt</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Area</th>
                    <th className="py-3 px-4 text-center">Weight</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {questions.map((q, idx) => (
                    <tr key={q.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 text-[#E50914] font-mono font-bold">{idx + 1}</td>
                      <td className="py-3.5 px-4 text-white max-w-md font-medium">{q.question_text}</td>
                      <td className="py-3.5 px-4 text-[#8E8E93]">{q.category}</td>
                      <td className="py-3.5 px-4">{q.stress_area}</td>
                      <td className="py-3.5 px-4 text-center font-mono">{q.weight}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                          q.is_active ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-[#71717A]'
                        }`}>
                          {q.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleQuestionActive(q.id, q.is_active)}
                          className="text-[#E50914] hover:underline font-mono text-xs uppercase"
                        >
                          {q.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: COUNSELLING */}
        {currentTab === 'counselling' && (
          <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xl">
            <div className="pb-4 border-b border-white/10 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-[2px] bg-[#E50914]" />
                <h2 className="font-['Outfit'] text-xl font-bold text-white">
                  Campus Support Referrals
                </h2>
              </div>
              <p className="font-mono text-xs text-[#8E8E93]">
                Summarized stress reports routed for clinical review.
              </p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {counsellingRequests.map((r) => {
                let parsed: any = null;
                try { parsed = JSON.parse(r.summary); } catch {}

                return (
                  <div key={r.id} className="p-5 bg-[#17181F] border border-white/5 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <span className="font-bold text-white text-sm">{r.student_name} ({r.course})</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        r.status === 'Resolved' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-[#E50914]/15 text-[#E50914]'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                    {parsed && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-[#8E8E93]">
                        <div>AREA: <span className="text-white font-medium ml-1">{parsed.stressArea}</span></div>
                        <div>LEVEL: <span className="text-[#E50914] font-medium ml-1">{parsed.stressLevel}</span></div>
                        <div>SCORE: <span className="text-white font-medium ml-1">{parsed.totalScore}/40</span></div>
                        <div>COUNSELLOR: <span className="text-white ml-1">{r.counsellor_name || 'Dr. Evelyn Reed'}</span></div>
                      </div>
                    )}
                    {r.notes && (
                      <div className="p-3 bg-[#111216] border border-white/10 rounded-xl text-xs text-[#EDEDED] font-sans font-light">
                        NOTES: {r.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: REPORTS */}
        {currentTab === 'reports' && (
          <div className="bg-[#111216] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-[2px] bg-[#E50914]" />
                  <h2 className="font-['Outfit'] text-xl font-bold text-white">
                    Institutional Reports Archive
                  </h2>
                </div>
                <p className="font-mono text-xs text-[#8E8E93]">
                  Aggregation reports recorded in PostgreSQL database.
                </p>
              </div>
              <button
                onClick={handleGenerateReport}
                className="px-6 py-2.5 bg-[#E50914] text-white rounded-full font-mono text-xs uppercase tracking-wider hover:bg-[#c20811] shadow-md transition-all self-start sm:self-auto"
              >
                Generate New Report
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              {reports.map((rep) => {
                let parsed: any = null;
                try { parsed = JSON.parse(rep.report_data); } catch {}

                return (
                  <div key={rep.id} className="p-5 bg-[#17181F] border border-white/5 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <span className="font-bold text-white text-sm">{parsed?.title || rep.report_type}</span>
                      <span className="text-[11px] text-[#8E8E93]">
                        {new Date(rep.generated_at).toLocaleString()}
                      </span>
                    </div>
                    {parsed && (
                      <div className="space-y-2 text-[#8E8E93]">
                        <p>Authorized Admin: <span className="text-white font-medium">{parsed.authorizedAdmin}</span></p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-white">
                          <div>Students: <span className="font-bold text-[#E50914] ml-1">{parsed.totalRegisteredStudents}</span></div>
                          <div>Assessments: <span className="font-bold text-[#E50914] ml-1">{parsed.totalCompletedAssessments}</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
