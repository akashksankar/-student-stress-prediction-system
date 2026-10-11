export type Role = 'student' | 'admin' | 'counsellor';

export type StressArea = 'Home' | 'College/School' | 'Both';

export type StressLevel = 'Low' | 'Moderate' | 'High';

export type AnswerChoice = 'Yes' | 'Sometimes' | 'No';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  studentId?: number;
  counsellorId?: number;
  course?: string;
  academicYear?: string;
}

export interface Question {
  index?: number;
  id: number;
  questionText: string;
  category: string;
  stressArea: StressArea;
  weight?: number;
  isActive?: boolean;
}

export interface OptionDistribution {
  yesCount: number;
  sometimesCount: number;
  noCount: number;
  yesPercentage: number;
  sometimesPercentage: number;
  noPercentage: number;
}

export interface DomainScore {
  domain: string;
  score: number;
  maxScore: number;
  percentage: number;
  severity: 'Low' | 'Moderate' | 'High';
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
  recommendations?: Recommendation[];
  counsellingRequest?: CounsellingRequest;
  optionDistribution?: OptionDistribution;
  domainBreakdown?: DomainScore[];
}

export interface Recommendation {
  id: number;
  stressLevel: StressLevel;
  category: string;
  suggestion: string;
}

export interface CounsellingRequest {
  id: number;
  assessment_id?: number;
  student_id?: number;
  student_name?: string;
  course?: string;
  academic_year?: string;
  counsellor_id?: number;
  counsellor_name?: string;
  status: 'Pending' | 'Scheduled' | 'Completed' | 'Reviewed';
  notes?: string;
  summary?: string;
  scheduled_at?: string;
  created_at: string;
}

export interface CounsellorProfile {
  id: number;
  userId: number;
  displayName: string;
  specialization: string;
  email: string;
  phone?: string;
  officeLocation?: string;
  isAvailable: boolean;
}
