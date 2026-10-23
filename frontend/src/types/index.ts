export type Role = 'athlete' | 'staff' | 'coach' | 'counsellor';
export type AthletePerspective = 'standard' | 'accessible';

export interface OnboardingData {
  display_name: string;
  age: number | '';
  education_level: 'School student' | 'College student' | 'Other';
  academic_goals?: string;
  support_subjects?: string;
  exam_period?: string;
  primary_sport: string;
  secondary_sport?: string;
  skill_level: 'Beginner' | 'School or college level' | 'District or state level' | 'National or international level';
  training_frequency?: string;
  competition_level?: string;
  sporting_goals?: string;
  short_term_sport_goals?: string;
  long_term_sport_goals?: string;
  improvement_areas?: string[];
  primary_goal?: 'Balance education and sports' | 'Improve sports performance' | 'Find coaches and sporting opportunities' | 'All of the above';
  platform_goals?: string[];
  experience_type: 'standard' | 'accessible';
  accessibility_status: 'no_support' | 'requires_support' | 'prefer_not_to_say';
  accommodations: string[];
  other_accommodations?: string;
  study_availability: 'Morning' | 'Afternoon' | 'Evening' | 'My schedule varies';
  training_availability: 'Morning' | 'Afternoon' | 'Evening' | 'My schedule varies';
  availability_schedule?: 'Morning' | 'Afternoon' | 'Evening' | 'My schedule varies';
  preferred_learning_formats?: string[];
  preferred_communication_methods?: string;
  reminder_preferences?: string[];
  support_preferences: string[];
}

export interface OnboardingResponse {
  status: string;
  message: string;
  perspective: AthletePerspective;
  user: User;
  profile: AthleteProfile;
  support_preference?: AthleteSupportPreference;
}

export interface User {
  id: number;
  email: string;
  display_name: string;
  role: Role;
  avatar_initials: string;
  is_demo_user: boolean;
}

export interface DemoUserOption {
  id: number;
  display_name: string;
  role: Role;
  email: string;
  avatar_initials: string;
}

export interface AthleteProfile {
  id: number;
  user_id: number;
  institution: string;
  academic_level: string;
  primary_sport: string;
  secondary_sports: string;
  skill_level: string;
  academic_major: string;
  goals: string;
  exam_period?: string;
  short_term_sport_goals?: string;
  long_term_sport_goals?: string;
  improvement_areas?: string;
  platform_goals?: string;
  experience_type?: 'standard' | 'accessible';
  preferred_training_times: string;
  region: string;
  visibility_preferences: string;
}

export interface AthleteSupportPreference {
  id: number;
  user_id: number;
  optional_needs_description: string;
  communication_preference: string;
  equipment_notes: string;
  is_private: boolean;
}

export type EventType =
  | 'academic'
  | 'exam'
  | 'assignment'
  | 'training'
  | 'competition'
  | 'travel'
  | 'rest'
  | 'task';

export interface ScheduleEvent {
  id: number;
  user_id: number;
  title: string;
  event_type: EventType;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  is_fixed: boolean;
  priority: 'high' | 'medium' | 'low';
  buffer_minutes: number;
  deadline?: string;
  notes?: string;
  location: string;
  created_at: string;
}

export interface ConflictItem {
  event_a_id: number;
  event_a_title: string;
  event_b_id: number;
  event_b_title: string;
  conflict_type: 'direct_overlap' | 'buffer_violation';
  description: string;
  severity: 'critical' | 'warning';
}

export interface ScheduleConflictReport {
  has_conflicts: boolean;
  total_conflicts: number;
  conflicts: ConflictItem[];
  status_summary: string;
}

export interface AlternativeSlot {
  slot_id: string;
  date: string;
  start_time: string;
  end_time: string;
  score: number;
  explanation: string;
  respects_buffers: boolean;
  preserves_rest: boolean;
}

