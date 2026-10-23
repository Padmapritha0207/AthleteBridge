import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, Float, ForeignKey
)
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    display_name = Column(String(255), nullable=False)
    role = Column(String(50), default="athlete", nullable=False)  # athlete, staff, coach, counsellor
    avatar_initials = Column(String(10), default="AB")
    is_demo_user = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    profile = relationship("AthleteProfile", back_populates="user", uselist=False)
    support_pref = relationship("AthleteSupportPreference", back_populates="user", uselist=False)
    events = relationship("Event", back_populates="user")
    notifications = relationship("Notification", back_populates="user")


class AthleteProfile(Base):
    __tablename__ = "athlete_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    institution = Column(String(255), default="Cascadia University")
    academic_level = Column(String(100), default="Sophomore (Undergraduate)")
    primary_sport = Column(String(100), default="Track & Field")
    secondary_sports = Column(String(255), default="Wheelchair Racing")
    skill_level = Column(String(100), default="Varsity / National Contender")
    academic_major = Column(String(255), default="Computer Science & Data")
    goals = Column(Text, default="Balance semester exams with qualifying times for Nationals.")
    exam_period = Column(String(255), default="Midterm exams in 3 weeks")
    short_term_sport_goals = Column(Text, default="Improve footwork, technique, and consistency.")
    long_term_sport_goals = Column(Text, default="Qualify for conference championships.")
    improvement_areas = Column(Text, default="Technique, Consistency, Endurance")
    platform_goals = Column(Text, default="Balance education and sports, Improve sporting performance")
    experience_type = Column(String(50), default="standard")  # standard vs accessible
    preferred_training_times = Column(String(255), default="Mornings (7:00-9:30 AM), Late Afternoon (4:30-6:30 PM)")
    region = Column(String(100), default="Pacific Northwest")
    visibility_preferences = Column(String(100), default="institution_only")  # private, institution_only, public_badges
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="profile")


class AthleteSupportPreference(Base):
    __tablename__ = "athlete_support_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    # Stored strictly confidentially; private by default, editable at any time.
    optional_needs_description = Column(Text, default="Requires accessible competition transport and ramp-accessible weight room.")
    communication_preference = Column(String(100), default="Email and In-App Notifications")
    equipment_notes = Column(Text, default="Racing chair requires secured transport space.")
    is_private = Column(Boolean, default=True)  # Never shared with peers
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="support_pref")


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    event_type = Column(String(50), nullable=False)  # academic, exam, assignment, training, competition, travel, rest, task
    date = Column(String(10), nullable=False)  # YYYY-MM-DD
    start_time = Column(String(5), nullable=False)  # HH:MM (24-hr)
    end_time = Column(String(5), nullable=False)  # HH:MM (24-hr)
    is_fixed = Column(Boolean, default=False)  # True for exams, fixed classes, travel
    priority = Column(String(20), default="medium")  # high, medium, low
    buffer_minutes = Column(Integer, default=15)  # Required travel/prep buffer before & after
    deadline = Column(String(20), nullable=True)  # For assignments/tasks
    notes = Column(Text, nullable=True)
    location = Column(String(255), default="Campus / Athletic Facility")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="events")


class Coach(Base):
    __tablename__ = "coaches"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    sport = Column(String(100), nullable=False)
    coaching_level = Column(String(100), nullable=False)  # Elite, Collegiate, Adaptive Specialist, Youth/Junior
    hourly_fee = Column(String(50), default="$60 - $90 / hr (Demo estimate)")
    availability_status = Column(String(100), default="Open for Consultations")
    region = Column(String(100), default="Pacific Northwest / Remote")
    bio = Column(Text, nullable=False)
    qualifications = Column(Text, nullable=False)
    accessibility_specialties = Column(String(255), default="Adaptive equipment fitting, wheelchair sprint mechanics")
    venue_equipment_details = Column(Text, default="Wheelchair accessible track; roller trainers available.")
    is_verified_demo = Column(Boolean, default=True)  # Conspicuously labelled fictional
    contact_email = Column(String(255), default="demo.coach@athletebridge.example.edu")


