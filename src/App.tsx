import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { AssessmentPage } from './pages/AssessmentPage';
import { ResultsPage } from './pages/ResultsPage';
import { AssessmentHistoryPage } from './pages/AssessmentHistoryPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { CounsellingSupportPage } from './pages/CounsellingSupportPage';
import { AnonymousCounsellingPage } from './pages/AnonymousCounsellingPage';
import { CounsellorConsolePage } from './pages/CounsellorConsolePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactElement;
  allowedRoles?: Array<'student' | 'admin' | 'counsellor'>;
}> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0C0E]">
        <div className="text-xs font-mono tracking-widest text-[#8E8E93] uppercase animate-pulse">Verifying secure session...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If wrong role, redirect to appropriate home
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'counsellor') return <Navigate to="/counsellor/console" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-[#0B0C0E] text-[#EDEDED]">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/anonymous-counselling" element={<AnonymousCounsellingPage />} />

              {/* Student Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assessment"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <AssessmentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/results/:id"
                element={
                  <ProtectedRoute>
                    <ResultsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <AssessmentHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recommendations"
                element={
                  <ProtectedRoute>
                    <RecommendationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/counsellor"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <CounsellingSupportPage />
                  </ProtectedRoute>
                }
              />

              {/* Counsellor Protected Routes */}
              <Route
                path="/counsellor/console"
                element={
                  <ProtectedRoute allowedRoles={['counsellor', 'admin']}>
                    <CounsellorConsolePage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