export interface RescheduleSuggestionResponse {
  event_id: number;
  event_title: string;
  feasible_slots_found: boolean;
  constraints_considered: string[];
  alternatives: AlternativeSlot[];
  notes: string;
}

export interface Coach {
  id: number;
  full_name: string;
  sport: string;
  coaching_level: string;
  hourly_fee: string;
  availability_status: string;
  region: string;
  bio: string;
  qualifications: string;
  accessibility_specialties: string;
  venue_equipment_details: string;
  is_verified_demo: boolean;
  contact_email: string;
}

export interface CoachRequest {
  id: number;
  athlete_id: number;
  coach_id: number;
  requested_date: string;
  sport: string;
  notes?: string;
  status: string;
  created_at: string;
}

export interface Opportunity {
  id: number;
  title: string;
  type: string;
  organizer: string;
  location: string;
  is_online: boolean;
  start_date: string;
  end_date: string;
  cost: string;
  eligibility: string;
  access_details: string;
  transport_notes?: string;
  source_url: string;
  verification_state: string;
  last_verified: string;
}

export interface Scholarship {
  id: number;
  title: string;
  provider: string;
  academic_level: string;
  sport: string;
  eligibility_criteria: string;
  benefits: string;
  deadline: string;
  official_url: string;
  status: string;
  last_verified: string;
  checklist_json: string;
}

export interface SavedScholarship {
  id: number;
  scholarship_id: number;
  application_status: 'saved' | 'preparing' | 'submitted';
  notes?: string;
  updated_at: string;
  scholarship?: Scholarship;
}

export interface SupportRequestHistoryItem {
  id: number;
  request_id: number;
  changed_by_user_id: number;
  changed_by_name: string;
  status_from: string;
  status_to: string;
  note: string;
  created_at: string;
}

export interface SupportRequest {
  id: number;
  athlete_id: number;
  athlete_name: string;
  category: string;
  concise_description: string;
  date_needed: string;
  preferred_comm_method: string;
  status: 'submitted' | 'under_review' | 'info_needed' | 'approved' | 'declined' | 'resolved';
  staff_notes: string;
  created_at: string;
  updated_at: string;
  history: SupportRequestHistoryItem[];
}

export interface ProgressGoal {
  id: number;
  athlete_id: number;
  category: 'academic' | 'sport';
  title: string;
  target_metric: string;
  current_metric: string;
  target_date: string;
  status: 'in_progress' | 'achieved';
}

export interface AthleteAchievement {
  id: number;
  athlete_id: number;
  title: string;
  category: string;
  date_achieved: string;
  provenance: string;
  verified_by: string;
  is_shared_publicly: boolean;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

export interface MealLog {
  id: number;
  athlete_id: number;
  meal_type: string;
  description: string;
  hydration_ml: number;
  timing_relative_to_training: string;
  dietary_flags: string;
  logged_at: string;
}

export interface TrainingSession {
  id: number;
  athlete_id: number;
  sport: string;
  duration_minutes: number;
  intensity: string;
  equipment_used: string;
  completed: boolean;
  notes?: string;
  logged_at: string;
}

export interface RecoveryLog {
  id: number;
  athlete_id: number;
  sleep_hours: number;
  fatigue_level: number;
  perceived_exertion: number;
  rest_quality: string;
  self_notes?: string;
  logged_at: string;
}

export interface Counsellor {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  credentials_demo: string;
  contact_info: string;
  demo_notice: string;
}

export interface MoodEntry {
  id: number;
  athlete_id: number;
  mood_score: number;
  reflection_notes?: string;
  is_private: boolean;
  logged_at: string;
}

export interface CommunityGroup {
  id: number;
  name: string;
  sport: string;
  region: string;
  description: string;
  member_count: number;
  is_adaptive_interest: boolean;
  is_member?: boolean;
}

export interface GroupPost {
  id: number;
  group_id: number;
  author_id: number;
  author_name: string;
  content: string;
  is_flagged: boolean;
  created_at: string;
}