class CoachRequest(Base):
    __tablename__ = "coach_requests"

    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    coach_id = Column(Integer, ForeignKey("coaches.id"), nullable=False)
    requested_date = Column(String(20), nullable=False)
    sport = Column(String(100), nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(String(50), default="pending")  # pending, confirmed, declined
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # camp, club, competition, program, event
    organizer = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    is_online = Column(Boolean, default=False)
    start_date = Column(String(20), nullable=False)
    end_date = Column(String(20), nullable=False)
    cost = Column(String(50), default="Free for collegiate athletes")
    eligibility = Column(Text, nullable=False)
    access_details = Column(Text, nullable=False)
    transport_notes = Column(Text, nullable=True)
    source_url = Column(String(255), default="https://example.edu/demo-opportunity")
    verification_state = Column(String(50), default="Verified Accessible Venue")  # Verified Accessible Venue, Self-Reported Access, Unverified Access Details
    last_verified = Column(String(20), default="2026-10-15")


class SavedOpportunity(Base):
    __tablename__ = "saved_opportunities"

    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=False)
    status = Column(String(50), default="saved")  # saved, registered
    saved_at = Column(DateTime, default=datetime.datetime.utcnow)


class Scholarship(Base):
    __tablename__ = "scholarships"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    provider = Column(String(255), nullable=False)
    academic_level = Column(String(100), default="Undergraduate")
    sport = Column(String(100), default="All Sports / Adaptive Athletics")
    eligibility_criteria = Column(Text, nullable=False)
    benefits = Column(String(255), default="$5,000 / academic year + travel stipend")
    deadline = Column(String(20), nullable=False)  # YYYY-MM-DD
    official_url = Column(String(255), default="https://example.edu/demo-scholarship")
    status = Column(String(50), default="Open")  # Open, Upcoming, Closed, Unverified
    last_verified = Column(String(20), default="2026-10-10")
    checklist_json = Column(Text, default="[\"Transcript upload\", \"Coach recommendation letter\", \"Personal statement on athletic & academic goals\"]")


class SavedScholarship(Base):
    __tablename__ = "saved_scholarships"

    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    scholarship_id = Column(Integer, ForeignKey("scholarships.id"), nullable=False)
    application_status = Column(String(50), default="saved")  # saved, preparing, submitted
    notes = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)


class SupportRequest(Base):
    __tablename__ = "support_requests"

    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    athlete_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)  # academic_exam, training_facility, travel_competition, assistive_tech, other
    concise_description = Column(Text, nullable=False)
    date_needed = Column(String(20), nullable=False)
    preferred_comm_method = Column(String(100), default="Email & In-App")
    status = Column(String(50), default="submitted")  # submitted, under_review, info_needed, approved, declined, resolved
    staff_notes = Column(Text, default="Request received. Assigned to Athletics Accommodation Coordinator.")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)


class SupportRequestHistory(Base):
    __tablename__ = "support_request_history"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("support_requests.id", ondelete="CASCADE"), nullable=False)
    changed_by_user_id = Column(Integer, nullable=False)
    changed_by_name = Column(String(255), nullable=False)
    status_from = Column(String(50), nullable=False)
    status_to = Column(String(50), nullable=False)
    note = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class ProgressGoal(Base):
    __tablename__ = "progress_goals"

    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String(50), nullable=False)  # academic, sport
    title = Column(String(255), nullable=False)
    target_metric = Column(String(100), nullable=False)
    current_metric = Column(String(100), nullable=False)
    target_date = Column(String(20), nullable=False)
    status = Column(String(50), default="in_progress")  # in_progress, achieved


