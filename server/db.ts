import { PGlite } from '@electric-sql/pglite';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

let pgliteInstance: PGlite | null = null;

export async function getDb(): Promise<PGlite> {
  if (pgliteInstance) {
    return pgliteInstance;
  }

  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_REGION);
  const dataDir = isServerless ? '/tmp/.pgdata' : path.resolve(process.cwd(), '.pgdata');
  
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    pgliteInstance = new PGlite(dataDir);
  } catch (err) {
    console.warn('Persistent PGlite storage failed, activating in-memory instance:', err);
    try {
      pgliteInstance = new PGlite();
    } catch (e2) {
      console.error('Fatal: Failed to start in-memory PGlite:', e2);
      throw e2;
    }
  }

  await initSchema(pgliteInstance);
  return pgliteInstance;
}

export async function initSchema(db: PGlite) {
  // Create tables according to MCA specification & PDF relational schema
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'student',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL,
      age INT,
      course VARCHAR(100),
      academic_year VARCHAR(50),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS questionnaires (
      id SERIAL PRIMARY KEY,
      question_text TEXT NOT NULL,
      category VARCHAR(50) NOT NULL,
      stress_area VARCHAR(50) NOT NULL,
      weight INT NOT NULL DEFAULT 1,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assessments (
      id SERIAL PRIMARY KEY,
      student_id INT REFERENCES students(id) ON DELETE CASCADE,
      stress_area VARCHAR(50) NOT NULL,
      total_score INT NOT NULL,
      stress_level VARCHAR(20) NOT NULL,
      status VARCHAR(20) DEFAULT 'completed',
      completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      assessment_id INT REFERENCES assessments(id) ON DELETE CASCADE,
      question_id INT REFERENCES questionnaires(id) ON DELETE SET NULL,
      question_text_snapshot TEXT NOT NULL,
      category VARCHAR(50),
      answer VARCHAR(50) NOT NULL,
      score INT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS predictions (
      id SERIAL PRIMARY KEY,
      assessment_id INT REFERENCES assessments(id) ON DELETE CASCADE,
      student_id INT REFERENCES students(id) ON DELETE CASCADE,
      stress_level VARCHAR(20) NOT NULL,
      total_score INT NOT NULL,
      contributing_factors TEXT NOT NULL,
      prediction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS recommendations (
      id SERIAL PRIMARY KEY,
      stress_level VARCHAR(20) NOT NULL,
      category VARCHAR(50) NOT NULL,
      suggestion TEXT NOT NULL,
      is_active BOOLEAN DEFAULT TRUE
    );

    CREATE TABLE IF NOT EXISTS student_recommendations (
      id SERIAL PRIMARY KEY,
      assessment_id INT REFERENCES assessments(id) ON DELETE CASCADE,
      recommendation_id INT REFERENCES recommendations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS counsellor_profiles (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      display_name VARCHAR(100) NOT NULL,
      contact_information VARCHAR(255),
      is_available BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS counselling_requests (
      id SERIAL PRIMARY KEY,
      assessment_id INT REFERENCES assessments(id) ON DELETE CASCADE,
      student_id INT REFERENCES students(id) ON DELETE CASCADE,
      counsellor_id INT REFERENCES counsellor_profiles(id) ON DELETE SET NULL,
      summary TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'Pending',
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS counselling_sessions (
      id VARCHAR(64) PRIMARY KEY,
      guest_id VARCHAR(64) NOT NULL,
      guest_alias VARCHAR(32) NOT NULL,
      counsellor_id INT REFERENCES counsellor_profiles(id) ON DELETE SET NULL,
      session_type VARCHAR(20) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'waiting',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      started_at TIMESTAMP WITH TIME ZONE,
      ended_at TIMESTAMP WITH TIME ZONE,
      expires_at TIMESTAMP WITH TIME ZONE
    );

    CREATE TABLE IF NOT EXISTS counselling_session_events (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(64) REFERENCES counselling_sessions(id) ON DELETE CASCADE,
      event_type VARCHAR(50) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reports (
      id SERIAL PRIMARY KEY,
      admin_id INT REFERENCES users(id) ON DELETE SET NULL,
      report_type VARCHAR(50) NOT NULL,
      report_data TEXT NOT NULL,
      generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default admin and counsellor users if not present
  const adminCheck = await db.query(`SELECT id FROM users WHERE email = 'admin@stresspredict.edu'`);
  if (adminCheck.rows.length === 0) {
    const adminPassHash = await bcrypt.hash('Admin@12345', 10);
    const adminRes = await db.query(
      `INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Academic Administrator', 'admin@stresspredict.edu', adminPassHash, 'admin']
    );
  }

  const counsellorCheck = await db.query(`SELECT id FROM users WHERE email = 'counsellor@stresspredict.edu'`);
  if (counsellorCheck.rows.length === 0) {
    const counsellorPassHash = await bcrypt.hash('Counsellor@12345', 10);
    const cRes = await db.query(
      `INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Dr. Evelyn Reed', 'counsellor@stresspredict.edu', counsellorPassHash, 'counsellor']
    );
    const cUserId = (cRes.rows[0] as any).id;
    await db.query(
      `INSERT INTO counsellor_profiles (user_id, display_name, contact_information, is_available) VALUES ($1, $2, $3, $4)`,
      [cUserId, 'Dr. Evelyn Reed, Ph.D.', 'Wellness Centre, Room 204 | evelyn.reed@campus.edu', true]
    );
  }

  const studentCheck = await db.query(`SELECT id FROM users WHERE email = 'alex.student@stresspredict.edu'`);
  if (studentCheck.rows.length === 0) {
    const studentPassHash = await bcrypt.hash('Student@12345', 10);
    const sRes = await db.query(
      `INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Alex Morgan', 'alex.student@stresspredict.edu', studentPassHash, 'student']
    );
    const sUserId = (sRes.rows[0] as any).id;
    await db.query(
      `INSERT INTO students (user_id, course, academic_year, age) VALUES ($1, $2, $3, $4)`,
      [sUserId, 'MCA Computer Applications', 'Year 2', 22]
    );
  }

  // Seed questionnaires (exact 20 questions categorized into Home, College/School, and Both)
  const qCount = await db.query(`SELECT COUNT(*) as count FROM questionnaires`);
  if (Number((qCount.rows[0] as any).count) === 0) {
    const defaultQuestions = [
      { text: "Do you feel overwhelmed by your academic deadlines, assignments, or continuous evaluation tests?", cat: "Academic Workload", area: "College/School" },
      { text: "Do you experience persistent anxiety or difficulty concentrating before or during examinations?", cat: "Examination Anxiety", area: "College/School" },
      { text: "Do you struggle to balance dedicated study hours with essential leisure and personal commitments?", cat: "Time Management", area: "College/School" },
      { text: "Do you experience competitive academic pressure from peer comparisons or grade expectations?", cat: "Peer & Academic Pressure", area: "College/School" },
      { text: "Do you hesitate to ask instructors for clarification when coursework concepts become difficult?", cat: "Classroom Engagement", area: "College/School" },
      { text: "Do you regularly sleep fewer than 6 hours per night or wake up feeling tired and unrefreshed?", cat: "Sleep & Routine", area: "Both" },
      { text: "Do you spend more than 6 continuous hours on digital screens each day for studying and social scrolling?", cat: "Digital Screen Fatigue", area: "Both" },
      { text: "Do you experience physical tension, recurring headaches, or muscle stiffness during long study sessions?", cat: "Physical Symptoms", area: "Both" },
      { text: "Do you skip regular meals or rely on unhealthy snacking because of academic or personal rush?", cat: "Nutrition & Physical Wellbeing", area: "Both" },
      { text: "Do you find yourself procrastinating on crucial academic tasks while worrying about upcoming deadlines?", cat: "Procrastination & Focus", area: "Both" },
      { text: "Do you experience sudden mood shifts, irritability, or low patience during daily activities?", cat: "Emotional Regulation", area: "Both" },
      { text: "Do you feel socially withdrawn or reluctant to share your emotional worries with peers or family?", cat: "Social Connectedness", area: "Both" },
      { text: "Do you find it difficult to take guilt-free mental breaks without feeling anxious about unread notes?", cat: "Rest & Recovery", area: "Both" },
      { text: "Do you experience recurring anxiety or self-doubt concerning campus placements or future career paths?", cat: "Career Anxiety", area: "College/School" },
      { text: "Do you experience high expectations or domestic tension from family members regarding your academic results?", cat: "Family Expectations", area: "Home" },
      { text: "Do you lack a quiet, dedicated, and undisturbed study space at home for focused revision?", cat: "Home Study Space", area: "Home" },
      { text: "Do domestic chores or household responsibilities frequently clash with your study schedule?", cat: "Domestic Responsibilities", area: "Home" },
      { text: "Does a long or exhausting daily commute between home and college drain your study energy?", cat: "Commute Strain", area: "Both" },
      { text: "Do campus noise levels, crowded lab sessions, or noisy study halls increase your exhaustion?", cat: "Campus Environment", area: "College/School" },
      { text: "Do educational expenses, book fees, or living costs cause you ongoing worry?", cat: "Financial Stress", area: "Both" }
    ];

    for (const q of defaultQuestions) {
      await db.query(
        `INSERT INTO questionnaires (question_text, category, stress_area, weight, is_active) VALUES ($1, $2, $3, 1, TRUE)`,
        [q.text, q.cat, q.area]
      );
    }
  }

  // Seed recommendations bank
  const recCount = await db.query(`SELECT COUNT(*) as count FROM recommendations`);
  if (Number((recCount.rows[0] as any).count) === 0) {
    const defaultRecs = [
      // Low stress
      { level: 'Low', cat: 'Daily Routine', text: 'Maintain a consistent sleep-wake schedule to protect your current high cognitive reserves.' },
      { level: 'Low', cat: 'Study Habits', text: 'Use 45-minute focused study blocks followed by 10-minute active stretch breaks.' },
      { level: 'Low', cat: 'Screen Time', text: 'Keep screens off at least 30 minutes before bedtime to ensure restorative deep sleep.' },
      { level: 'Low', cat: 'Physical Wellbeing', text: 'Engage in 20-30 minutes of light aerobic exercise or brisk walking 4 times weekly.' },
      // Moderate stress
      { level: 'Moderate', cat: 'Time Management', text: 'Adopt priority matrix planning: categorise assignments by urgency and deadline to reduce cognitive overload.' },
      { level: 'Moderate', cat: 'Study Planning', text: 'Break extensive syllabus units into manageable daily checklists rather than cramming before exams.' },
      { level: 'Moderate', cat: 'Relaxation', text: 'Practice 5-minute diaphragmatic breathing or progressive muscle relaxation during mid-day study fatigue.' },
      { level: 'Moderate', cat: 'Social Support', text: 'Study in collaborative groups with classmates to share notes and alleviate solitary pressure.' },
      { level: 'Moderate', cat: 'Home/Study Boundaries', text: 'Establish an agreed quiet boundary with family members during prime study hours.' },
      // High stress
      { level: 'High', cat: 'Supportive Guidance', text: 'Acknowledge that high pressure is a temporary situation that can be structured and reduced with step-by-step guidance.' },
      { level: 'High', cat: 'Counselling Referral', text: 'Connect with a campus student counsellor or academic advisor to structure a realistic workload mitigation plan.' },
      { level: 'High', cat: 'Immediate Workload Relief', text: 'Speak to course mentors or faculty advisors regarding realistic deadline restructuring for pressing submissions.' },
      { level: 'High', cat: 'Restorative Sleep', text: 'Prioritize a non-negotiable 7-hour sleep block tonight; sleep deprivation amplifies stress perception by over 40%.' },
      { level: 'High', cat: 'Confidential Session', text: 'Use the Anonymous Counselling Room or submit a confidential support request to talk with Dr. Evelyn Reed without academic penalty.' }
    ];

    for (const r of defaultRecs) {
      await db.query(
        `INSERT INTO recommendations (stress_level, category, suggestion, is_active) VALUES ($1, $2, $3, TRUE)`,
        [r.level, r.cat, r.text]
      );
    }
  }
}
