from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Float
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="student", nullable=False)  # 'student', 'admin', 'counsellor'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student_profile = relationship("Student", back_populates="user", uselist=False, cascade="all, delete-orphan")
    counsellor_profile = relationship("CounsellorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    age = Column(Integer, nullable=True)
    course = Column(String(100), nullable=True)
    academic_year = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="student_profile")
    assessments = relationship("Assessment", back_populates="student", cascade="all, delete-orphan")
    counselling_requests = relationship("CounsellingRequest", back_populates="student", cascade="all, delete-orphan")

class Questionnaire(Base):
    __tablename__ = "questionnaires"

    id = Column(Integer, primary_key=True, index=True)
    question_text = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)
    stress_area = Column(String(50), nullable=False)  # 'Home', 'College/School', 'Both'
    weight = Column(Integer, default=1, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    stress_area = Column(String(50), nullable=False)
    total_score = Column(Integer, nullable=False)
    stress_level = Column(String(20), nullable=False)  # 'Low', 'Moderate', 'High'
    status = Column(String(20), default="completed")
    completed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="assessments")
    responses = relationship("Response", back_populates="assessment", cascade="all, delete-orphan")
    prediction = relationship("Prediction", back_populates="assessment", uselist=False, cascade="all, delete-orphan")

class Response(Base):
    __tablename__ = "responses"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("questionnaires.id", ondelete="SET NULL"), nullable=True)
    question_text_snapshot = Column(Text, nullable=False)
    category = Column(String(50), nullable=True)
    answer = Column(String(50), nullable=False)  # 'Yes', 'Sometimes', 'No'
    score = Column(Integer, nullable=False)      # 2, 1, 0
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    assessment = relationship("Assessment", back_populates="responses")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    stress_level = Column(String(20), nullable=False)
    total_score = Column(Integer, nullable=False)
    contributing_factors = Column(Text, nullable=False)
    prediction_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    assessment = relationship("Assessment", back_populates="prediction")

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    stress_level = Column(String(20), nullable=False)
    category = Column(String(50), nullable=False)
    suggestion = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)

class CounsellorProfile(Base):
    __tablename__ = "counsellor_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    display_name = Column(String(100), nullable=False)
    contact_information = Column(String(255), nullable=True)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="counsellor_profile")

class CounsellingRequest(Base):
    __tablename__ = "counselling_requests"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    counsellor_id = Column(Integer, ForeignKey("counsellor_profiles.id", ondelete="SET NULL"), nullable=True)
    summary = Column(Text, nullable=False)
    status = Column(String(20), default="Pending")  # 'Pending', 'Reviewed', 'Resolved'
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="counselling_requests")

class CounsellingSession(Base):
    __tablename__ = "counselling_sessions"

    id = Column(String(64), primary_key=True)
    guest_id = Column(String(64), nullable=False)
    guest_alias = Column(String(32), nullable=False)
    counsellor_id = Column(Integer, ForeignKey("counsellor_profiles.id", ondelete="SET NULL"), nullable=True)
    session_type = Column(String(20), nullable=False)  # 'audio', 'video', 'chat'
    status = Column(String(20), default="waiting")     # 'waiting', 'active', 'ended'
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    started_at = Column(DateTime(timezone=True), nullable=True)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    report_type = Column(String(50), nullable=False)
    report_data = Column(Text, nullable=False)
    generated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
