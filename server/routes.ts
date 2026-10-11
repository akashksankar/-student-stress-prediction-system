import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getDb } from './db.js';
import {
  authenticate,
  requireRole,
  generateToken,
  AuthenticatedRequest,
  calculateStressAssessment,
  JWT_SECRET
} from './services.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// ---------------------------------------------------------------------------
// Health Check Endpoint
// ---------------------------------------------------------------------------
router.get('/health', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const studentCount = await db.query(`SELECT COUNT(*) as count FROM students`);
    const assessmentCount = await db.query(`SELECT COUNT(*) as count FROM assessments`);
    res.json({
      status: 'healthy',
      database: 'PostgreSQL (PGlite Engine)',
      uptimeSeconds: Math.floor(process.uptime()),
      totalStudents: Number((studentCount.rows[0] as any)?.count || 0),
      totalAssessments: Number((assessmentCount.rows[0] as any)?.count || 0),
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Authentication Endpoints
// ---------------------------------------------------------------------------
router.post('/auth/register', async (req: Request, res: Response) => {
  const { fullName, email, password, confirmPassword, course, academicYear, age } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'Full name, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ error: 'Password confirmation does not match.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = await getDb();

  try {
    const existing = await db.query(`SELECT id FROM users WHERE email = $1`, [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userResult = await db.query(
      `INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, 'student') RETURNING id, full_name, email, role`,
      [fullName.trim(), cleanEmail, passwordHash]
    );
    const newUser = userResult.rows[0] as any;

    const studentResult = await db.query(
      `INSERT INTO students (user_id, name, email, age, course, academic_year) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [newUser.id, newUser.full_name, newUser.email, age ? Number(age) : null, course || 'MCA Computer Applications', academicYear || 'Year 1']
    );
    const studentId = (studentResult.rows[0] as any).id;

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: 'student',
      studentId,
      fullName: newUser.full_name
    });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser.id,
        fullName: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
        studentId,
        course: course || 'MCA Computer Applications',
        academicYear: academicYear || 'Year 1'
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

router.post('/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = await getDb();

  try {
    const userResult = await db.query(
      `SELECT id, full_name, email, password_hash, role, is_active FROM users WHERE email = $1`,
      [cleanEmail]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
    }

    const user = userResult.rows[0] as any;
    if (!user.is_active) {
      return res.status(403).json({ error: 'This account has been deactivated. Please contact the administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
    }

    let studentId: number | undefined;
    let counsellorId: number | undefined;

    if (user.role === 'student') {
      const studentRes = await db.query(`SELECT id FROM students WHERE user_id = $1`, [user.id]);
      if (studentRes.rows.length > 0) {
        studentId = (studentRes.rows[0] as any).id;
      }
    } else if (user.role === 'counsellor') {
      const cRes = await db.query(`SELECT id FROM counsellor_profiles WHERE user_id = $1`, [user.id]);
      if (cRes.rows.length > 0) {
        counsellorId = (cRes.rows[0] as any).id;
      }
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      studentId,
      counsellorId,
      fullName: user.full_name
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        studentId,
        counsellorId
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Login error: ' + err.message });
  }
});

router.get('/auth/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const db = await getDb();

  try {
    let studentData = null;
    let counsellorData = null;

    if (user.role === 'student') {
      const s = await db.query(
        `SELECT id, name, email, age, course, academic_year, created_at FROM students WHERE user_id = $1`,
        [user.userId]
      );
      if (s.rows.length > 0) {
        studentData = s.rows[0];
      }
    } else if (user.role === 'counsellor') {
      const c = await db.query(
        `SELECT id, display_name, contact_information, is_available FROM counsellor_profiles WHERE user_id = $1`,
        [user.userId]
      );
      if (c.rows.length > 0) {
        counsellorData = c.rows[0];
      }
    }

    res.json({
      user: {
        id: user.userId,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        student: studentData,
        counsellor: counsellorData
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/logout', (req: Request, res: Response) => {
  res.json({ message: 'Session logged out successfully' });
});

router.post('/auth/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  const db = await getDb();
  const userRes = await db.query(`SELECT id, email FROM users WHERE email = $1`, [email.trim().toLowerCase()]);
  if (userRes.rows.length === 0) {
    return res.status(404).json({ error: 'No account registered with this email.' });
  }

  const tempPass = 'ResetPass@2026';
  const newHash = await bcrypt.hash(tempPass, 10);
  await db.query(`UPDATE users SET password_hash = $1 WHERE email = $2`, [newHash, email.trim().toLowerCase()]);

  res.json({
    message: 'Local development password reset completed.',
    temporaryPassword: tempPass,
    note: 'In this local development academic demonstration, your password has been updated to the temporary password shown above.'
  });
});

// ---------------------------------------------------------------------------
// Student Endpoints
// ---------------------------------------------------------------------------
router.get('/student/dashboard', authenticate, requireRole('student'), async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const db = await getDb();

  try {
    const studentRes = await db.query(`SELECT * FROM students WHERE user_id = $1`, [user.userId]);
    if (studentRes.rows.length === 0) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }
    const student = studentRes.rows[0] as any;

    const latestAssessRes = await db.query(
      `SELECT a.*, p.contributing_factors 
       FROM assessments a
       LEFT JOIN predictions p ON p.assessment_id = a.id
       WHERE a.student_id = $1
       ORDER BY a.completed_at DESC LIMIT 1`,
      [student.id]
    );

    let latestAssessment = null;
    let latestRecommendations: any[] = [];

    if (latestAssessRes.rows.length > 0) {
      const a = latestAssessRes.rows[0] as any;
      let factors: string[] = [];
      try {
        factors = a.contributing_factors ? JSON.parse(a.contributing_factors) : [];
      } catch {
        factors = a.contributing_factors ? a.contributing_factors.split(',') : [];
      }

      const recRes = await db.query(
        `SELECT r.id, r.category, r.suggestion, r.stress_level
         FROM recommendations r
         INNER JOIN student_recommendations sr ON sr.recommendation_id = r.id
         WHERE sr.assessment_id = $1`,
        [a.id]
      );

      const respRes = await db.query(
        `SELECT answer, count(*) as count FROM responses WHERE assessment_id = $1 GROUP BY answer`,
        [a.id]
      );
      let yCount = 0;
      let sCount = 0;
      let nCount = 0;
      respRes.rows.forEach((r: any) => {
        if (r.answer === 'Yes') yCount = Number(r.count);
        if (r.answer === 'Sometimes') sCount = Number(r.count);
        if (r.answer === 'No') nCount = Number(r.count);
      });
      const optionDist = {
        yesCount: yCount,
        sometimesCount: sCount,
        noCount: nCount,
        yesPercentage: Math.round((yCount / 20) * 100),
        sometimesPercentage: Math.round((sCount / 20) * 100),
        noPercentage: Math.round((nCount / 20) * 100)
      };

      latestAssessment = {
        id: a.id,
        stressArea: a.stress_area,
        totalScore: a.total_score,
        stressLevel: a.stress_level,
        status: a.status,
        completedAt: a.completed_at,
        contributingFactors: factors,
        optionDistribution: optionDist
      };
      latestRecommendations = recRes.rows;
    }

    const historyRes = await db.query(
      `SELECT id, stress_area, total_score, stress_level, completed_at
       FROM assessments
       WHERE student_id = $1
       ORDER BY completed_at DESC LIMIT 10`,
      [student.id]
    );

    const requestsRes = await db.query(
      `SELECT cr.id, cr.assessment_id, cr.summary, cr.status, cr.created_at, cp.display_name as counsellor_name
       FROM counselling_requests cr
       LEFT JOIN counsellor_profiles cp ON cp.id = cr.counsellor_id
       WHERE cr.student_id = $1
       ORDER BY cr.created_at DESC`,
      [student.id]
    );

    res.json({
      student,
      latestAssessment,
      latestRecommendations,
      history: historyRes.rows.map((h: any) => ({
        id: h.id,
        stressArea: h.stress_area,
        totalScore: h.total_score,
        stressLevel: h.stress_level,
        completedAt: h.completed_at
      })),
      totalAssessments: historyRes.rows.length,
      counsellingRequests: requestsRes.rows
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch student dashboard: ' + err.message });
  }
});

router.get('/student/profile', authenticate, requireRole('student'), async (req: AuthenticatedRequest, res: Response) => {
  const db = await getDb();
  const s = await db.query(`SELECT * FROM students WHERE user_id = $1`, [req.user!.userId]);
  if (s.rows.length === 0) return res.status(404).json({ error: 'Student record not found' });
  res.json({ student: s.rows[0] });
});

router.patch('/student/profile', authenticate, requireRole('student'), async (req: AuthenticatedRequest, res: Response) => {
  const { name, course, academicYear, age } = req.body;
  const db = await getDb();
  try {
    const updated = await db.query(
      `UPDATE students 
       SET name = COALESCE($1, name),
           course = COALESCE($2, course),
           academic_year = COALESCE($3, academic_year),
           age = COALESCE($4, age)
       WHERE user_id = $5
       RETURNING *`,
      [name, course, academicYear, age ? Number(age) : null, req.user!.userId]
    );

    if (name) {
      await db.query(`UPDATE users SET full_name = $1 WHERE id = $2`, [name, req.user!.userId]);
    }

    res.json({ message: 'Profile updated successfully', student: updated.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: 'Profile update failed: ' + err.message });
  }
});

// ---------------------------------------------------------------------------
// Assessment & Questionnaire Endpoints
// ---------------------------------------------------------------------------
router.get('/assessments/questions', authenticate, async (req: Request, res: Response) => {
  const stressArea = (req.query.stressArea as string) || 'Both';
  const db = await getDb();

  try {
    let query = `SELECT id, question_text, category, stress_area, weight FROM questionnaires WHERE is_active = TRUE `;
    let params: any[] = [];

    if (stressArea === 'Home') {
      query += `AND stress_area = 'Home' ORDER BY id ASC LIMIT 20`;
    } else if (stressArea === 'College/School') {
      query += `AND stress_area = 'College/School' ORDER BY id ASC LIMIT 20`;
    } else {
      query += `AND stress_area = 'Both' ORDER BY id ASC LIMIT 20`;
    }

    let qResult = await db.query(query, params);

    if (qResult.rows.length < 20) {
      const allActive = await db.query(`SELECT id, question_text, category, stress_area, weight FROM questionnaires WHERE is_active = TRUE ORDER BY id ASC LIMIT 20`);
      qResult = allActive;
    }

    res.json({
      stressArea,
      totalQuestions: qResult.rows.length,
      questions: qResult.rows.map((q: any, idx: number) => ({
        index: idx + 1,
        id: q.id,
        questionText: q.question_text,
        category: q.category,
        stressArea: q.stress_area,
        weight: q.weight
      }))
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve assessment questions: ' + err.message });
  }
});

router.post('/assessments/submit', authenticate, requireRole('student'), async (req: AuthenticatedRequest, res: Response) => {
  const { stressArea, answers } = req.body;
  const user = req.user!;
  const db = await getDb();

  if (!stressArea || !['Home', 'College/School', 'Both'].includes(stressArea)) {
    return res.status(400).json({ error: 'Invalid or missing stressArea. Must be Home, College/School, or Both.' });
  }

  if (!Array.isArray(answers) || answers.length !== 20) {
    return res.status(400).json({ error: 'All 20 questions must be answered before submission.' });
  }

  try {
    const sRes = await db.query(`SELECT id, name FROM students WHERE user_id = $1`, [user.userId]);
    if (sRes.rows.length === 0) {
      return res.status(404).json({ error: 'Student record not found for this account.' });
    }
    const studentId = (sRes.rows[0] as any).id;

    const calcResult = await calculateStressAssessment(stressArea, answers);

    await db.exec('BEGIN');

    const assessInsert = await db.query(
      `INSERT INTO assessments (student_id, stress_area, total_score, stress_level, status)
       VALUES ($1, $2, $3, $4, 'completed') RETURNING id, completed_at`,
      [studentId, stressArea, calcResult.totalScore, calcResult.stressLevel]
    );
    const assessmentId = (assessInsert.rows[0] as any).id;
    const completedAt = (assessInsert.rows[0] as any).completed_at;

    for (const ans of answers) {
      const qLookup = await db.query(`SELECT question_text, category FROM questionnaires WHERE id = $1`, [ans.questionId]);
      const qRow = qLookup.rows[0] as any;
      const qText = qRow?.question_text || 'Assessment Question';
      const qCat = qRow?.category || 'General';
      const score = ans.answer === 'Yes' ? 2 : ans.answer === 'Sometimes' ? 1 : 0;

      await db.query(
        `INSERT INTO responses (assessment_id, question_id, question_text_snapshot, category, answer, score)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [assessmentId, ans.questionId, qText, qCat, ans.answer, score]
      );
    }

    await db.query(
      `INSERT INTO predictions (assessment_id, student_id, stress_level, total_score, contributing_factors)
       VALUES ($1, $2, $3, $4, $5)`,
      [assessmentId, studentId, calcResult.stressLevel, calcResult.totalScore, JSON.stringify(calcResult.contributingFactors)]
    );

    for (const recId of calcResult.recommendationIds) {
      await db.query(
        `INSERT INTO student_recommendations (assessment_id, recommendation_id) VALUES ($1, $2)`,
        [assessmentId, recId]
      );
    }

    await db.exec('COMMIT');

    res.status(201).json({
      message: 'Assessment completed and persisted successfully',
      assessmentId,
      stressArea,
      totalScore: calcResult.totalScore,
      stressLevel: calcResult.stressLevel,
      optionDistribution: calcResult.optionDistribution,
      contributingFactors: calcResult.contributingFactors,
      recommendations: calcResult.recommendationSuggestions,
      completedAt
    });
  } catch (err: any) {
    try {
      await db.exec('ROLLBACK');
    } catch {}
    res.status(500).json({ error: 'Assessment submission failed: ' + err.message });
  }
});

router.get('/assessments/:assessmentId/result', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const assessmentId = Number(req.params.assessmentId);
  const user = req.user!;
  const db = await getDb();

  try {
    const aRes = await db.query(
      `SELECT a.*, s.name as student_name, s.user_id, s.course, s.academic_year, p.contributing_factors
       FROM assessments a
       JOIN students s ON s.id = a.student_id
       LEFT JOIN predictions p ON p.assessment_id = a.id
       WHERE a.id = $1`,
      [assessmentId]
    );

    if (aRes.rows.length === 0) {
      return res.status(404).json({ error: 'Assessment not found.' });
    }

    const assessment = aRes.rows[0] as any;

    if (user.role === 'student' && assessment.user_id !== user.userId) {
      return res.status(403).json({ error: 'Access denied. You cannot view assessments belonging to other students.' });
    }

    let factors: string[] = [];
    try {
      factors = assessment.contributing_factors ? JSON.parse(assessment.contributing_factors) : [];
    } catch {
      factors = assessment.contributing_factors ? assessment.contributing_factors.split(',') : [];
    }

    const recRes = await db.query(
      `SELECT r.id, r.category, r.suggestion, r.stress_level
       FROM recommendations r
       INNER JOIN student_recommendations sr ON sr.recommendation_id = r.id
       WHERE sr.assessment_id = $1`,
      [assessmentId]
    );

    const reqRes = await db.query(
      `SELECT id, status, summary, created_at FROM counselling_requests WHERE assessment_id = $1`,
      [assessmentId]
    );

    const respRes = await db.query(
      `SELECT answer, count(*) as count FROM responses WHERE assessment_id = $1 GROUP BY answer`,
      [assessmentId]
    );

    let yCount = 0;
    let sCount = 0;
    let nCount = 0;
    respRes.rows.forEach((r: any) => {
      if (r.answer === 'Yes') yCount = Number(r.count);
      if (r.answer === 'Sometimes') sCount = Number(r.count);
      if (r.answer === 'No') nCount = Number(r.count);
    });

    const optionDist = {
      yesCount: yCount,
      sometimesCount: sCount,
      noCount: nCount,
      yesPercentage: Math.round((yCount / 20) * 100),
      sometimesPercentage: Math.round((sCount / 20) * 100),
      noPercentage: Math.round((nCount / 20) * 100)
    };

    res.json({
      assessment: {
        id: assessment.id,
        studentId: assessment.student_id,
        studentName: assessment.student_name,
        course: assessment.course,
        academicYear: assessment.academic_year,
        stressArea: assessment.stress_area,
        totalScore: assessment.total_score,
        stressLevel: assessment.stress_level,
        optionDistribution: optionDist,
        completedAt: assessment.completed_at,
        contributingFactors: factors,
        recommendations: recRes.rows,
        counsellingRequest: reqRes.rows[0] || null
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve assessment results: ' + err.message });
  }
});

router.get('/student/assessments', authenticate, requireRole('student'), async (req: AuthenticatedRequest, res: Response) => {
  const db = await getDb();
  try {
    const sRes = await db.query(`SELECT id FROM students WHERE user_id = $1`, [req.user!.userId]);
    if (sRes.rows.length === 0) return res.status(404).json({ error: 'Student record not found.' });
    const studentId = (sRes.rows[0] as any).id;

    const list = await db.query(
      `SELECT a.id, a.stress_area, a.total_score, a.stress_level, a.completed_at, p.contributing_factors
       FROM assessments a
       LEFT JOIN predictions p ON p.assessment_id = a.id
       WHERE a.student_id = $1
       ORDER BY a.completed_at DESC`,
      [studentId]
    );

    res.json({
      assessments: list.rows.map((row: any) => ({
        id: row.id,
        stressArea: row.stress_area,
        totalScore: row.total_score,
        stressLevel: row.stress_level,
        completedAt: row.completed_at,
        contributingFactors: row.contributing_factors ? JSON.parse(row.contributing_factors) : []
      }))
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Counselling Support Module (Summarized Student Stress Report)
// ---------------------------------------------------------------------------
router.post('/counselling/requests', authenticate, requireRole('student'), async (req: AuthenticatedRequest, res: Response) => {
  const { assessmentId, note } = req.body;
  const user = req.user!;
  const db = await getDb();

  if (!assessmentId) {
    return res.status(400).json({ error: 'Assessment ID is required to generate counselling request.' });
  }

  try {
    const aRes = await db.query(
      `SELECT a.*, s.name as student_name, s.user_id, s.course, s.academic_year, p.contributing_factors
       FROM assessments a
       JOIN students s ON s.id = a.student_id
       LEFT JOIN predictions p ON p.assessment_id = a.id
       WHERE a.id = $1`,
      [assessmentId]
    );

    if (aRes.rows.length === 0) return res.status(404).json({ error: 'Assessment not found.' });
    const assessment = aRes.rows[0] as any;
    if (assessment.user_id !== user.userId) {
      return res.status(403).json({ error: 'Unauthorized to submit request for this assessment.' });
    }

    const dupCheck = await db.query(`SELECT id FROM counselling_requests WHERE assessment_id = $1`, [assessmentId]);
    if (dupCheck.rows.length > 0) {
      return res.status(400).json({ error: 'A counselling support request has already been filed for this assessment.' });
    }

    let factors = [];
    try {
      factors = assessment.contributing_factors ? JSON.parse(assessment.contributing_factors) : [];
    } catch {
      factors = [];
    }

    const summaryReport = JSON.stringify({
      reportTitle: 'Summarized Student Stress Report',
      studentIdentifier: `STD-${assessment.student_id.toString().padStart(4, '0')}`,
      assessmentIdentifier: `ASM-${assessment.id.toString().padStart(4, '0')}`,
      stressArea: assessment.stress_area,
      stressLevel: assessment.stress_level,
      totalScore: assessment.total_score,
      maxScore: 40,
      contributingFactors: factors,
      assessmentDate: assessment.completed_at,
      studentNote: note || 'Student requested support follow-up from campus counselling.',
      privacyNotice: 'Individual item responses are withheld in accordance with academic wellbeing privacy standards.'
    });

    const counsellorRes = await db.query(`SELECT id FROM counsellor_profiles WHERE is_available = TRUE LIMIT 1`);
    const counsellorId = (counsellorRes.rows[0] as any)?.id || null;

    const insRes = await db.query(
      `INSERT INTO counselling_requests (assessment_id, student_id, counsellor_id, summary, status, notes)
       VALUES ($1, $2, $3, $4, 'Pending', $5) RETURNING id, status, created_at`,
      [assessmentId, assessment.student_id, counsellorId, summaryReport, note || '']
    );

    res.status(201).json({
      message: 'Counselling support request created successfully. A campus counsellor will review your summarized report.',
      requestId: (insRes.rows[0] as any).id,
      status: (insRes.rows[0] as any).status,
      createdAt: (insRes.rows[0] as any).created_at
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create counselling request: ' + err.message });
  }
});

router.get('/counselling/my-requests', authenticate, requireRole('student'), async (req: AuthenticatedRequest, res: Response) => {
  const db = await getDb();
  try {
    const sRes = await db.query(`SELECT id FROM students WHERE user_id = $1`, [req.user!.userId]);
    if (sRes.rows.length === 0) return res.status(404).json({ error: 'Student record not found.' });

    const requests = await db.query(
      `SELECT cr.id, cr.assessment_id, cr.status, cr.summary, cr.notes, cr.created_at, cr.updated_at,
              cp.display_name as counsellor_name
       FROM counselling_requests cr
       LEFT JOIN counsellor_profiles cp ON cp.id = cr.counsellor_id
       WHERE cr.student_id = $1
       ORDER BY cr.created_at DESC`,
      [(sRes.rows[0] as any).id]
    );

    res.json({ requests: requests.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Anonymous WebRTC Counselling Room Endpoints
// ---------------------------------------------------------------------------
router.post('/anonymous-counselling/session', async (req: Request, res: Response) => {
  const { sessionType } = req.body;
  const validTypes = ['audio', 'video', 'chat'];
  const type = validTypes.includes(sessionType) ? sessionType : 'video';

  const db = await getDb();

  try {
    const guestId = 'guest_' + crypto.randomBytes(8).toString('hex');
    const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase().slice(0, 3);
    const guestAlias = `Guest-${randomSuffix}`;
    const sessionId = 'room_' + crypto.randomBytes(10).toString('hex');

    const guestToken = jwt.sign(
      { guestId, guestAlias, sessionId, isAnonymous: true },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    const cRes = await db.query(`SELECT id, display_name FROM counsellor_profiles WHERE is_available = TRUE LIMIT 1`);
    const counsellor = (cRes.rows[0] as any) || null;

    await db.query(
      `INSERT INTO counselling_sessions (id, guest_id, guest_alias, counsellor_id, session_type, status, expires_at)
       VALUES ($1, $2, $3, $4, $5, 'waiting', CURRENT_TIMESTAMP + INTERVAL '2 hours')`,
      [sessionId, guestId, guestAlias, counsellor?.id || null, type]
    );

    await db.query(
      `INSERT INTO counselling_session_events (session_id, event_type) VALUES ($1, 'guest_joined')`,
      [sessionId]
    );

    res.status(201).json({
      sessionId,
      guestId,
      guestAlias,
      guestToken,
      sessionType: type,
      status: 'waiting',
      counsellorOnline: counsellor !== null,
      counsellorName: counsellor?.display_name || 'Dr. Evelyn Reed (On Call)'
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to initialize anonymous counselling session: ' + err.message });
  }
});

router.get('/anonymous-counselling/session/:sessionId', async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const db = await getDb();

  try {
    const sRes = await db.query(
      `SELECT cs.*, cp.display_name as counsellor_name 
       FROM counselling_sessions cs
       LEFT JOIN counsellor_profiles cp ON cp.id = cs.counsellor_id
       WHERE cs.id = $1`,
      [sessionId]
    );

    if (sRes.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found or expired.' });
    }

    const s = sRes.rows[0] as any;
    res.json({
      sessionId: s.id,
      guestAlias: s.guest_alias,
      sessionType: s.session_type,
      status: s.status,
      counsellorName: s.counsellor_name || 'Dr. Evelyn Reed',
      createdAt: s.created_at,
      startedAt: s.started_at,
      endedAt: s.ended_at
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/anonymous-counselling/session/:sessionId/leave', async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const db = await getDb();
  try {
    await db.query(
      `UPDATE counselling_sessions SET status = 'ended', ended_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [sessionId]
    );
    await db.query(
      `INSERT INTO counselling_session_events (session_id, event_type) VALUES ($1, 'call_ended')`,
      [sessionId]
    );
    res.json({ message: 'Session terminated safely.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Counsellor Console Endpoints
// ---------------------------------------------------------------------------
router.get('/counsellor/profile', authenticate, requireRole('counsellor', 'admin'), async (req: AuthenticatedRequest, res: Response) => {
  const db = await getDb();
  try {
    const cRes = await db.query(
      `SELECT cp.*, u.email FROM counsellor_profiles cp JOIN users u ON u.id = cp.user_id WHERE cp.user_id = $1`,
      [req.user!.userId]
    );
    if (cRes.rows.length === 0) {
      return res.status(404).json({ error: 'Counsellor profile not found.' });
    }
    res.json({ profile: cRes.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/counsellor/availability', authenticate, requireRole('counsellor', 'admin'), async (req: AuthenticatedRequest, res: Response) => {
  const { isAvailable } = req.body;
  const db = await getDb();
  try {
    await db.query(
      `UPDATE counsellor_profiles SET is_available = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2`,
      [Boolean(isAvailable), req.user!.userId]
    );
    res.json({ message: 'Availability status updated', isAvailable: Boolean(isAvailable) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/counsellor/waiting-sessions', authenticate, requireRole('counsellor', 'admin'), async (req: AuthenticatedRequest, res: Response) => {
  const db = await getDb();
  try {
    const sessions = await db.query(
      `SELECT id, guest_alias, session_type, status, created_at, started_at
       FROM counselling_sessions 
       WHERE status IN ('waiting', 'active')
       ORDER BY created_at DESC LIMIT 20`
    );
    res.json({ sessions: sessions.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/counsellor/session/:sessionId/accept', authenticate, requireRole('counsellor', 'admin'), async (req: AuthenticatedRequest, res: Response) => {
  const { sessionId } = req.params;
  const db = await getDb();
  try {
    const cRes = await db.query(`SELECT id FROM counsellor_profiles WHERE user_id = $1`, [req.user!.userId]);
    const counsellorId = (cRes.rows[0] as any)?.id || null;

    await db.query(
      `UPDATE counselling_sessions 
       SET status = 'active', started_at = CURRENT_TIMESTAMP, counsellor_id = COALESCE($1, counsellor_id)
       WHERE id = $2`,
      [counsellorId, sessionId]
    );

    await db.query(
      `INSERT INTO counselling_session_events (session_id, event_type) VALUES ($1, 'counsellor_joined')`,
      [sessionId]
    );

    res.json({ message: 'Session accepted. Connected to anonymous student.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/counsellor/session/:sessionId/end', authenticate, requireRole('counsellor', 'admin'), async (req: AuthenticatedRequest, res: Response) => {
  const { sessionId } = req.params;
  const db = await getDb();
  try {
    await db.query(
      `UPDATE counselling_sessions SET status = 'ended', ended_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [sessionId]
    );
    await db.query(
      `INSERT INTO counselling_session_events (session_id, event_type) VALUES ($1, 'call_ended')`,
      [sessionId]
    );
    res.json({ message: 'Session ended.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/counsellor/counselling-requests', authenticate, requireRole('counsellor', 'admin'), async (req: AuthenticatedRequest, res: Response) => {
  const db = await getDb();
  try {
    const reqs = await db.query(
      `SELECT cr.*, s.name as student_name, s.course, s.academic_year, a.stress_level, a.total_score, a.stress_area
       FROM counselling_requests cr
       JOIN students s ON s.id = cr.student_id
       JOIN assessments a ON a.id = cr.assessment_id
       ORDER BY cr.created_at DESC`
    );
    res.json({ requests: reqs.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/counsellor/counselling-requests/:requestId', authenticate, requireRole('counsellor', 'admin'), async (req: AuthenticatedRequest, res: Response) => {
  const { requestId } = req.params;
  const { status, notes } = req.body;
  const db = await getDb();

  try {
    const updated = await db.query(
      `UPDATE counselling_requests 
       SET status = COALESCE($1, status),
           notes = COALESCE($2, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 RETURNING *`,
      [status, notes, requestId]
    );
    res.json({ message: 'Request status updated', request: updated.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Administrator Endpoints
// ---------------------------------------------------------------------------
router.get('/admin/dashboard', authenticate, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const db = await getDb();

  try {
    const studentCount = await db.query(`SELECT COUNT(*) as count FROM students`);
    const assessmentCount = await db.query(`SELECT COUNT(*) as count FROM assessments`);

    const levelCounts = await db.query(
      `SELECT stress_level, COUNT(*) as count FROM assessments GROUP BY stress_level`
    );
    const levelsMap = { Low: 0, Moderate: 0, High: 0 };
    levelCounts.rows.forEach((r: any) => {
      if (r.stress_level in levelsMap) {
        (levelsMap as any)[r.stress_level] = Number(r.count);
      }
    });

    const areaCounts = await db.query(
      `SELECT stress_area, COUNT(*) as count FROM assessments GROUP BY stress_area`
    );

    const pendingReqs = await db.query(
      `SELECT COUNT(*) as count FROM counselling_requests WHERE status = 'Pending'`
    );

    const recentAssessments = await db.query(
      `SELECT a.id, a.total_score, a.stress_level, a.stress_area, a.completed_at, s.name as student_name, s.course
       FROM assessments a
       JOIN students s ON s.id = a.student_id
       ORDER BY a.completed_at DESC LIMIT 6`
    );

    const recentPredictions = await db.query(
      `SELECT p.id, p.stress_level, p.total_score, p.contributing_factors, p.prediction_date, s.name as student_name
       FROM predictions p
       JOIN students s ON s.id = p.student_id
       ORDER BY p.prediction_date DESC LIMIT 6`
    );

    res.json({
      metrics: {
        totalStudents: Number((studentCount.rows[0] as any)?.count || 0),
        totalAssessments: Number((assessmentCount.rows[0] as any)?.count || 0),
        pendingCounsellingRequests: Number((pendingReqs.rows[0] as any)?.count || 0),
        stressLevels: levelsMap
      },
      stressAreas: areaCounts.rows,
      recentAssessments: recentAssessments.rows,
      recentPredictions: recentPredictions.rows.map((p: any) => ({
        ...p,
        contributingFactors: p.contributing_factors ? JSON.parse(p.contributing_factors) : []
      }))
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to compile admin metrics: ' + err.message });
  }
});

router.get('/admin/students', authenticate, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const search = (req.query.search as string) || '';
  const db = await getDb();

  try {
    let query = `
      SELECT s.id, s.name, s.email, s.course, s.academic_year, s.created_at,
             COUNT(a.id) as assessment_count,
             MAX(a.completed_at) as last_assessment_date
      FROM students s
      LEFT JOIN assessments a ON a.student_id = s.id
    `;
    const params: any[] = [];

    if (search.trim()) {
      query += ` WHERE LOWER(s.name) LIKE $1 OR LOWER(s.email) LIKE $1 `;
      params.push(`%${search.trim().toLowerCase()}%`);
    }

    query += ` GROUP BY s.id, s.name, s.email, s.course, s.academic_year, s.created_at ORDER BY s.id DESC LIMIT 50`;

    const result = await db.query(query, params);
    res.json({ students: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/questions', authenticate, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const db = await getDb();
  try {
    const qList = await db.query(`SELECT * FROM questionnaires ORDER BY id ASC`);
    res.json({ questions: qList.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/questions', authenticate, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const { questionText, category, stressArea, weight } = req.body;
  if (!questionText || !category || !stressArea) {
    return res.status(400).json({ error: 'questionText, category, and stressArea are required.' });
  }

  const db = await getDb();
  try {
    const ins = await db.query(
      `INSERT INTO questionnaires (question_text, category, stress_area, weight, is_active)
       VALUES ($1, $2, $3, $4, TRUE) RETURNING *`,
      [questionText, category, stressArea, Number(weight) || 1]
    );
    res.status(201).json({ message: 'Question added successfully', question: ins.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/admin/questions/:questionId', authenticate, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const { questionId } = req.params;
  const { questionText, category, stressArea, weight, isActive } = req.body;
  const db = await getDb();

  try {
    const updated = await db.query(
      `UPDATE questionnaires
       SET question_text = COALESCE($1, question_text),
           category = COALESCE($2, category),
           stress_area = COALESCE($3, stress_area),
           weight = COALESCE($4, weight),
           is_active = COALESCE($5, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING *`,
      [questionText, category, stressArea, weight !== undefined ? Number(weight) : null, isActive, questionId]
    );
    res.json({ message: 'Question updated successfully', question: updated.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/admin/questions/:questionId', authenticate, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const { questionId } = req.params;
  const db = await getDb();
  try {
    await db.query(`UPDATE questionnaires SET is_active = FALSE WHERE id = $1`, [questionId]);
    res.json({ message: 'Question marked as inactive.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/counselling/requests', authenticate, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const db = await getDb();
  try {
    const list = await db.query(
      `SELECT cr.*, s.name as student_name, s.course, a.stress_level, a.total_score, a.stress_area, cp.display_name as counsellor_name
       FROM counselling_requests cr
       JOIN students s ON s.id = cr.student_id
       JOIN assessments a ON a.id = cr.assessment_id
       LEFT JOIN counsellor_profiles cp ON cp.id = cr.counsellor_id
       ORDER BY cr.created_at DESC`
    );
    res.json({ requests: list.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/admin/counselling/requests/:requestId', authenticate, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const { requestId } = req.params;
  const { status, notes } = req.body;
  const db = await getDb();
  try {
    const updated = await db.query(
      `UPDATE counselling_requests SET status = COALESCE($1, status), notes = COALESCE($2, notes), updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
      [status, notes, requestId]
    );
    res.json({ message: 'Request status updated', request: updated.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/reports', authenticate, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const db = await getDb();
  try {
    const reports = await db.query(
      `SELECT r.*, u.full_name as generated_by FROM reports r LEFT JOIN users u ON u.id = r.admin_id ORDER BY r.generated_at DESC LIMIT 20`
    );
    res.json({ reports: reports.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/reports/generate', authenticate, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const { reportType } = req.body;
  const user = req.user!;
  const db = await getDb();

  try {
    const type = reportType || 'stress_level_distribution_summary';
    const studentsCount = await db.query(`SELECT COUNT(*) as c FROM students`);
    const assessCount = await db.query(`SELECT COUNT(*) as c FROM assessments`);
    const levels = await db.query(`SELECT stress_level, COUNT(*) as c, ROUND(AVG(total_score), 1) as avg_score FROM assessments GROUP BY stress_level`);
    const areas = await db.query(`SELECT stress_area, COUNT(*) as c FROM assessments GROUP BY stress_area`);

    const reportContent = {
      title: 'Institutional Student Stress Screening & Assessment Report',
      generatedDate: new Date().toISOString(),
      authorizedAdmin: user.fullName,
      totalRegisteredStudents: Number((studentsCount.rows[0] as any)?.c || 0),
      totalCompletedAssessments: Number((assessCount.rows[0] as any)?.c || 0),
      stressLevelDistribution: levels.rows,
      stressAreaDistribution: areas.rows,
      clinicalNotice: 'This report compiles structured early-screening scores from student self-assessments.'
    };

    const ins = await db.query(
      `INSERT INTO reports (admin_id, report_type, report_data) VALUES ($1, $2, $3) RETURNING *`,
      [user.userId, type, JSON.stringify(reportContent)]
    );

    res.status(201).json({ message: 'Report generated successfully', report: ins.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/export/csv', authenticate, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const db = await getDb();
  try {
    const rows = await db.query(
      `SELECT a.id as assessment_id, s.name as student_name, s.course, s.academic_year,
              a.stress_area, a.total_score, a.stress_level, a.completed_at
       FROM assessments a
       JOIN students s ON s.id = a.student_id
       ORDER BY a.completed_at DESC`
    );

    let csv = 'Assessment ID,Student Name,Course,Academic Year,Stress Area,Total Score (out of 40),Stress Level,Completion Date\n';
    rows.rows.forEach((r: any) => {
      csv += `"${r.assessment_id}","${r.student_name}","${r.course}","${r.academic_year}","${r.stress_area}",${r.total_score},"${r.stress_level}","${r.completed_at}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="student_stress_assessments.csv"');
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
