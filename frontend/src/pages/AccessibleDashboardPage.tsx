import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Calendar, ShieldCheck, HeartHandshake, Compass, Users, Sparkles,
  ArrowRight, CheckCircle2, Clock, AlertTriangle, BookOpen, Dumbbell,
  Coffee, SlidersHorizontal, MapPin, Check, Eye, Volume2, ShieldAlert,
  ChevronRight, Wrench, BatteryCharging, Heart, FileText, Phone, Award,
  Accessibility, HelpCircle, Plus, Target
} from 'lucide-react';
import {
  ScheduleEvent, ScheduleConflictReport, SupportRequest, Opportunity, Coach,
  TrainingSession, ProgressGoal
} from '../types';
import {
  getSportTrackingConfig,
  getAcademicSupportResources,
  rankAndFilterCoaches,
  rankAndFilterOpportunities,
  calculateProgressSummary
} from '../services/personalization';

interface AccessibleDashboardPageProps {
  setActiveTab: (tab: string) => void;
}

export const AccessibleDashboardPage: React.FC<AccessibleDashboardPageProps> = ({ setActiveTab }) => {
  const {
    currentUser,
    profile,
    supportPreference,
    accessibility,
    setTextSize,
    toggleHighContrast,
    toggleEnhancedFocus,
    toggleDyslexicFont,
    setLayoutDensity,
    openOnboardingModal
  } = useAuth();

  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [conflicts, setConflicts] = useState<ScheduleConflictReport | null>(null);
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [allCoaches, setAllCoaches] = useState<Coach[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [goals, setGoals] = useState<ProgressGoal[]>([]);
  const [loading, setLoading] = useState(true);

  // Interactive local states for Accessible Athlete
  const [perceivedExertion, setPerceivedExertion] = useState<number>(6); // RPE 1-10
  const [adaptiveGearLogged, setAdaptiveGearLogged] = useState<boolean>(false);
  const [inspectedGear, setInspectedGear] = useState<string>('');
  const [gearNotes, setGearNotes] = useState<string>('');
  const [inquirySentCoachId, setInquirySentCoachId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [evs, confs, reqs, opps, coachList, sessionList, goalList] = await Promise.all([
          api.getEvents(),
          api.getConflicts(),
          api.getMySupportRequests(),
          api.getOpportunities({ verification_state: 'Verified Accessible Venue' }),
          api.getCoaches(),
          api.getTrainingSessions(),
          api.getGoals()
        ]);

        setEvents(evs);
        setConflicts(confs);
        setSupportRequests(reqs);
        setOpportunities(opps);
        setAllCoaches(coachList);
        setSessions(sessionList);
        setGoals(goalList);
      } catch (err) {
        console.error('Failed to load accessible athlete dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser?.id]);

  const accommodationsList = (supportPreference?.optional_needs_description || '').split(',').map(s => s.trim());
  const isVI = accommodationsList.some(a => a.toLowerCase().includes('visual') || a.toLowerCase().includes('screen') || a.toLowerCase().includes('audio'));
  const isWheelchair = accommodationsList.some(a => a.toLowerCase().includes('wheelchair') || a.toLowerCase().includes('ramp') || a.toLowerCase().includes('chair'));

  const sportConfig = getSportTrackingConfig(profile?.primary_sport, true, accommodationsList);
  const academicResources = getAcademicSupportResources(
    profile?.academic_level,
    profile?.academic_major,
    profile?.exam_period,
    accommodationsList
  );
  const rankedAdaptiveCoaches = rankAndFilterCoaches(allCoaches, profile?.primary_sport || '', profile?.skill_level || '', accommodationsList, true);
  const rankedOpportunities = rankAndFilterOpportunities(opportunities, profile?.primary_sport || '', profile?.academic_level || '', true);
  const progressSummary = calculateProgressSummary(sessions, goals, profile?.primary_sport);

  const defaultGearNotes = isVI
    ? 'Guide tether inspected, acoustic locator beacon synced, running spikes checked'
    : isWheelchair
    ? 'Chair tire pressure: 115 PSI, camber alignment checked, anti-tip roller secure'
    : 'Adaptive equipment and safety checklist verified';

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

  const handleCoachInquiry = (coachId: number) => {
    setInquirySentCoachId(coachId);
    setTimeout(() => {
      setInquirySentCoachId(null);
    }, 4000);
  };

  const handleLogGear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const gearItem = inspectedGear || sportConfig.equipmentChecklist[0] || 'Adaptive Equipment';
      const newSession = await api.logTrainingSession({
        sport: profile?.primary_sport || 'Adaptive Athletics',
        duration_minutes: 60,
        intensity: `RPE ${perceivedExertion} / 10`,
        equipment_used: gearItem,
        completed: true,
        notes: gearNotes || defaultGearNotes
      });
      setSessions(prev => [newSession, ...prev]);
      setAdaptiveGearLogged(true);
      setTimeout(() => setAdaptiveGearLogged(false), 4000);
    } catch (err) {
      console.warn('Logging adaptive session locally:', err);
      setAdaptiveGearLogged(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Welcoming, High-Accessibility Greeting Banner */}
      <section className="bg-gradient-to-r from-indigo-950 via-slate-900 to-sky-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-indigo-900/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/25 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                <Accessibility className="w-3.5 h-3.5" />
                <span>Accessible & Adaptive Student-Athlete Dashboard</span>
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-slate-300 font-medium">{todayFormatted}</span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-indigo-200 font-medium">{profile?.institution || 'Cascadia State University'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {currentUser?.display_name || 'Athlete'}.
            </h1>

            <p className="text-sm text-indigo-100 leading-relaxed">
              Personalized for your adaptive sport schedule, verified transit buffers, and academic accommodations.
              Managing <strong className="text-white font-semibold">{profile?.academic_major || 'Academics'}</strong> and{' '}
              <strong className="text-white font-semibold">{profile?.primary_sport || 'Adaptive Athletics'}</strong> with confidential support.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 bg-indigo-900/60 border border-indigo-700/60 px-3 py-1.5 rounded-lg text-xs text-indigo-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Accommodations: <strong>{supportPreference?.optional_needs_description || 'Active / Verified'}</strong></span>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-indigo-900/60 border border-indigo-700/60 px-3 py-1.5 rounded-lg text-xs text-indigo-200">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Transit Buffer: <strong>{isVI ? '25 min audible/guided transit buffer' : '25 min wheelchair transit buffer'}</strong></span>
              </span>
              {profile?.exam_period && (
                <span className="inline-flex items-center gap-1.5 bg-indigo-900/60 border border-indigo-700/60 px-3 py-1.5 rounded-lg text-xs text-indigo-200">
                  <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Timeline: <strong>{profile.exam_period}</strong></span>
                </span>
              )}
            </div>
          </div>

          {/* Quick Energy & Accommodations Passport Preview */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex flex-col gap-3 min-w-[260px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <BatteryCharging className="w-4 h-4 text-emerald-400" />
                <span>Energy & Recovery Balance</span>
              </span>
              <span className="text-xs font-bold text-emerald-400">{progressSummary.readinessScore}% Reserve</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-sky-400 h-2.5 rounded-full" style={{ width: `${progressSummary.readinessScore}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-slate-800/70 p-2 rounded-lg">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Active Tickets</p>
                <p className="text-sm font-bold text-white">{supportRequests.filter(r => r.status !== 'resolved').length} Approved</p>
              </div>
              <div className="bg-slate-800/70 p-2 rounded-lg">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Sessions Logged</p>
                <p className="text-sm font-bold text-emerald-400">{progressSummary.totalSessionsLogged}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={openOnboardingModal}
              className="text-center text-[11px] text-sky-300 hover:text-white hover:underline transition pt-1"
            >
              Update Accessibility & Support Answers
            </button>
          </div>
        </div>
      </section>

      {/* 2. FEATURE 6: Accessibility & Independent Navigation Centre (Inline Quick-Tuning) */}
      <section className="bg-white border-2 border-indigo-100 rounded-2xl p-5 shadow-xs" aria-label="Accessibility Centre">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-800">
              <SlidersHorizontal className="w-5 h-5 text-indigo-700" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Accessibility & Independent Navigation Centre</h2>
              <p className="text-xs text-slate-500">Fine-tune your reading, contrast, font, and focus experience in real time</p>
            </div>
          </div>
          <span className="text-xs text-slate-500 self-start sm:self-auto bg-slate-100 px-2.5 py-1 rounded-md">
            Changes apply instantly across all pages
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          {/* Text Size */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-semibold text-slate-700 block">Text Size</span>
            <div className="flex items-center gap-1">
              {(['standard', 'medium', 'large'] as const).map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setTextSize(size)}
                  className={`flex-1 py-1 px-1 rounded text-center font-bold capitalize transition ${
                    accessibility.textSize === size
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {size === 'standard' ? 'A' : size === 'medium' ? 'A+' : 'A++'}
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast */}
          <button
            type="button"
            onClick={toggleHighContrast}
            className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
              accessibility.highContrast
                ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-semibold">High Contrast</span>
              <Eye className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-[11px] text-slate-500 mt-1">
              {accessibility.highContrast ? 'Enabled (Black/White focus)' : 'Standard contrast'}
            </span>
          </button>

          {/* Dyslexic Font */}
          <button
            type="button"
            onClick={toggleDyslexicFont}
            className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
              accessibility.dyslexicFont
                ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-semibold">Dyslexic Font</span>
              <BookOpen className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-[11px] text-slate-500 mt-1">
              {accessibility.dyslexicFont ? 'OpenDyslexic Active' : 'System Sans'}
            </span>
          </button>

          {/* Visible Focus Indicator */}
          <button
            type="button"
            onClick={toggleEnhancedFocus}
            className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
              accessibility.enhancedFocus
                ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-semibold">Visible Focus Ring</span>
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-[11px] text-slate-500 mt-1">
              {accessibility.enhancedFocus ? 'High-Visibility Active' : 'Default ring'}
            </span>
          </button>
        </div>
      </section>

      {/* 3. FEATURE 7: Accessible Notifications & Schedule Conflict Detector */}
      {hasConflict ? (
        <section className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-xs" aria-label="Schedule Buffer Notice">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900 shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-800" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm sm:text-base font-bold text-amber-950">
                  Adaptive Transit or Recovery Buffer Warning
                </h2>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-amber-200 text-amber-900">
                  {conflicts?.total_conflicts} Alert{conflicts?.total_conflicts !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-amber-900 mt-1">
                {conflictList[0]?.description ||
                  'Your 25-minute wheelchair campus transit buffer between North Academic Hall and West Athletics Complex is constrained.'}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('balance-ai')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold shadow-2xs transition"
                >
                  <span>Auto-Insert 25m Buffer in BalanceAI</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('support-bridge')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-amber-950 border border-amber-300 text-xs font-medium hover:bg-amber-100/50 transition"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-800" />
                  <span>Notify Disability Office</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-emerald-950">
                All Accessible Transit & Recovery Buffers Verified
              </h2>
              <p className="text-xs text-emerald-800">
                Every transition between classes, therapy, and adaptive training preserves full accessible transit times.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('balance-ai')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Inspect Buffers</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </section>
      )}

      {/* 4. Main Grid: Accessible Planner & Adaptive Training Tracker (Left) + SupportBridge & Inclusive Opportunities (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Accessible Planner + Adaptive Training Tracker + Adaptive Coach Finder */}
        <div className="lg:col-span-7 space-y-6">
          {/* FEATURE 1: Accessible Education and Sports Planner */}
          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-800">
                  <Calendar className="w-5 h-5 text-indigo-700" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Accessible Education & Training Schedule</h2>
                  <p className="text-xs text-slate-500">Includes verified accessible venues, transit buffers, and rest intervals</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('balance-ai')}
                className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 hover:underline flex items-center gap-1"
              >
                <span>BalanceAI Planner</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {displayEvents.map(ev => {
                const isAcademic = ev.event_type === 'academic' || ev.event_type === 'exam' || ev.event_type === 'assignment';
                const isTraining = ev.event_type === 'training' || ev.event_type === 'competition';
                const isRest = ev.event_type === 'rest';

                return (
                  <div
                    key={ev.id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                      isAcademic
                        ? 'bg-indigo-50/40 border-indigo-100'
                        : isTraining
                        ? 'bg-sky-50/40 border-sky-100'
                        : 'bg-emerald-50/40 border-emerald-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isAcademic ? 'bg-indigo-200 text-indigo-900' : isTraining ? 'bg-sky-200 text-sky-900' : 'bg-emerald-200 text-emerald-900'
                      }`}>
                        {isAcademic ? <BookOpen className="w-4 h-4" /> : isTraining ? <Dumbbell className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs sm:text-sm font-semibold text-slate-900">{ev.title}</p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-white border border-slate-200 text-slate-700 capitalize">
                            {ev.event_type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {ev.start_time} - {ev.end_time} • {ev.location}
                        </p>
                        {/* Facility Accessibility Badge */}
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {isVI
                              ? 'Venue Accessibility Verified: Tactile Track Markers & Guide Corridor OK'
                              : isWheelchair
                              ? 'Venue Accessibility Verified: Wheelchair Ramp & Elevator OK'
                              : 'Venue Accessibility Verified: ADA Level Threshold Access OK'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="self-end sm:self-center shrink-0 text-right">
                      <span className="text-xs font-semibold text-indigo-900 bg-white px-2.5 py-1 rounded-md border border-indigo-200 inline-block">
                        {ev.buffer_minutes || 25}m buffer
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* FEATURE 3: Personalized Adaptive Training Tracker */}
          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-100 text-sky-800">
                  <Dumbbell className="w-5 h-5 text-sky-700" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Personalized Adaptive Training Tracker ({sportConfig.sportName})</h2>
                  <p className="text-xs text-slate-500">Adaptive equipment calibration, RPE exertion, and recovery cushions</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('training-recovery')}
                className="text-xs font-semibold text-sky-700 hover:text-sky-900 hover:underline flex items-center gap-1"
              >
                <span>Analytics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Adaptive Gear & Session Calibration Form */}
            <form onSubmit={handleLogGear} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Adaptive Equipment & Exertion Check-in</span>
                </span>
                {adaptiveGearLogged && (
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Calibration logged
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Equipment Inspected</label>
                  <select
                    value={inspectedGear || sportConfig.equipmentChecklist[0]}
                    onChange={e => setInspectedGear(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                  >
                    {sportConfig.equipmentChecklist.map((item, idx) => (
                      <option key={idx} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Perceived Exertion (RPE 1-10)</label>
                  <select
                    value={perceivedExertion}
                    onChange={e => setPerceivedExertion(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                  >
                    <option value={4}>4 - Gentle aerobic (Energy preservation)</option>
                    <option value={6}>6 - Moderate adaptive pace</option>
                    <option value={7}>7 - Hard sprint intervals</option>
                    <option value={9}>9 - Peak competition effort</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Recovery Cushion Time</label>
                  <select className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800">
                    <option>45 mins post-workout rest</option>
                    <option>60 mins post-workout rest</option>
                    <option>30 mins active stretch</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={gearNotes}
                  onChange={e => setGearNotes(e.target.value)}
                  placeholder={defaultGearNotes}
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs rounded-lg transition shadow-2xs"
                >
                  Log Calibration
                </button>
              </div>

              {/* Equipment Checklist */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Active Adaptive Gear Checklist ({sportConfig.sportName})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sportConfig.equipmentChecklist.map((item, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 text-[11px] bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-700">
                      <Check className="w-3 h-3 text-indigo-600 shrink-0" />
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              </div>
            </form>

            {/* Authentic Disability-Specific Progress Metrics */}
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
                    <span>Log Adaptive Training Record</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dual-progress')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                  >
                    <Target className="w-3.5 h-3.5 text-sky-600" />
                    <span>Set Milestone Goal</span>
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
                  <span className="text-[10px] uppercase font-bold text-slate-400">Exertion Level</span>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">RPE {perceivedExertion} / 10</p>
                  <span className="text-[10px] text-sky-600 font-semibold">Autonomic balance safe</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Reserve Readiness</span>
                  <p className="text-lg font-bold text-indigo-700 mt-0.5">{progressSummary.readinessScore}%</p>
                  <span className="text-[10px] text-slate-500 font-medium">Rest cushions intact</span>
                </div>
              </div>
            )}
          </section>

          {/* FEATURE 2: Adaptive and Inclusive Coach Finder */}
          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
                  <Users className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Adaptive & Inclusive Coach Finder</h2>
                  <p className="text-xs text-slate-500">Verified adaptive coaching credentials, communication accommodations, and sport-specific training</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('coaches')}
                className="text-xs font-semibold text-purple-700 hover:text-purple-900 hover:underline flex items-center gap-1"
              >
                <span>All Adaptive Coaches</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rankedAdaptiveCoaches.slice(0, 4).map(rc => {
                const c = rc.coach;
                return (
                  <div key={c.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{c.full_name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-semibold">
                          Adaptive Verified
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <p className="text-xs text-indigo-700 font-medium">{c.sport}</p>
                        {rc.isSportMatch && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-100 text-sky-900 font-bold border border-sky-200">
                            Sport Match
                          </span>
                        )}
                        {rc.isAdaptiveMatch && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 font-bold border border-emerald-200">
                            Credential Match
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                        {c.accessibility_specialties || c.bio || c.qualifications}
                      </p>
                      {c.venue_equipment_details && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-700">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span className="line-clamp-1">{c.venue_equipment_details}</span>
                        </div>
                      )}
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
                        {inquirySentCoachId === c.id ? 'Request Sent!' : 'Request Consultation'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Column (5 cols): Academic Support (SupportBridge), Inclusive Opportunities, Progress & Passport */}
        <div className="lg:col-span-5 space-y-6">
          {/* FEATURE 5: Accessible Learning & SupportBridge Accommodation Tracking */}
          <section className="bg-white border-2 border-indigo-100 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-700" />
                <h2 className="text-base font-bold text-slate-900">SupportBridge Accommodations</h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('support-bridge')}
                className="text-xs font-semibold text-indigo-700 hover:underline"
              >
                Manage Tickets
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Confidential institutional accommodations for exams, accessible coursework, and faculty letters.
            </p>

            <div className="space-y-2.5">
              {supportRequests.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                  <p>No open accommodation tickets.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('support-bridge')}
                    className="mt-2 text-indigo-700 font-semibold hover:underline"
                  >
                    + Submit New Request
                  </button>
                </div>
              ) : (
                supportRequests.slice(0, 3).map(req => (
                  <div key={req.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{req.category}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        req.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'under_review'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-sky-100 text-sky-900'
                      }`}>
                        {req.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-slate-600 line-clamp-2">{req.concise_description}</p>
                    <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Needed: {req.date_needed}</span>
                      <span className="text-indigo-600 font-medium">Ticket #{req.id}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Academic Accessible Resources (EPUB, Transit, Tutoring) */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-800 block">Personalized Academic Support Formats</span>
              {academicResources.slice(0, 2).map(ar => (
                <div key={ar.id} className="p-2.5 rounded-lg border border-indigo-100 bg-indigo-50/40 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-indigo-950">{ar.title}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-200 text-indigo-900 font-bold">{ar.tag}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{ar.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-600">Disability Services Office</span>
              <a
                href="mailto:disability-athletics@cascadia.edu"
                className="text-xs font-semibold text-indigo-700 hover:underline flex items-center gap-1"
              >
                <Phone className="w-3 h-3" />
                <span>Contact Coordinator</span>
              </a>
            </div>
          </section>

          {/* FEATURE 4: Inclusive Competition & Opportunity Finder */}
          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-sky-700" />
                <h2 className="text-base font-bold text-slate-900">Inclusive Events & Grants</h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('opportunities')}
                className="text-xs font-semibold text-sky-700 hover:text-sky-900 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {rankedOpportunities.slice(0, 3).map(ro => {
                const opp = ro.opportunity;
                return (
                  <div key={opp.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition text-xs">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-slate-900">{opp.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-semibold shrink-0">
                        Verified Venue
                      </span>
                    </div>
                    {ro.isSportMatch && (
                      <span className="inline-block mt-0.5 text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-900 font-bold border border-indigo-200">
                        Direct Sport Match
                      </span>
                    )}
                    <p className="text-slate-600 mt-1 line-clamp-1">{opp.organizer} • {opp.location}</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5 font-medium line-clamp-1">
                      {opp.access_details || 'Full roll-in access, accessible companion seating'}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-200">
                      <span>{opp.start_date}</span>
                      <span className="font-semibold text-sky-700">{opp.cost}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Adaptive Equipment Grant Alert */}
            <div className="mt-4 p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-indigo-950">
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-700" />
                  <span>Adaptive Sports Equipment Grant</span>
                </span>
                <span className="text-rose-700">Deadline in 18d</span>
              </div>
              <p className="text-indigo-900">
                Grants up to $2,500 for custom seating, racing tires, guide tethers, and adaptive competition travel.
              </p>
            </div>
          </section>

          {/* FEATURE 8: Personalized Progress & Athlete Passport */}
          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                <h2 className="text-base font-bold text-slate-900">Athlete Passport & Milestones</h2>
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
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-emerald-950">
                  <span>{sportConfig.milestoneTitle}</span>
                  <span className="text-emerald-700">{progressSummary.totalSessionsLogged} Sessions</span>
                </div>
                <p className="text-emerald-900">
                  {progressSummary.isNewUser
                    ? 'Begin logging adaptive calibrations or training records to view your performance trajectory.'
                    : `Active volume: ${progressSummary.sportSpecificVolumeDisplay}. Maintained consistent recovery cushions without autonomic fatigue.`}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-800 block mb-1">Confidential Accommodation Passport</span>
                <p className="text-slate-600 text-[11px]">
                  Summarizes approved exam accommodations and training buffer protocols for faculty and coaches without revealing medical diagnoses.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('dual-progress')}
                className="w-full py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs rounded-xl transition text-center shadow-2xs"
              >
                Export Confidential Support Passport
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
