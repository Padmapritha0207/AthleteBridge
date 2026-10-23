from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict
import datetime

# --- User & Auth Schemas ---
class UserOut(BaseModel):
    id: int
    email: str
    display_name: str
    role: str
    avatar_initials: str
    is_demo_user: bool

    model_config = ConfigDict(from_attributes=True)


class AthleteProfileOut(BaseModel):
    id: int
    user_id: int
    institution: str
    academic_level: str
    primary_sport: str
    secondary_sports: str
    skill_level: str
    academic_major: str
    goals: str
    exam_period: Optional[str] = None
    short_term_sport_goals: Optional[str] = None
    long_term_sport_goals: Optional[str] = None
    improvement_areas: Optional[str] = None
    platform_goals: Optional[str] = None
    experience_type: Optional[str] = "standard"
    preferred_training_times: str
    region: str
    visibility_preferences: str

    model_config = ConfigDict(from_attributes=True)


class AthleteProfileUpdate(BaseModel):
    institution: Optional[str] = None
    academic_level: Optional[str] = None
    primary_sport: Optional[str] = None
    secondary_sports: Optional[str] = None
    skill_level: Optional[str] = None
    academic_major: Optional[str] = None
    goals: Optional[str] = None
    exam_period: Optional[str] = None
    short_term_sport_goals: Optional[str] = None
    long_term_sport_goals: Optional[str] = None
    improvement_areas: Optional[str] = None
    platform_goals: Optional[str] = None
    experience_type: Optional[str] = None
    preferred_training_times: Optional[str] = None
    region: Optional[str] = None
    visibility_preferences: Optional[str] = None


class AthleteSupportPrefOut(BaseModel):
    id: int
    user_id: int
    optional_needs_description: str
    communication_preference: str
    equipment_notes: str
    is_private: bool

    model_config = ConfigDict(from_attributes=True)


class AthleteSupportPrefUpdate(BaseModel):
    optional_needs_description: Optional[str] = None
    communication_preference: Optional[str] = None
    equipment_notes: Optional[str] = None
    is_private: Optional[bool] = None


class OnboardingRequest(BaseModel):
    display_name: str
    age: Optional[int] = None
    education_level: str = "College student"  # School student, College student, Other
    academic_goals: Optional[str] = None
    support_subjects: Optional[str] = None
    exam_period: Optional[str] = None
    primary_sport: str = "Track & Field"
    secondary_sport: Optional[str] = None
    skill_level: str = "School or college level"
    training_frequency: Optional[str] = "4-5 sessions per week"
    competition_level: Optional[str] = "Collegiate / Regional"
    sporting_goals: Optional[str] = None
    short_term_sport_goals: Optional[str] = None
    long_term_sport_goals: Optional[str] = None
    improvement_areas: List[str] = []
    primary_goal: Optional[str] = "All of the above"
    platform_goals: List[str] = []
    experience_type: Optional[str] = "standard"  # "standard" | "accessible"
    accessibility_status: Optional[str] = "no_support"  # no_support, requires_support, prefer_not_to_say
    accommodations: List[str] = []
    other_accommodations: Optional[str] = None
    study_availability: Optional[str] = "Evening"
    training_availability: Optional[str] = "Morning"
    availability_schedule: Optional[str] = "Morning"
    learning_formats: List[str] = []
    preferred_learning_formats: List[str] = []
    communication_methods: Optional[str] = "In-App & Email"
    preferred_communication_methods: Optional[str] = "In-App & Email"
    reminder_preferences: List[str] = []
    support_preferences: List[str] = []


class OnboardingResponse(BaseModel):
    status: str
    message: str
    perspective: str  # "standard" | "accessible"
    user: UserOut
    profile: AthleteProfileOut
    support_preference: Optional[AthleteSupportPrefOut] = None


# --- Schedule & BalanceAI Schemas ---
class EventBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    event_type: str = Field(..., description="academic, exam, assignment, training, competition, travel, rest, task")
    date: str = Field(..., description="YYYY-MM-DD")
    start_time: str = Field(..., description="HH:MM")
    end_time: str = Field(..., description="HH:MM")
    is_fixed: bool = False
    priority: str = "medium"  # high, medium, low
    buffer_minutes: int = 15
    deadline: Optional[str] = None
    notes: Optional[str] = None
    location: str = "Campus"


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: Optional[str] = None
    event_type: Optional[str] = None
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    is_fixed: Optional[bool] = None
    priority: Optional[str] = None
    buffer_minutes: Optional[int] = None
    deadline: Optional[str] = None
    notes: Optional[str] = None
    location: Optional[str] = None


