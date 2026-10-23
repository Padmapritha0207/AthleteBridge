import {
  User, AthleteProfile, AthleteSupportPreference, DemoUserOption,
  ScheduleEvent, ScheduleConflictReport, RescheduleSuggestionResponse,
  Coach, CoachRequest, Opportunity, Scholarship, SavedScholarship,
  SupportRequest, ProgressGoal, AthleteAchievement, NotificationItem,
  MealLog, TrainingSession, RecoveryLog, Counsellor, MoodEntry,
  CommunityGroup, GroupPost, OnboardingData, OnboardingResponse
} from '../types';

const API_BASE = '/api';

export function getActiveUserHeaders(): Record<string, string> {
  const userId = localStorage.getItem('ab_demo_user_id') || '1';
  const role = localStorage.getItem('ab_demo_role') || 'athlete';
  return {
    'X-Demo-User-Id': userId,
    'X-Demo-Role': role,
    'Content-Type': 'application/json'
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    ...getActiveUserHeaders(),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorDetail = 'API request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // --- Auth & Identity Context ---
  getMe: () => request<{
    user: User;
    active_role: string;
    profile: AthleteProfile | null;
    support_preference: AthleteSupportPreference | null;
    unread_notifications: number;
    demo_notice: string;
  }>('/auth/me'),

  getDemoUsers: () => request<DemoUserOption[]>('/auth/demo-users'),

  getNotifications: () => request<NotificationItem[]>('/auth/notifications'),

  markNotificationRead: (id: number) =>
    request<{ status: string }>(`/auth/notifications/${id}/mark-read`, { method: 'POST' }),

  // --- Profile & Confidential Preferences ---
  updateProfile: (data: Partial<AthleteProfile>) =>
    request<AthleteProfile>('/profile/me', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  updateSupportPreferences: (data: Partial<AthleteSupportPreference>) =>
    request<AthleteSupportPreference>('/profile/support-preferences', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  submitOnboarding: (data: OnboardingData) =>
    request<OnboardingResponse>('/profile/onboarding', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // --- BalanceAI Schedule ---
  getEvents: (params?: { date?: string; event_type?: string }) => {
    const qs = new URLSearchParams();
    if (params?.date) qs.set('date', params.date);
    if (params?.event_type) qs.set('event_type', params.event_type);
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return request<ScheduleEvent[]>(`/schedule/events${query}`);
  },

  createEvent: (data: Omit<ScheduleEvent, 'id' | 'user_id' | 'created_at'>) =>
    request<ScheduleEvent>('/schedule/events', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateEvent: (id: number, data: Partial<ScheduleEvent>) =>
    request<ScheduleEvent>(`/schedule/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteEvent: (id: number) =>
    request<{ status: string; message: string }>(`/schedule/events/${id}`, {
      method: 'DELETE'
    }),

  getConflicts: () => request<ScheduleConflictReport>('/schedule/conflicts'),

  suggestAlternatives: (eventId: number) =>
    request<RescheduleSuggestionResponse>(`/schedule/suggest-alternatives/${eventId}`),

  applyAlternative: (payload: {
    event_id: number;
    target_date: string;
    target_start_time: string;
    target_end_time: string;
  }) =>
    request<{
      status: string;
      message: string;
      updated_event: ScheduleEvent;
      conflict_report: ScheduleConflictReport;
    }>('/schedule/apply-alternative', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // --- Coach Finder ---
  getCoaches: (params?: { sport?: string; region?: string; coaching_level?: string; q?: string }) => {
    const qs = new URLSearchParams();
    if (params?.sport) qs.set('sport', params.sport);
    if (params?.region) qs.set('region', params.region);
    if (params?.coaching_level) qs.set('coaching_level', params.coaching_level);
    if (params?.q) qs.set('q', params.q);
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return request<Coach[]>(`/coaches${query}`);
  },

  getCoach: (id: number) => request<Coach>(`/coaches/${id}`),

  requestCoach: (coachId: number, data: { requested_date: string; sport: string; notes?: string }) =>
    request<CoachRequest>(`/coaches/${coachId}/request`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getMyCoachRequests: () => request<CoachRequest[]>('/coaches/requests/my'),

  // --- Opportunities (AccessMatch) ---
  getOpportunities: (params?: { type?: string; verification_state?: string; is_online?: boolean; q?: string }) => {
    const qs = new URLSearchParams();
    if (params?.type) qs.set('type', params.type);
    if (params?.verification_state) qs.set('verification_state', params.verification_state);
    if (params?.is_online !== undefined) qs.set('is_online', String(params.is_online));
    if (params?.q) qs.set('q', params.q);
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return request<Opportunity[]>(`/opportunities${query}`);
  },

  toggleSaveOpportunity: (id: number) =>
    request<{ status: string; saved: boolean }>(`/opportunities/${id}/save`, { method: 'POST' }),

  getMySavedOpportunities: () => request<Opportunity[]>('/opportunities/saved/my'),

  registerOpportunity: (id: number) =>
    request<{ status: string; message: string }>(`/opportunities/${id}/register`, { method: 'POST' }),

  createOpportunity: (data: Partial<Opportunity>) =>
    request<Opportunity>('/opportunities', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // --- Scholarships ---
  getScholarships: (params?: { sport?: string; academic_level?: string; status?: string; q?: string }) => {
    const qs = new URLSearchParams();
    if (params?.sport) qs.set('sport', params.sport);
    if (params?.academic_level) qs.set('academic_level', params.academic_level);
    if (params?.status) qs.set('status', params.status);
    if (params?.q) qs.set('q', params.q);
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return request<Scholarship[]>(`/scholarships${query}`);
  },

  toggleSaveScholarship: (id: number) =>
    request<{ status: string; saved: boolean }>(`/scholarships/${id}/save`, { method: 'POST' }),

  getMySavedScholarships: () =>
    request<Array<{
      id: number;
      scholarship_id: number;
      application_status: 'saved' | 'preparing' | 'submitted';
      notes?: string;
      updated_at: string;
      scholarship?: Scholarship;
    }>>('/scholarships/saved/my'),

  updateScholarshipApplication: (savedId: number, data: { application_status: string; notes?: string }) =>
    request<{ status: string; application_status: string; notes?: string }>(`/scholarships/saved/${savedId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // --- SupportBridge Accommodations ---
  getMySupportRequests: () => request<SupportRequest[]>('/support/my-requests'),

  createSupportRequest: (data: {
    category: string;
    concise_description: string;
    date_needed: string;
    preferred_comm_method: string;
  }) =>
    request<SupportRequest>('/support/requests', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getStaffSupportQueue: () => request<SupportRequest[]>('/support/staff-queue'),

  updateSupportRequestStatus: (id: number, data: { status: string; note: string }) =>
    request<{ status: string; message: string; new_status: string; note: string }>(`/support/requests/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // --- DualProgress & Athlete Passport ---
  getGoals: () => request<ProgressGoal[]>('/progress/goals'),

  createGoal: (data: { category: string; title: string; target_metric: string; current_metric: string; target_date: string }) =>
    request<ProgressGoal>('/progress/goals', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  toggleGoalStatus: (goalId: number) =>
    request<{ status: string; new_status: string }>(`/progress/goals/${goalId}/toggle`, { method: 'PUT' }),

  getAchievements: () => request<AthleteAchievement[]>('/progress/achievements'),

  createAchievement: (data: {
    title: string;
    category: string;
    date_achieved: string;
    provenance: string;
    verified_by?: string;
    is_shared_publicly: boolean;
  }) =>
    request<AthleteAchievement>('/progress/achievements', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  toggleAchievementShare: (achId: number) =>
    request<{ status: string; is_shared_publicly: boolean }>(`/progress/achievements/${achId}/share`, { method: 'PUT' }),

  // --- FuelRight & Recovery ---
  getMeals: () => request<MealLog[]>('/health/meals'),

  logMeal: (data: {
    meal_type: string;
    description: string;
    hydration_ml: number;
    timing_relative_to_training: string;
    dietary_flags: string;
  }) =>
    request<MealLog>('/health/meals', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getTrainingSessions: () => request<TrainingSession[]>('/health/training'),

  logTrainingSession: (data: {
    sport: string;
    duration_minutes: number;
    intensity: string;
    equipment_used: string;
    completed: boolean;
    notes?: string;
  }) =>
    request<TrainingSession>('/health/training', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getRecoveryLogs: () => request<RecoveryLog[]>('/health/recovery'),

  logRecovery: (data: {
    sleep_hours: number;
    fatigue_level: number;
    perceived_exertion: number;
    rest_quality: string;
    self_notes?: string;
  }) =>
    request<RecoveryLog>('/health/recovery', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // --- MindStrong ---
  getCopingExercises: () =>
    request<{ exercises: Array<{ id: string; title: string; category: string; duration: string; description: string; steps: string[] }>; disclaimer: string }>('/mindstrong/exercises'),

  getCounsellors: () => request<Counsellor[]>('/mindstrong/counsellors'),

  bookCounsellor: (counsellorId: number, data: { requested_slot: string; reason_category: string; notes?: string }) =>
    request<any>(`/mindstrong/counsellors/${counsellorId}/book`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getMoods: () => request<MoodEntry[]>('/mindstrong/moods'),

  logMood: (data: { mood_score: number; reflection_notes?: string }) =>
    request<MoodEntry>('/mindstrong/moods', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  deleteMood: (id: number) =>
    request<{ status: string; message: string }>(`/mindstrong/moods/${id}`, { method: 'DELETE' }),

  // --- AthleteConnect Community ---
  getGuidelines: () => request<{ title: string; rules: string[] }>('/community/guidelines'),

  getGroups: () => request<CommunityGroup[]>('/community/groups'),

  joinGroup: (id: number) => request<{ status: string; group_id: number; is_member: boolean }>(`/community/groups/${id}/join`, { method: 'POST' }),

  leaveGroup: (id: number) => request<{ status: string; group_id: number; is_member: boolean }>(`/community/groups/${id}/leave`, { method: 'POST' }),

  getGroupPosts: (groupId: number) => request<GroupPost[]>(`/community/groups/${groupId}/posts`),

  createGroupPost: (data: { group_id: number; content: string }) =>
    request<GroupPost>('/community/posts', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  reportOrBlock: (data: { reported_user_id: number; report_type: string; reason: string }) =>
    request<{ status: string; message: string }>('/community/report', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // --- Staff Institutional Dashboard ---
  getStaffOverview: () => request<{
    demo_analytics_notice: string;
    support_metrics: {
      total_requests: number;
      submitted_pending: number;
      under_review: number;
      approved: number;
      resolved: number;
      category_distribution: Array<{ category: string; count: number }>;
    };
    directory_metrics: {
      total_opportunities: number;
      verified_venues: number;
      total_coaches: number;
    };
    audit_logs: Array<{
      id: number;
      request_id: number;
      changed_by: string;
      transition: string;
      note: string;
      timestamp: string;
    }>;
  }>('/staff/overview'),

  verifyOpportunityVenue: (oppId: number) =>
    request<{ status: string; verification_state: string }>(`/staff/opportunities/${oppId}/verify`, { method: 'POST' })
};
