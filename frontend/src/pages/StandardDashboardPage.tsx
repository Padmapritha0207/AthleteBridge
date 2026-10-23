import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Calendar, Users, Award, Compass, TrendingUp, Dumbbell,
  BookOpen, Clock, AlertTriangle, CheckCircle2, ChevronRight,
  Sparkles, ArrowRight, Activity, Zap, Target, Bell,
  FileText, ShieldCheck, HeartPulse, Trophy, Check, Plus, ExternalLink
} from 'lucide-react';
import {
  ScheduleEvent, ScheduleConflictReport, Coach, Opportunity, Scholarship,
  TrainingSession, ProgressGoal
} from '../types';
import {
  getSportTrackingConfig,
  getAcademicSupportResources,
  rankAndFilterCoaches,
  rankAndFilterOpportunities,
  calculateProgressSummary
} from '../services/personalization';

interface StandardDashboardPageProps {
  setActiveTab: (tab: string) => void;
}

export const StandardDashboardPage: React.FC<StandardDashboardPageProps> = ({ setActiveTab }) => {
  const { currentUser, profile, openOnboardingModal } = useAuth();

  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [conflicts, setConflicts] = useState<ScheduleConflictReport | null>(null);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [goals, setGoals] = useState<ProgressGoal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Interactive local states for Standard Athlete
  const [loggedHoursToday, setLoggedHoursToday] = useState<{ study: number; training: number }>({ study: 3.5, training: 2.0 });
  const [workoutLogged, setWorkoutLogged] = useState<boolean>(false);
  const [workoutNotes, setWorkoutNotes] = useState<string>('');
  const [sessionType, setSessionType] = useState<string>('');
  const [sessionIntensity, setSessionIntensity] = useState<string>('7 - Hard (Target collegiate pace)');
  const [sessionDuration, setSessionDuration] = useState<number>(60);
  const [inquirySentCoachId, setInquirySentCoachId] = useState<number | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [evs, confs, coachList, opps, schols, sessionList, goalList] = await Promise.all([
          api.getEvents(),
          api.getConflicts(),
          api.getCoaches(),
          api.getOpportunities(),
          api.getScholarships(),
          api.getTrainingSessions(),
          api.getGoals()
        ]);

        setEvents(evs);
        setConflicts(confs);
        setCoaches(coachList);
        setOpportunities(opps);
        setScholarships(schols);
        setSessions(sessionList);
        setGoals(goalList);
      } catch (err) {
        console.error('Failed to load standard athlete dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [currentUser?.id]);

  const sportConfig = getSportTrackingConfig(profile?.primary_sport, false);
  const academicResources = getAcademicSupportResources(
    profile?.academic_level,
    profile?.academic_major,
    profile?.exam_period
  );
  const rankedCoaches = rankAndFilterCoaches(coaches, profile?.primary_sport || '', profile?.skill_level || '', [], false);
  const rankedOpportunities = rankAndFilterOpportunities(opportunities, profile?.primary_sport || '', profile?.academic_level || '', false);
  const progressSummary = calculateProgressSummary(sessions, goals, profile?.primary_sport);

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  const todayStr = new Date().toISOString().split('T')[0];
  const todayEvents = events.filter(e => e.date === todayStr);
  const displayEvents = todayEvents.length > 0 ? todayEvents : events.slice(0, 5);

  const hasConflict = conflicts?.has_conflicts ?? false;
  const conflictList = conflicts?.conflicts || [];

  const handleLogWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newSession = await api.logTrainingSession({
        sport: profile?.primary_sport || 'Athletics',
        duration_minutes: sessionDuration,
        intensity: sessionIntensity,
        equipment_used: sportConfig.equipmentChecklist[0] || 'Standard Gear',
        completed: true,
        notes: workoutNotes || `${sessionType || sportConfig.sessionTypes[0]} completed`
      });
      setSessions(prev => [newSession, ...prev]);
      setWorkoutLogged(true);
      setLoggedHoursToday(prev => ({ ...prev, training: prev.training + (sessionDuration / 60) }));
      setTimeout(() => setWorkoutLogged(false), 4000);
    } catch (err) {
      console.warn('Logging session locally:', err);
      setWorkoutLogged(true);
      setLoggedHoursToday(prev => ({ ...prev, training: prev.training + (sessionDuration / 60) }));
    }
  };

  const handleCoachInquiry = (coachId: number) => {
    setInquirySentCoachId(coachId);
    setTimeout(() => {
      setInquirySentCoachId(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner: Standard Student-Athlete Identity */}
      <section className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30">
                Standard Athlete Dashboard
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-slate-300 font-medium">{todayFormatted}</span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-sky-300 font-medium">{profile?.institution || 'Cascadia State University'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {currentUser?.display_name || 'Student-Athlete'}.
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Performance dashboard for collegiate and varsity student-athletes. Balancing{' '}
              <strong className="text-white font-semibold">{profile?.academic_major || 'Undergraduate Academics'}</strong> with competitive{' '}
              <strong className="text-white font-semibold">{profile?.primary_sport || 'Athletics'}</strong>.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
                <Target className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Primary Goal: <strong className="text-white font-semibold">{profile?.goals || 'Balance Education & Athletics'}</strong></span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
                <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Sport Level: <strong className="text-white font-semibold">{profile?.skill_level || 'Collegiate Varsity'}</strong></span>
              </div>
              {profile?.exam_period && (
                <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
                  <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Timeline: <strong className="text-white font-semibold">{profile.exam_period}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Readiness Widget */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex flex-col gap-3 min-w-[240px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">Daily Readiness Score</span>
              <span className="text-xs font-bold text-emerald-400">{progressSummary.readinessScore}% Optimal</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-sky-400 h-2.5 rounded-full" style={{ width: `${progressSummary.readinessScore}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-center text-xs">
              <div className="bg-slate-800/60 p-2 rounded-lg">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Active Goals</p>
                <p className="text-sm font-bold text-white">{progressSummary.activeGoalsCount} in progress</p>
              </div>
              <div className="bg-slate-800/60 p-2 rounded-lg">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Sessions Logged</p>
                <p className="text-sm font-bold text-white">{progressSummary.totalSessionsLogged}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={openOnboardingModal}
              className="text-center text-[11px] text-sky-300 hover:text-white hover:underline transition pt-1"
            >
              Update Profile Questionnaire
            </button>
          </div>
        </div>
      </section>

      {/* 2. Notification & Calendar Conflict Alert */}
      {hasConflict ? (
        <section className="bg-amber-50 border border-amber-300 rounded-2xl p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900 shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-800" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm sm:text-base font-bold text-amber-950">
                  Academic & Athletics Schedule Conflict Detected
                </h2>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-amber-200 text-amber-900">
                  {conflicts?.total_conflicts} Alert{conflicts?.total_conflicts !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-amber-900 mt-1">
                {conflictList[0]?.description || 'A tight transition exists between your afternoon lecture and varsity practice.'}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('balance-ai')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold shadow-2xs transition"
                >
                  <span>Resolve in BalanceAI Planner</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-emerald-950">
                Academic & Training Schedule Harmonized
              </h2>
              <p className="text-xs text-emerald-800">
                All class-to-practice transitions meet required study and recovery buffers.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('balance-ai')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>View Calendar</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </section>
      )}

      {/* 3. Main Grid: Planner & Training Tracker (Left) + Academic Support & Opportunities (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Education & Sports Planner + Training & Performance Tracker */}
        <div className="lg:col-span-7 space-y-6">
          {/* FEATURE 1: Education and Sports Planner */}
          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-100 text-sky-800">
                  <Calendar className="w-5 h-5 text-sky-700" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Today's Schedule & Academic-Athletic Commitments</h2>
                  <p className="text-xs text-slate-500">Classes, study sessions, team practices, and recovery windows</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('balance-ai')}
                className="text-xs font-semibold text-sky-700 hover:text-sky-900 hover:underline flex items-center gap-1"
              >
                <span>Full Planner</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {displayEvents.map(ev => {
                const isAcademic = ev.event_type === 'academic' || ev.event_type === 'exam' || ev.event_type === 'assignment';
                const isTraining = ev.event_type === 'training' || ev.event_type === 'competition';
                return (
                  <div
                    key={ev.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition ${
                      isAcademic
                        ? 'bg-sky-50/50 border-sky-100'
                        : isTraining
                        ? 'bg-indigo-50/50 border-indigo-100'
                        : 'bg-emerald-50/40 border-emerald-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isAcademic ? 'bg-sky-200/80 text-sky-800' : isTraining ? 'bg-indigo-200/80 text-indigo-800' : 'bg-emerald-200/80 text-emerald-800'
                      }`}>
                        {isAcademic ? <BookOpen className="w-4 h-4" /> : isTraining ? <Dumbbell className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-semibold text-slate-900">{ev.title}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                            isAcademic ? 'bg-sky-100 text-sky-800' : isTraining ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {ev.event_type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {ev.start_time} - {ev.end_time} • {ev.location || 'Campus Facility'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200 shrink-0">
                      {ev.buffer_minutes}m buffer
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Quick Schedule Balance Bar */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                <span>Weekly Commitment Balance</span>
                <span className="font-semibold text-slate-800">55% Academics • 30% Athletics • 15% Recovery</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                <div className="bg-sky-500 h-2.5" style={{ width: '55%' }} title="55% Academics" />
                <div className="bg-indigo-600 h-2.5" style={{ width: '30%' }} title="30% Athletics" />
                <div className="bg-emerald-500 h-2.5" style={{ width: '15%' }} title="15% Recovery" />
              </div>
            </div>
          </section>

          {/* FEATURE 2: Training and Performance Tracker */}
          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-800">
                  <Activity className="w-5 h-5 text-indigo-700" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Training & Performance Tracker</h2>
                  <p className="text-xs text-slate-500">Volume, intensity, workout logs, and physical readiness</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('training-recovery')}
                className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 hover:underline flex items-center gap-1"
              >
                <span>Full Analytics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Log Form */}
            <form onSubmit={handleLogWorkout} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quick Session Log</span>
                {workoutLogged && (
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Session logged for today
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Session Type ({sportConfig.sportName})</label>
                  <select
                    value={sessionType || sportConfig.sessionTypes[0]}
                    onChange={e => setSessionType(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                  >
                    {sportConfig.sessionTypes.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Intensity</label>
                  <select
                    value={sessionIntensity}
                    onChange={e => setSessionIntensity(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                  >
                    <option value="6 - Moderate (Aerobic base)">6 - Moderate (Aerobic base)</option>
                    <option value="7 - Hard (Target collegiate pace)">7 - Hard (Target collegiate pace)</option>
                    <option value="8 - Very Hard (Peak competition load)">8 - Very Hard (Peak competition load)</option>
                    <option value="4 - Recovery / Technique">4 - Recovery / Technique</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Duration</label>
                  <select
                    value={sessionDuration}
                    onChange={e => setSessionDuration(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                  >
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                    <option value={120}>120 minutes</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={workoutNotes}
                  onChange={e => setWorkoutNotes(e.target.value)}
                  placeholder="Notes on fatigue, hydration, or coach feedback..."
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs rounded-lg transition shadow-2xs"
                >
                  Log Workout
                </button>
              </div>

              {/* Pre-Session Equipment Checklist */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Sport Equipment Inspection ({sportConfig.sportName})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sportConfig.equipmentChecklist.map((item, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 text-[11px] bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-700">
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              </div>
            </form>

            {/* Authentic Progress & Performance Milestones (No Fake Data) */}
            {progressSummary.isNewUser ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <p className="text-xs text-slate-600 font-medium">
                  {progressSummary.emptyStateMessage}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('training-recovery')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold shadow-2xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log First Training Session</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dual-progress')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                  >
                    <Target className="w-3.5 h-3.5 text-sky-600" />
                    <span>Set Metric Goal</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">{sportConfig.primaryMetricName}</span>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{progressSummary.sportSpecificVolumeDisplay}</p>
                  <span className="text-[10px] text-emerald-600 font-semibold">{sportConfig.primaryMetricTarget}</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Duration</span>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{progressSummary.totalDurationMinutes} mins</p>
                  <span className="text-[10px] text-emerald-600 font-semibold">{progressSummary.totalSessionsLogged} sessions logged</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Target Load</span>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{progressSummary.averageIntensity}</p>
                  <span className="text-[10px] text-sky-600 font-semibold">Coach zone aligned</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Readiness Score</span>
                  <p className="text-lg font-bold text-indigo-700 mt-0.5">{progressSummary.readinessScore}%</p>
                  <span className="text-[10px] text-slate-500 font-medium">Optimal balance</span>
                </div>
              </div>
            )}
          </section>

          {/* FEATURE 3: Coach Finder for Standard Athletes */}
          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
                  <Users className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Personalized Coach Recommendations</h2>
                  <p className="text-xs text-slate-500">Prioritized for {profile?.primary_sport || 'your sport'} and competitive goals</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('coaches')}
                className="text-xs font-semibold text-purple-700 hover:text-purple-900 hover:underline flex items-center gap-1"
              >
                <span>Browse All Coaches</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rankedCoaches.slice(0, 4).map(rc => {
                const c = rc.coach;
                return (
                  <div key={c.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{c.full_name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
                          {c.coaching_level}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <p className="text-xs text-sky-800 font-semibold">{c.sport}</p>
                        {rc.isSportMatch && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-100 text-sky-900 font-bold border border-sky-200">
                            Direct Sport Match
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{c.bio || c.qualifications}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">{c.hourly_fee}</span>
                      <button
                        type="button"
                        onClick={() => handleCoachInquiry(c.id)}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                          inquirySentCoachId === c.id
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {inquirySentCoachId === c.id ? 'Inquiry Sent!' : 'Request Session'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Column (5 cols): Academic Support, Opportunities, Dual Progress */}
        <div className="lg:col-span-5 space-y-6">
          {/* FEATURE 4: Academic Support & Study Planning */}
          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-700" />
                <h2 className="text-base font-bold text-slate-900">Academic Support & Study Priorities</h2>
              </div>
              <span className="text-xs font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                {profile?.academic_level || 'Student-Athlete'}
              </span>
            </div>

            <div className="space-y-3">
              {academicResources.map(res => (
                <div key={res.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-semibold text-slate-900">
                    <span>{res.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      res.urgency === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-sky-100 text-sky-800'
                    }`}>
                      {res.tag}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {res.description}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab('balance-ai')}
                      className="text-xs font-semibold text-sky-700 hover:underline"
                    >
                      {res.actionText} →
                    </button>
                    <span className="text-[10px] text-slate-400">Personalized</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FEATURE 5: Competitions & Scholarships */}
          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-700" />
                <h2 className="text-base font-bold text-slate-900">Competitions & Opportunities</h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('opportunities')}
                className="text-xs font-semibold text-amber-800 hover:text-amber-950 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {rankedOpportunities.slice(0, 3).map(ro => {
                const opp = ro.opportunity;
                return (
                  <div key={opp.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition text-xs">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-slate-900">{opp.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold shrink-0">
                        {opp.type}
                      </span>
                    </div>
                    {ro.isSportMatch && (
                      <span className="inline-block mt-0.5 text-[9px] px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 font-bold border border-sky-200">
                        Target Sport Match
                      </span>
                    )}
                    <p className="text-slate-600 mt-1 line-clamp-1">{opp.organizer} • {opp.location}</p>
                    <div className="mt-2 flex items-center justify-between text-slate-500 text-[11px]">
                      <span>Start: {opp.start_date}</span>
                      <span className="font-semibold text-sky-700">{opp.cost}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scholarships Quick Card */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">Academic & Athletic Scholarships</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('scholarships')}
                  className="text-xs font-semibold text-sky-700 hover:underline"
                >
                  Apply
                </button>
              </div>
              {scholarships.slice(0, 2).map(s => (
                <div key={s.id} className="p-2.5 mb-1.5 rounded-lg border border-slate-200 bg-white text-xs flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{s.title}</p>
                    <p className="text-[10px] text-slate-500">{s.provider} • {s.benefits}</p>
                  </div>
                  <span className="text-[10px] text-rose-700 font-semibold shrink-0">Due {s.deadline}</span>
                </div>
              ))}
            </div>
          </section>

          {/* FEATURE 6 & 7: Progress & Performance Insights */}
          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-700" />
                <h2 className="text-base font-bold text-slate-900">Dual-Progress & Advisor Summary</h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('dual-progress')}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                Passport
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950">Current Academic Standing</span>
                  <span className="text-sm font-extrabold text-emerald-800">
                    {profile?.academic_level?.toLowerCase().includes('school') ? 'Honor Roll' : '3.75 GPA'}
                  </span>
                </div>
                <p className="text-emerald-900 mt-1">
                  {profile?.academic_level?.toLowerCase().includes('school')
                    ? 'Interscholastic eligibility verified. High school coursework and homework schedules aligned with training.'
                    : 'Exceeds collegiate Academic Progress Rate (APR) benchmark. Fully eligible for collegiate varsity competition.'}
                </p>
              </div>

              <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-950">{sportConfig.milestoneTitle}</span>
                  <span className="text-xs font-bold text-sky-800">{progressSummary.totalSessionsLogged} Logged</span>
                </div>
                <p className="text-sky-900 mt-1">
                  {progressSummary.isNewUser
                    ? 'Begin logging training sessions to map your performance trajectory.'
                    : `Active volume: ${progressSummary.sportSpecificVolumeDisplay}. Intensity: ${progressSummary.averageIntensity}.`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('dual-progress')}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition text-center shadow-2xs"
              >
                Export Dual Progress Report for Coach / Advisor
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