class EventOut(EventBase):
    id: int
    user_id: int
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class ConflictItem(BaseModel):
    event_a_id: int
    event_a_title: str
    event_b_id: int
    event_b_title: str
    conflict_type: str  # direct_overlap, buffer_violation
    description: str
    severity: str  # critical, warning


class ScheduleConflictReport(BaseModel):
    has_conflicts: bool
    total_conflicts: int
    conflicts: List[ConflictItem]
    status_summary: str


class AlternativeSlot(BaseModel):
    slot_id: str
    date: str
    start_time: str
    end_time: str
    score: float
    explanation: str
    respects_buffers: bool
    preserves_rest: bool


class RescheduleSuggestionResponse(BaseModel):
    event_id: int
    event_title: str
    feasible_slots_found: bool
    constraints_considered: List[str]
    alternatives: List[AlternativeSlot]
    notes: str


class ApplyAlternativeRequest(BaseModel):
    event_id: int
    target_date: str
    target_start_time: str
    target_end_time: str


# --- Coaches ---
class CoachOut(BaseModel):
    id: int
    full_name: str
    sport: str
    coaching_level: str
    hourly_fee: str
    availability_status: str
    region: str
    bio: str
    qualifications: str
    accessibility_specialties: str
    venue_equipment_details: str
    is_verified_demo: bool
    contact_email: str

    model_config = ConfigDict(from_attributes=True)


class CoachRequestCreate(BaseModel):
    coach_id: int
    requested_date: str
    sport: str
    notes: Optional[str] = None


class CoachRequestOut(BaseModel):
    id: int
    athlete_id: int
    coach_id: int
    requested_date: str
    sport: str
    notes: Optional[str]
    status: str
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


# --- Opportunities ---
class OpportunityOut(BaseModel):
    id: int
    title: str
    type: str
    organizer: str
    location: str
    is_online: bool
    start_date: str
    end_date: str
    cost: str
    eligibility: str
    access_details: str
    transport_notes: Optional[str]
    source_url: str
    verification_state: str
    last_verified: str

    model_config = ConfigDict(from_attributes=True)


class OpportunityCreate(BaseModel):
    title: str
    type: str
    organizer: str
    location: str
    is_online: bool = False
    start_date: str
    end_date: str
    cost: str
    eligibility: str
    access_details: str
    transport_notes: Optional[str] = None
    source_url: str = "https://example.edu/opportunity"
    verification_state: str = "Verified Accessible Venue"


# --- Scholarships ---
class ScholarshipOut(BaseModel):
    id: int
    title: str
    provider: str
    academic_level: str
    sport: str
    eligibility_criteria: str
    benefits: str
    deadline: str
    official_url: str
    status: str
    last_verified: str
    checklist_json: str

    model_config = ConfigDict(from_attributes=True)


class SavedScholarshipUpdate(BaseModel):
    application_status: str  # saved, preparing, submitted
    notes: Optional[str] = None


class SavedScholarshipOut(BaseModel):
    id: int
    athlete_id: int
    scholarship_id: int
    application_status: str
    notes: Optional[str]
    updated_at: datetime.datetime
    scholarship: Optional[ScholarshipOut] = None

    model_config = ConfigDict(from_attributes=True)


# --- SupportBridge Requests ---
class SupportRequestCreate(BaseModel):
    category: str
    concise_description: str
    date_needed: str
    preferred_comm_method: str = "Email & In-App"


class SupportRequestStatusUpdate(BaseModel):
    status: str  # submitted, under_review, info_needed, approved, declined, resolved
    note: str


class SupportRequestHistoryOut(BaseModel):
    id: int
    request_id: int
    changed_by_user_id: int
    changed_by_name: str
    status_from: str
    status_to: str
    note: str
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class SupportRequestOut(BaseModel):
    id: int
    athlete_id: int
    athlete_name: str
    category: str
    concise_description: str
    date_needed: str
    preferred_comm_method: str
    status: str
    staff_notes: str
    created_at: datetime.datetime
    updated_at: datetime.datetime
    history: List[SupportRequestHistoryOut] = []

    model_config = ConfigDict(from_attributes=True)


