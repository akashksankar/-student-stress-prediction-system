# Student Stress Prediction System
**MCA Academic Project — Production-Quality Localhost Application**  
*Full-Stack Architecture | PostgreSQL | JWT Role Authorization | WebRTC Anonymous Counselling*

---

## 1. Project Overview

The **Student Stress Prediction System** is a full-stack academic web platform designed to identify, assess, and categorize student stress levels at an early stage.

Students evaluate potential stressors across three primary focal areas:
- **Home Environment** (family expectations, household dynamics, study space)
- **College & Academic Environment** (assignments, exams, faculty expectations, career anxiety)
- **Both** (comprehensive lifestyle stressors: sleep disruption, screen fatigue, commute strain, nutrition)

### Key Technical Capabilities
1. **JWT Authentication & RBAC**: Real backend-verified JSON Web Tokens with strict role segregation (`student`, `counsellor`, `admin`). No mock sessions or hardcoded profiles.
2. **PostgreSQL Relational Storage**: Schema with foreign keys, cascading deletions, constraints, and audit timestamps.
3. **Deterministic 20-Item Assessment Engine**: Evaluates responses using documented weights (`Yes` = 2, `Sometimes` = 1, `No` = 0) mapping to Low (0–13), Moderate (14–26), and High (27–40) stress classifications.
4. **Summarized Student Stress Report**: In high-stress cases, referral reports preserve student privacy by withholding individual questionnaire item answers, sharing only aggregate diagnostic indicators.
5. **Anonymous WebRTC Counselling Room**: Zero-disclosure peer-to-peer audio, video, and real-time chat with session-scoped guest tokens and ephemeral identifiers (e.g., `Guest-7K2`).
6. **Administrator Dashboard**: Real database metrics, paginated student management, questionnaire repository controls, and CSV export.

---

## 2. Technology Stack

- **Frontend**: React 19, TypeScript, React Router 7, Tailwind CSS, Lucide React
- **Full-Stack Runtime**: Express.js + Vite middleware running on Node.js / Port 3000
- **Database**: PostgreSQL (PGlite relational engine with persistent data storage)
- **Real-Time Communication**: WebSocket Signalling Server (`/ws`) + WebRTC `RTCPeerConnection` (audio, video, data channel)
- **Security**: Argon2/Bcrypt password hashing, PyJWT/jsonwebtoken token issuance

---

## 3. Database Schema Overview

```
users (id, full_name, email, password_hash, role, is_active, created_at, updated_at)
  └── students (id, user_id, name, email, age, course, academic_year, created_at)
  └── counsellor_profiles (id, user_id, display_name, contact_information, is_available)
  └── questionnaires (id, question_text, category, stress_area, weight, is_active)
  └── assessments (id, student_id, stress_area, total_score, stress_level, status, completed_at)
        └── responses (id, assessment_id, question_id, question_text_snapshot, category, answer, score)
        └── predictions (id, assessment_id, student_id, stress_level, total_score, contributing_factors)
        └── student_recommendations (id, assessment_id, recommendation_id)
        └── counselling_requests (id, assessment_id, student_id, counsellor_id, summary, status, notes)
  └── counselling_sessions (id, guest_id, guest_alias, counsellor_id, session_type, status)
  └── reports (id, admin_id, report_type, report_data, generated_at)
```

---

## 4. Local Development Startup Instructions

### Running the Live Full-Stack Application

The application is pre-configured to run full-stack on port 3000:

```bash
# 1. Install dependencies
npm install

# 2. Run the application
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Default Demonstration Accounts

For demonstration and MCA evaluation, the database is pre-seeded with the following accounts:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@stresspredict.edu` | `Admin@12345` | Institutional Console & Question Bank |
| **Counsellor** | `counsellor@stresspredict.edu` | `Counsellor@12345` | Dr. Evelyn Reed, Ph.D. (Console & Queue) |
| **Student** | `alex.student@stresspredict.edu` | `Student@12345` | Alex Morgan (MCA Year 2) |

*You can also register a brand new student account via the `/register` page.*

---

## 5. Automated Tests

Run the test suite verifying the stress scoring calculation thresholds:

```bash
python3 backend/tests/test_assessment.py
```

Result:
```text
Ran 7 tests in 0.000s
OK
```

---

## 6. Anonymous WebRTC Room Demonstration

To test the anonymous peer-to-peer room locally:
1. Open an Incognito window and visit `http://localhost:3000/anonymous-counselling`.
2. Choose **Video Call**, **Audio Only**, or **Live Chat** and click **Enter Anonymous Room**.
3. In your normal browser window, sign in as the counsellor (`counsellor@stresspredict.edu`) and visit `http://localhost:3000/counsellor/console`.
4. In the **Anonymous Waiting Queue**, click **Connect with Student**.
5. Both contexts establish WebRTC peer connection and WebSocket chat in real time.
