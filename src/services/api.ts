import { User, Question, AssessmentResult, StressArea, AnswerChoice } from '../types';

const API_BASE = '/api';

export function getStoredToken(): string | null {
  return localStorage.getItem('spss_jwt_token');
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem('spss_jwt_token', token);
  } else {
    localStorage.removeItem('spss_jwt_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = 'An unexpected server error occurred';
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errJson.message || errorMsg;
    } catch {
      errorMsg = `${response.status} ${response.statusText}`;
    }
    throw new Error(errorMsg);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Auth
  register: (data: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword?: string;
    course?: string;
    academicYear?: string;
    age?: number;
  }) => request<{ message: string; token: string; user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  login: (data: { email: string; password: string }) =>
    request<{ message: string; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getCurrentUser: () => request<{ user: User }>('/auth/me'),

  forgotPassword: (email: string) =>
    request<{ message: string; temporaryPassword?: string; note?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  // Student
  getStudentDashboard: () => request<any>('/student/dashboard'),
  getStudentProfile: () => request<{ student: any }>('/student/profile'),
  updateStudentProfile: (data: any) =>
    request<{ message: string; student: any }>('/student/profile', {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
  getStudentAssessments: () => request<{ assessments: any[] }>('/student/assessments'),

  // Assessment
  getQuestions: (stressArea: StressArea) =>
    request<{ stressArea: StressArea; totalQuestions: number; questions: Question[] }>(
      `/assessments/questions?stressArea=${encodeURIComponent(stressArea)}`
    ),

  submitAssessment: (data: {
    stressArea: StressArea;
    answers: Array<{ questionId: number; answer: AnswerChoice }>;
  }) =>
    request<{
      message: string;
      assessmentId: number;
      stressArea: StressArea;
      totalScore: number;
      stressLevel: string;
      contributingFactors: string[];
      recommendations: any[];
      completedAt: string;
    }>('/assessments/submit', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getAssessmentResult: (id: number | string) =>
    request<{ assessment: AssessmentResult }>(`/assessments/${id}/result`),

  // Counselling
  requestCounselling: (data: { assessmentId: number; note?: string }) =>
    request<{ message: string; requestId: number; status: string; createdAt: string }>(
      '/counselling/requests',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    ),

  getMyCounsellingRequests: () => request<{ requests: any[] }>('/counselling/my-requests'),

  // Anonymous WebRTC Room
  createAnonymousSession: (sessionType: 'audio' | 'video' | 'chat') =>
    request<{
      sessionId: string;
      guestId: string;
      guestAlias: string;
      guestToken: string;
      sessionType: 'audio' | 'video' | 'chat';
      status: string;
      counsellorOnline: boolean;
      counsellorName: string;
    }>('/anonymous-counselling/session', {
      method: 'POST',
      body: JSON.stringify({ sessionType })
    }),

  getAnonymousSession: (sessionId: string) =>
    request<{
      sessionId: string;
      guestAlias: string;
      sessionType: 'audio' | 'video' | 'chat';
      status: string;
      counsellorName: string;
      createdAt: string;
      startedAt?: string;
      endedAt?: string;
    }>(`/anonymous-counselling/session/${sessionId}`),

  leaveAnonymousSession: (sessionId: string) =>
    request<{ message: string }>(`/anonymous-counselling/session/${sessionId}/leave`, {
      method: 'POST'
    }),

  // Counsellor
  getCounsellorProfile: () => request<{ profile: any }>('/counsellor/profile'),
  updateCounsellorAvailability: (isAvailable: boolean) =>
    request<{ message: string; isAvailable: boolean }>('/counsellor/availability', {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable })
    }),
  getWaitingSessions: () => request<{ sessions: any[] }>('/counsellor/waiting-sessions'),
  acceptSession: (sessionId: string) =>
    request<{ message: string }>(`/counsellor/session/${sessionId}/accept`, { method: 'POST' }),
  endSession: (sessionId: string) =>
    request<{ message: string }>(`/counsellor/session/${sessionId}/end`, { method: 'POST' }),
  getCounsellorRequests: () => request<{ requests: any[] }>('/counsellor/counselling-requests'),
  updateCounsellingRequest: (requestId: number, data: { status: string; notes?: string }) =>
    request<{ message: string; request: any }>(`/counsellor/counselling-requests/${requestId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  // Admin
  getAdminDashboard: () => request<any>('/admin/dashboard'),
  getAdminStudents: (search: string = '') =>
    request<{ students: any[] }>(`/admin/students?search=${encodeURIComponent(search)}`),
  getAdminQuestions: () => request<{ questions: any[] }>('/admin/questions'),
  createAdminQuestion: (data: any) =>
    request<{ message: string; question: any }>('/admin/questions', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateAdminQuestion: (id: number, data: any) =>
    request<{ message: string; question: any }>(`/admin/questions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
  deleteAdminQuestion: (id: number) =>
    request<{ message: string }>(`/admin/questions/${id}`, { method: 'DELETE' }),
  getAdminCounsellingRequests: () => request<{ requests: any[] }>('/admin/counselling/requests'),
  updateAdminCounsellingRequest: (requestId: number, data: { status: string; notes?: string }) =>
    request<{ message: string; request: any }>(`/admin/counselling/requests/${requestId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
  getAdminReports: () => request<{ reports: any[] }>('/admin/reports'),
  generateAdminReport: (reportType: string) =>
    request<{ message: string; report: any }>('/admin/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ reportType })
    })
};