# --- Progress & Passport ---
class ProgressGoalCreate(BaseModel):
    category: str  # academic, sport
    title: str
    target_metric: str
    current_metric: str
    target_date: str


class ProgressGoalOut(BaseModel):
    id: int
    athlete_id: int
    category: str
    title: str
    target_metric: str
    current_metric: str
    target_date: str
    status: str

    model_config = ConfigDict(from_attributes=True)


class AchievementCreate(BaseModel):
    title: str
    category: str = "sport"
    date_achieved: str
    provenance: str = "self_entered"
    verified_by: Optional[str] = "Self-Recorded"
    is_shared_publicly: bool = False


class AchievementOut(BaseModel):
    id: int
    athlete_id: int
    title: str
    category: str
    date_achieved: str
    provenance: str
    verified_by: str
    is_shared_publicly: bool

    model_config = ConfigDict(from_attributes=True)


# --- FuelRight & Recovery ---
class MealLogCreate(BaseModel):
    meal_type: str
    description: str
    hydration_ml: int = 500
    timing_relative_to_training: str = "1.5 hours before session"
    dietary_flags: str = "General Balanced"


class MealLogOut(BaseModel):
    id: int
    athlete_id: int
    meal_type: str
    description: str
    hydration_ml: int
    timing_relative_to_training: str
    dietary_flags: str
    logged_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class TrainingSessionCreate(BaseModel):
    sport: str
    duration_minutes: int
    intensity: str = "moderate"
    equipment_used: str = "Standard athletic gear"
    completed: bool = True
    notes: Optional[str] = None


class TrainingSessionOut(BaseModel):
    id: int
    athlete_id: int
    sport: str
    duration_minutes: int
    intensity: str
    equipment_used: str
    completed: bool
    notes: Optional[str]
    logged_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class RecoveryLogCreate(BaseModel):
    sleep_hours: float
    fatigue_level: int = Field(..., ge=1, le=5)
    perceived_exertion: int = Field(..., ge=1, le=10)
    rest_quality: str = "good"
    self_notes: Optional[str] = None


class RecoveryLogOut(BaseModel):
    id: int
    athlete_id: int
    sleep_hours: float
    fatigue_level: int
    perceived_exertion: int
    rest_quality: str
    self_notes: Optional[str]
    logged_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


# --- MindStrong ---
class CounsellorOut(BaseModel):
    id: int
    name: str
    specialty: str
    bio: str
    credentials_demo: str
    contact_info: str
    demo_notice: str

    model_config = ConfigDict(from_attributes=True)


class CounsellorBookingCreate(BaseModel):
    counsellor_id: int
    requested_slot: str
    reason_category: str
    notes: Optional[str] = None


class CounsellorBookingOut(BaseModel):
    id: int
    athlete_id: int
    counsellor_id: int
    requested_slot: str
    reason_category: str
    notes: Optional[str]
    status: str
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class MoodEntryCreate(BaseModel):
    mood_score: int = Field(..., ge=1, le=5)
    reflection_notes: Optional[str] = None


class MoodEntryOut(BaseModel):
    id: int
    athlete_id: int
    mood_score: int
    reflection_notes: Optional[str]
    is_private: bool
    logged_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


# --- Community & Groups ---
class CommunityGroupOut(BaseModel):
    id: int
    name: str
    sport: str
    region: str
    description: str
    member_count: int
    is_adaptive_interest: bool
    is_member: bool = False

    model_config = ConfigDict(from_attributes=True)


class GroupPostCreate(BaseModel):
    group_id: int
    content: str = Field(..., min_length=2, max_length=2000)


class GroupPostOut(BaseModel):
    id: int
    group_id: int
    author_id: int
    author_name: str
    content: str
    is_flagged: bool
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class UserBlockReportCreate(BaseModel):
    reported_user_id: int
    report_type: str = "report"  # block or report
    reason: str


# --- Notifications ---
class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    notification_type: str
    is_read: bool
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
