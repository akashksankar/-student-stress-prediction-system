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

  // Seed questionnaires (full 60 questions: exactly 20 for Home, 20 for College/School, and 20 for Both)
  const qCount = await db.query(`SELECT COUNT(*) as count FROM questionnaires`);
  if (Number((qCount.rows[0] as any).count) < 60) {
    await db.query(`DELETE FROM questionnaires`);

    const defaultQuestions = [
      // 20 College/School Environment Items
      { text: "Do you feel overwhelmed by the volume of continuous internal assessments, projects, and assignment deadlines?", cat: "Academic Workload", area: "College/School" },
      { text: "Do you experience persistent nervousness, mental blankness, or rapid heartbeat before or during written tests?", cat: "Examination Anxiety", area: "College/School" },
      { text: "Do you struggle to keep pace with rapid syllabus coverage or difficult algorithmic and conceptual coursework?", cat: "Coursework Difficulty", area: "College/School" },
      { text: "Do you worry constantly about CGPA requirements, semester arrears, or exam performance benchmarks?", cat: "Performance Pressure", area: "College/School" },
      { text: "Do campus placement drives, technical interviews, and uncertainty about your post-college career path cause severe anxiety?", cat: "Career Uncertainty", area: "College/School" },
      { text: "Do you hesitate to ask professors or course instructors for help when coursework concepts become difficult?", cat: "Faculty Communication", area: "College/School" },
      { text: "Do practical programming labs, code execution errors, or viva-voce examinations trigger intense stress?", cat: "Practical & Lab Strain", area: "College/School" },
      { text: "Do you feel inferior or stressed when comparing your academic performance or projects to high-achieving classmates?", cat: "Peer Competition", area: "College/School" },
      { text: "Do unbalanced team contributions, missed group deadlines, or conflicts in capstone projects cause frustration?", cat: "Teamwork Friction", area: "College/School" },
      { text: "Does the pressure to maintain mandatory minimum campus attendance requirements cause you ongoing stress?", cat: "Attendance Strain", area: "College/School" },
      { text: "Do classroom presentations, seminar talks, or answering questions in front of peers induce dread?", cat: "Presentation Dread", area: "College/School" },
      { text: "Do you find it difficult to maintain focus and stay awake through consecutive multi-hour lecture blocks?", cat: "Lecture Fatigue", area: "College/School" },
      { text: "Do multiple simultaneous test dates across different subjects give you inadequate time to prepare thoroughly?", cat: "Exam Scheduling", area: "College/School" },
      { text: "Do noisy study halls, crowded campus spaces, or packed computer laboratories add to your mental exhaustion?", cat: "Campus Environment", area: "College/School" },
      { text: "Does uncertainty about grading criteria or subjective faculty assessment create frustration and worry?", cat: "Grading Ambiguity", area: "College/School" },
      { text: "Do you struggle to retain vast quantities of lecture notes and technical concepts before semester exams?", cat: "Cognitive Overload", area: "College/School" },
      { text: "Do you frequently worry that you are not academically competent enough for your degree program?", cat: "Academic Imposter Syndrome", area: "College/School" },
      { text: "Do you struggle to obtain required textbooks, library reference materials, or licensed laboratory software?", cat: "Resource Constraints", area: "College/School" },
      { text: "Do complex institutional paperwork, approval procedures, or administrative hurdles cause unnecessary stress?", cat: "Institutional Bureaucracy", area: "College/School" },
      { text: "Does the academic rigor and pace of your current semester feel unsustainable without additional support?", cat: "Semester Exhaustion", area: "College/School" },

      // 20 Home Environment Items
      { text: "Do family members place intense pressure or high grade expectations on your academic results?", cat: "Family Expectations", area: "Home" },
      { text: "Do frequent household noises, television, or conversations disrupt your concentration while studying at home?", cat: "Household Distractions", area: "Home" },
      { text: "Do you lack a private, quiet, and dedicated study desk or room at home for focused revision?", cat: "Study Environment", area: "Home" },
      { text: "Do household chores, grocery errands, or domestic duties frequently cut into your planned study schedule?", cat: "Domestic Obligations", area: "Home" },
      { text: "Do siblings or relatives constantly interrupt your deep work study blocks or online coursework?", cat: "Family Interruptions", area: "Home" },
      { text: "Do parents or relatives compare your academic achievements unfavorably with cousins or peers?", cat: "Parental Comparisons", area: "Home" },
      { text: "Do your late-night study hours or early morning schedules lead to misunderstandings or complaints from family?", cat: "Routine Friction", area: "Home" },
      { text: "Do family discussions about educational fees, book expenses, or household budgets cause you ongoing worry?", cat: "Financial Stress", area: "Home" },
      { text: "Do you feel hesitant to talk openly with your parents or guardians about personal stress or academic burnout?", cat: "Emotional Distance", area: "Home" },
      { text: "Do you feel guilty or judged by family members when you take casual rest breaks or engage in leisure at home?", cat: "Rest Guilt", area: "Home" },
      { text: "Do ongoing domestic arguments or household conflicts noticeably drain your emotional energy for studying?", cat: "Domestic Conflict", area: "Home" },
      { text: "Do unstable internet connectivity, power fluctuations, or hardware issues at home disrupt your study sessions?", cat: "Home Infrastructure", area: "Home" },
      { text: "Do family members' health concerns or caregiving duties add extra mental burden to your daily routine?", cat: "Caregiving Burdens", area: "Home" },
      { text: "Do irregular domestic meal timings or rushed home schedules affect your physical energy during study hours?", cat: "Mealtime Disruptions", area: "Home" },
      { text: "Do family members fail to realize how demanding and time-intensive your modern college curriculum actually is?", cat: "Coursework Misunderstanding", area: "Home" },
      { text: "Do you feel a lack of personal privacy or boundaries when trying to focus on assignments at home?", cat: "Boundary Invasions", area: "Home" },
      { text: "Does returning home to a stressful or demanding atmosphere drain the energy you need for homework revision?", cat: "Domestic Atmosphere", area: "Home" },
      { text: "Do you feel that your hard work and study efforts go unacknowledged or unappreciated at home?", cat: "Lack of Affirmation", area: "Home" },
      { text: "Do family members reprimand or question you whenever you must work on your laptop or phone for coursework?", cat: "Screen Time Scrutiny", area: "Home" },
      { text: "Does your home environment currently feel more stressful or demanding than a restorative sanctuary?", cat: "Home Sanctuary Absence", area: "Home" },

      // 20 Both / Multidimensional Lifestyle Items
      { text: "Do you regularly get fewer than 6 hours of sleep per night due to combined academic deadlines and late routines?", cat: "Sleep Deprivation", area: "Both" },
      { text: "Do you experience physical tension, recurring headaches, eye strain, or neck tightness during long study days?", cat: "Physical Somatization", area: "Both" },
      { text: "Do you spend excessive hours scrolling social media or screens to avoid facing looming coursework or responsibilities?", cat: "Digital Avoidance", area: "Both" },
      { text: "Do you skip regular meals, binge on junk snacks, or heavily rely on caffeine to sustain your daily energy?", cat: "Nutritional Disruption", area: "Both" },
      { text: "Do you chronically delay essential academic tasks while feeling intense guilt and panic about the delay?", cat: "Procrastination Strain", area: "Both" },
      { text: "Do you experience sudden mood shifts, irritability, or short temper with peers and family during high-pressure weeks?", cat: "Emotional Dysregulation", area: "Both" },
      { text: "Do you find it difficult to mentally switch off and relax without persistent anxious thoughts about pending obligations?", cat: "Inability to Relax", area: "Both" },
      { text: "Do you isolate yourself socially and avoid conversations with friends or family because of overwhelming workload?", cat: "Social Isolation", area: "Both" },
      { text: "Does daily travelling or public transit between home and campus leave you mentally and physically drained?", cat: "Commute Exhaustion", area: "Both" },
      { text: "Do personal living expenses, educational materials, or transportation costs cause you persistent personal stress?", cat: "Personal Finances", area: "Both" },
      { text: "Do you feel pulled in conflicting directions between academic performance, family expectations, and personal wellness?", cat: "Multitasking Strain", area: "Both" },
      { text: "Do you wake up feeling consistently unrefreshed, lethargic, or dreading the upcoming day's demands?", cat: "Morning Lethargy", area: "Both" },
      { text: "Do you experience frequent mental fatigue, brain fog, or difficulty maintaining attention during study tasks?", cat: "Cognitive Fatigue", area: "Both" },
      { text: "Do you feel overwhelmed by the thought of what will happen over the next semester or after graduation?", cat: "Future Dread", area: "Both" },
      { text: "Have you completely abandoned hobbies, exercise, or creative activities that previously helped you recharge?", cat: "Leisure Abandonment", area: "Both" },
      { text: "Does a small academic setback or domestic remark upset you far more than it normally would?", cat: "Low Emotional Reserves", area: "Both" },
      { text: "Do you feel that neither home nor campus provides a calm space where you can genuinely recuperate?", cat: "Environmental Exhaustion", area: "Both" },
      { text: "Do you feel overwhelmed when prioritizing multiple conflicting assignments and personal chores?", cat: "Decision Paralysis", area: "Both" },
      { text: "Do you keep your stress bottled up inside because you fear being perceived as weak or incapable?", cat: "Concealed Distress", area: "Both" },
      { text: "Does the combined weight of your college and home life currently feel close to your breaking point?", cat: "Comprehensive Burnout", area: "Both" }
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