class AthleteAchievement(Base):
    __tablename__ = "athlete_achievements"

    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(50), default="sport")  # sport, academic, leadership
    date_achieved = Column(String(20), nullable=False)
    provenance = Column(String(50), default="verified_institutional")  # self_entered, verified_institutional
    verified_by = Column(String(255), default="University Athletic Dept")
    is_shared_publicly = Column(Boolean, default=False)  # Controlled by athlete


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="reminder")  # schedule_conflict, exam_reminder, support_update, scholarship_deadline
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class MealLog(Base):
    __tablename__ = "meal_logs"

    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    meal_type = Column(String(50), nullable=False)  # pre_training, post_training, breakfast, lunch, dinner, snack
    description = Column(Text, nullable=False)
    hydration_ml = Column(Integer, default=500)
    timing_relative_to_training = Column(String(100), default="1.5 hours before session")
    dietary_flags = Column(String(255), default="Plant-rich, High Complex Carbs")
    logged_at = Column(DateTime, default=datetime.datetime.utcnow)


class TrainingSession(Base):
    __tablename__ = "training_sessions"

    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sport = Column(String(100), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    intensity = Column(String(20), default="moderate")  # low, moderate, high, race_pace
    equipment_used = Column(String(255), default="Track, Racing Chair, Heart Rate Monitor")
    completed = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    logged_at = Column(DateTime, default=datetime.datetime.utcnow)


class RecoveryLog(Base):
    __tablename__ = "recovery_logs"

    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sleep_hours = Column(Float, nullable=False)
    fatigue_level = Column(Integer, default=3)  # 1 (refreshed) to 5 (exhausted)
    perceived_exertion = Column(Integer, default=6)  # 1-10 RPE
    rest_quality = Column(String(50), default="good")  # poor, moderate, good, restful
    self_notes = Column(Text, nullable=True)
    logged_at = Column(DateTime, default=datetime.datetime.utcnow)


class Counsellor(Base):
    __tablename__ = "counsellors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    specialty = Column(String(255), nullable=False)  # Sports Psychologist, Performance Anxiety Specialist, Student-Athlete Transition
    bio = Column(Text, nullable=False)
    credentials_demo = Column(String(255), default="Ph.D. Sports Psychology, CMPC (Demo Listing)")
    contact_info = Column(String(255), default="wellbeing@cascadia-athletics.example.edu")
    demo_notice = Column(String(255), default="[DEMO LISTING] Fictional practitioner for prototype demonstration.")


class CounsellorBooking(Base):
    __tablename__ = "counsellor_bookings"

    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    counsellor_id = Column(Integer, ForeignKey("counsellors.id"), nullable=False)
    requested_slot = Column(String(50), nullable=False)
    reason_category = Column(String(100), default="Competition Mindset & Pre-Race Nerves")
    notes = Column(Text, nullable=True)
    status = Column(String(50), default="requested")  # requested, confirmed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class MoodEntry(Base):
    __tablename__ = "mood_entries"

    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mood_score = Column(Integer, nullable=False)  # 1 to 5
    reflection_notes = Column(Text, nullable=True)
    is_private = Column(Boolean, default=True)  # strictly private to athlete
    logged_at = Column(DateTime, default=datetime.datetime.utcnow)


class CommunityGroup(Base):
    __tablename__ = "community_groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    sport = Column(String(100), nullable=False)
    region = Column(String(100), default="National Collegiate")
    description = Column(Text, nullable=False)
    member_count = Column(Integer, default=14)
    is_adaptive_interest = Column(Boolean, default=False)


class GroupMembership(Base):
    __tablename__ = "group_memberships"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("community_groups.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    joined_at = Column(DateTime, default=datetime.datetime.utcnow)


class GroupPost(Base):
    __tablename__ = "group_posts"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("community_groups.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    author_name = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    is_flagged = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class UserBlockReport(Base):
    __tablename__ = "user_blocks_reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reported_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    report_type = Column(String(20), nullable=False)  # block, report
    reason = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
