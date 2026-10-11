import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { getDb } from './db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'mca-student-stress-prediction-system-secret-2026-key';

export interface UserTokenPayload {
  userId: number;
  email: string;
  role: 'student' | 'admin' | 'counsellor';
  studentId?: number;
  counsellorId?: number;
  fullName: string;
}

export function generateToken(payload: UserTokenPayload, expiresIn: string = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): UserTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserTokenPayload;
  } catch {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: UserTokenPayload;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token. Please sign in again.' });
  }

  req.user = payload;
  next();
}

export function requireRole(...allowedRoles: Array<'student' | 'admin' | 'counsellor'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized. Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden. Role '${req.user.role}' not permitted to access this resource.` });
    }
    next();
  };
}

export interface AnswerInput {
  questionId: number;
  answer: 'Yes' | 'Sometimes' | 'No';
}

export interface AssessmentCalculationResult {
  totalScore: number;
  stressLevel: 'Low' | 'Moderate' | 'High';
  contributingFactors: string[];
  recommendationIds: number[];
  recommendationSuggestions: Array<{ id: number; category: string; suggestion: string }>;
  optionDistribution: {
    yesCount: number;
    sometimesCount: number;
    noCount: number;
    yesPercentage: number;
    sometimesPercentage: number;
    noPercentage: number;
  };
}

export async function calculateStressAssessment(
  stressArea: 'Home' | 'College/School' | 'Both',
  answers: AnswerInput[]
): Promise<AssessmentCalculationResult> {
  const db = await getDb();

  // Validate that exactly 20 answers are submitted
  if (!Array.isArray(answers) || answers.length !== 20) {
    throw new Error('Assessment requires responses to all 20 questions.');
  }

  // Fetch questionnaires from DB
  const qRows = await db.query(`SELECT id, question_text, category, stress_area, weight FROM questionnaires`);
  const qMap = new Map<number, { id: number; text: string; category: string; stressArea: string; weight: number }>();
  qRows.rows.forEach((r: any) => {
    qMap.set(r.id, { id: r.id, text: r.question_text, category: r.category, stressArea: r.stress_area, weight: r.weight });
  });

  let totalScore = 0;
  let yesCount = 0;
  let sometimesCount = 0;
  let noCount = 0;
  const highImpactCategories: { [cat: string]: number } = {};

  for (const ans of answers) {
    const q = qMap.get(ans.questionId);
    let itemScore = 0;
    if (ans.answer === 'Yes') {
      itemScore = 2;
      yesCount++;
    } else if (ans.answer === 'Sometimes') {
      itemScore = 1;
      sometimesCount++;
    } else if (ans.answer === 'No') {
      itemScore = 0;
      noCount++;
    } else {
      throw new Error(`Invalid answer value '${ans.answer}'. Must be Yes, Sometimes, or No.`);
    }

    totalScore += itemScore;

    if (q && itemScore > 0) {
      highImpactCategories[q.category] = (highImpactCategories[q.category] || 0) + itemScore;
    }
  }

  // Clamp totalScore between 0 and 40
  if (totalScore < 0) totalScore = 0;
  if (totalScore > 40) totalScore = 40;

  // Determine stress level strictly using project specification
  let stressLevel: 'Low' | 'Moderate' | 'High';
  if (totalScore <= 13) {
    stressLevel = 'Low';
  } else if (totalScore <= 26) {
    stressLevel = 'Moderate';
  } else {
    stressLevel = 'High';
  }

  // Extract major contributing factors (ranked by highest score impact)
  const sortedCategories = Object.entries(highImpactCategories)
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat);

  let contributingFactors = sortedCategories.slice(0, 4);
  if (contributingFactors.length === 0) {
    contributingFactors = ['Consistent Daily Habits', 'Positive Routine Balance'];
  }

  // Fetch appropriate recommendations from PostgreSQL
  const recResult = await db.query(
    `SELECT id, category, suggestion FROM recommendations WHERE stress_level = $1 AND is_active = TRUE ORDER BY id ASC`,
    [stressLevel]
  );

  const recommendationSuggestions = recResult.rows.map((r: any) => ({
    id: r.id,
    category: r.category,
    suggestion: r.suggestion
  }));

  const recommendationIds = recommendationSuggestions.map(r => r.id);

  return {
    totalScore,
    stressLevel,
    contributingFactors,
    recommendationIds,
    recommendationSuggestions,
    optionDistribution: {
      yesCount,
      sometimesCount,
      noCount,
      yesPercentage: Math.round((yesCount / 20) * 100),
      sometimesPercentage: Math.round((sometimesCount / 20) * 100),
      noPercentage: Math.round((noCount / 20) * 100)
    }
  };
}
