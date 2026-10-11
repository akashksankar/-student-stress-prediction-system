export type UserRole = 'student' | 'admin' | 'counsellor';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  studentId?: number;
  counsellorId?: number;
  course?: string;
  academicYear?: string;
}

export interface StudentProfile {
  id: number;
  name: string;
  email: string;
  age?: number | null;
  course: string;
  academic_year: string;
  created_at: string;
}

export type StressArea = 'Home' | 'College/School' | 'Both';
export type StressLevel = 'Low' | 'Moderate' | 'High';
export type AnswerChoice = 'Yes' | 'Sometimes' | 'No';

export interface Question {
  index: number;
  id: number;
  questionText: string;
  category: string;
  stressArea: StressArea;
  weight: number;
}

export interface AssessmentResult {
  id: number;
  studentId: number;
  studentName?: string;
  course?: string;
  academicYear?: string;
  stressArea: StressArea;
  totalScore: number;
  stressLevel: StressLevel;
  completedAt: string;
  contributingFactors: string[];
  recommendations: Array<{
    id: number;
    category: string;
    suggestion: string;
    stress_level?: string;
  }>;
  counsellingRequest?: {
    id: number;
    status: 'Pending' | 'Reviewed' | 'Resolved';
    summary: string;
    created_at: string;
  } | null;
}

export interface CounsellingRequest {
  id: number;
  assessment_id: number;
  student_id: number;
  student_name?: string;
  course?: string;
  counsellor_id?: number | null;
  counsellor_name?: string;
  summary: string;
  status: 'Pending' | 'Reviewed' | 'Resolved';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AnonymousSession {
  sessionId: string;
  guestId: string;
  guestAlias: string;
  guestToken: string;
  sessionType: 'audio' | 'video' | 'chat';
  status: 'waiting' | 'active' | 'ended';
  counsellorName?: string;
  counsellorOnline?: boolean;
}
