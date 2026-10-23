import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Calendar, ShieldAlert, Award, Compass, Users, Sparkles,
  ArrowRight, CheckCircle2, Clock, AlertTriangle, BookOpen,
  Dumbbell, Coffee, FileText, ChevronRight, SlidersHorizontal,
  MapPin, Check
} from 'lucide-react';
import {
  ScheduleEvent, ScheduleConflictReport, SupportRequest, Opportunity
} from '../types';

interface OverviewPageProps {
  setActiveTab: (tab: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ setActiveTab }) => {
  const {
    currentUser,
    activeRole,
    profile,
    supportPreference,
    accessibility,
    perspective,
    switchPerspective,
    openOnboardingModal
  } = useAuth();
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [conflicts, setConflicts] = useState<ScheduleConflictReport | null>(null);
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (activeRole === 'staff') {
          const [evs, confs, queue] = await Promise.all([
            api.getEvents(),
            api.getConflicts(),
            api.getStaffSupportQueue()
          ]);
          setEvents(evs);
          setConflicts(confs);
          setSupportRequests(queue);
        } else {
          const [evs, confs, reqs, opps] = await Promise.all([
            api.getEvents(),
            api.getConflicts(),
            api.getMySupportRequests(),
            api.getOpportunities({ verification_state: 'Verified Accessible Venue' })
          ]);
          setEvents(evs);
          setConflicts(confs);
          setSupportRequests(reqs);
          setOpportunities(opps);
        }
      } catch (err) {
        console.error('Failed to load overview data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser?.id, activeRole]);

  // Determine today's date in local ISO format (e.g. YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  // Filter events for today (or fallback to first batch of sorted events)
  const todayEvents = events.filter(e => e.date === todayStr);
  const displayEvents = todayEvents.length > 0 ? todayEvents : events.slice(0, 5);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'academic':
      case 'exam':
      case 'assignment':
        return <BookOpen className="w-4 h-4 text-sky-700" />;
      case 'training':
      case 'competition':
        return <Dumbbell className="w-4 h-4 text-indigo-700" />;
      case 'rest':
        return <Coffee className="w-4 h-4 text-emerald-700" />;
      default:
        return <Clock className="w-4 h-4 text-slate-700" />;
    }
  };

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  // Check if Jordan or active athlete has an active conflict
  const hasConflict = conflicts?.has_conflicts ?? false;
  const conflictList = conflicts?.conflicts || [];

  return (
    <div className="space-y-6">
      {/* 1. Calm, Human-Centered Greeting & Context */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-sky-800 uppercase tracking-wider">
                {todayFormatted}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">
                {profile?.institution || 'Cascadia State University'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Good morning, {currentUser?.display_name || 'Athlete'}.
            </h2>

            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              {activeRole === 'staff'
                ? 'Coordinator console: review student-athlete accommodation requests and athletic-academic calendar buffers.'
                : activeRole === 'coach'
                ? 'Coaching console: view student-athlete training readiness, travel windows, and academic exam periods.'
                : `Balancing ${profile?.academic_major || 'Academics'} and ${profile?.primary_sport || 'Collegiate Athletics'}. Here is your plan for today.`}
            </p>

            {/* Active Perspective Badge & Switcher */}
            {activeRole === 'athlete' && (
              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                  perspective === 'accessible'
                    ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                    : 'bg-sky-50 text-sky-900 border-sky-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${perspective === 'accessible' ? 'bg-indigo-600' : 'bg-sky-600'}`} />
                  <span>
                    {perspective === 'accessible'
                      ? 'Perspective B: Accessible & Adaptive Support Active'
                      : 'Perspective A: Standard Student-Athlete Track Active'}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() => switchPerspective(perspective === 'accessible' ? 'standard' : 'accessible')}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 underline transition"
                  title="Toggle between Perspective A and Perspective B to see how the platform adapts"
                >
                  Switch to {perspective === 'accessible' ? 'Track A (Standard)' : 'Track B (Accessible)'}
                </button>

                <span className="text-slate-300">•</span>

                <button
                  type="button"
                  onClick={openOnboardingModal}
                  className="text-xs font-semibold text-sky-700 hover:text-sky-900 hover:underline flex items-center gap-1"
                >
                  <span>Edit Questionnaire Answers</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200"
              title="All records are synthetic demo data for platform evaluation."
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Demo Persona: <strong className="capitalize">{activeRole}</strong></span>
            </span>

            <button
              type="button"
              onClick={() => setActiveTab('balance-ai')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-medium text-xs transition shadow-2xs focus-visible:ring-2 focus-visible:ring-sky-700"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Full Schedule</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. THE THREE QUESTIONS USER JOURNEY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT / MAIN COLUMN (7 cols): Question 1 & Question 2 */}
        <div className="lg:col-span-7 space-y-6">

          {/* QUESTION 2: IS THERE A CONFLICT BETWEEN MY STUDIES AND SPORTS? */}
          <section aria-labelledby="conflict-status-title">
            {hasConflict ? (
              <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-900 shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5 text-amber-800" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 id="conflict-status-title" className="text-sm sm:text-base font-bold text-amber-950">
                        Schedule Conflict Detected Today
                      </h3>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900">
                        {conflicts?.total_conflicts} issue{conflicts?.total_conflicts !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-amber-900 mt-1 leading-relaxed">
                      {conflictList[0]?.description ||
                        'A tight transition or overlapping buffer was detected between your classes and training.'}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-amber-200/70">
                      <button
                        type="button"
                        onClick={() => setActiveTab('balance-ai')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold shadow-2xs transition focus-visible:ring-2 focus-visible:ring-amber-950"
                      >
                        <span>Review Alternative Times</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('support-bridge')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white text-amber-950 border border-amber-300 text-xs font-medium transition focus-visible:ring-2 focus-visible:ring-amber-950"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-800" />
                        <span>Request Faculty Letter / Accommodation</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <h3 id="conflict-status-title" className="text-xs sm:text-sm font-bold text-emerald-950">
                      No Schedule Conflicts Today
                    </h3>
                    <p className="text-xs text-emerald-800">
                      All class-to-training transitions preserve required travel and prep buffers.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 hidden sm:inline">
                  Buffer Protected
                </span>
              </div>
            )}
          </section>

          {/* QUESTION 1: WHAT DO I NEED TO DO TODAY? */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-700" />
                <h3 className="font-bold text-slate-900 text-base">
                  Today's Schedule & Commitments
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('balance-ai')}
                className="text-xs font-medium text-sky-700 hover:text-sky-900 hover:underline flex items-center gap-1"
              >
                <span>View Full Week</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading today's agenda...</div>
            ) : displayEvents.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No commitments scheduled for today. Take time for recovery or study review.
              </div>
            ) : (
              <div className="space-y-3">
                {displayEvents.map((ev, index) => {
                  // Check if this specific event is in a conflict
                  const isConflictEvent = conflictList.some(
                    c => c.event_a_id === ev.id || c.event_b_id === ev.id
                  );

                  return (
                    <div
                      key={ev.id || index}
                      className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isConflictEvent
                          ? 'bg-amber-50/60 border-amber-300'
                          : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          {getEventIcon(ev.event_type)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900">{ev.title}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 capitalize">
                              {ev.event_type}
                            </span>
                            {ev.is_fixed ? (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-800">
                                Fixed
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200">
                                Flexible
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                            <span className="font-mono font-medium text-slate-800">
                              {ev.start_time} – {ev.end_time}
                            </span>
                            {ev.location && (
                              <span className="flex items-center gap-1 text-slate-600">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{ev.location}</span>
                              </span>
                            )}
                            {ev.buffer_minutes && (
                              <span className="text-[11px] text-slate-400">
                                ({ev.buffer_minutes}m buffer)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isConflictEvent && (
                        <div className="self-end sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => setActiveTab('balance-ai')}
                            className="px-2.5 py-1 rounded-md bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-2xs transition"
                          >
                            Resolve Slot
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN (5 cols): Question 3 - WHAT IS THE NEXT USEFUL ACTION I CAN TAKE? */}
        <div className="lg:col-span-5 space-y-6">

          {/* QUESTION 3: RECOMMENDED NEXT ACTIONS */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                Recommended Next Actions
              </h3>
              <span className="text-xs text-slate-400">Personalized</span>
            </div>

            <div className="space-y-3">
              {/* Perspective B Specific Actions */}
              {perspective === 'accessible' ? (
                <>
                  {/* Action 1: If conflict, direct action to resolve */}
                  {hasConflict && (
                    <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/50 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-amber-950">
                          1. Shift Flexible Weight Room Session
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200 text-amber-900">
                          Transit Alert
                        </span>
                      </div>
                      <p className="text-xs text-amber-900 leading-relaxed">
                        BalanceAI detected a 10m gap between Lab and Weight Room. Shift to 16:45 to preserve your 25m transit buffer safely.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('balance-ai')}
                        className="w-full mt-1 py-1.5 px-3 rounded-lg bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        <span>Review Conflict-Free Slots</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Action 2: Check SupportBridge Request */}
                  <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-indigo-950">
                        {hasConflict ? '2.' : '1.'} SupportBridge Accommodation Status
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900">
                        Confidential
                      </span>
                    </div>
                    <p className="text-xs text-indigo-900 leading-relaxed">
                      {supportRequests.length > 0
                        ? `Tracking: "${supportRequests[0].concise_description}" (Status: ${supportRequests[0].status.replace('_', ' ')})`
                        : 'Submit confidential exam rescheduling or facility accessibility requests directly to athletics compliance.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('support-bridge')}
                      className="w-full mt-1 py-1.5 px-3 rounded-lg border border-indigo-300 bg-white hover:bg-indigo-50 text-indigo-900 text-xs font-medium flex items-center justify-center gap-1.5 transition"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-indigo-700" />
                      <span>Open SupportBridge</span>
                    </button>
                  </div>

                  {/* Action 3: AccessMatch Opportunity */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {hasConflict ? '3.' : '2.'} AccessMatch Verified Venue
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900">
                        Verified Venue
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Pacific Invitational Track & Field (April 18). Verified ramp-accessible warm-up zones and equipment transport support.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('opportunities')}
                      className="w-full mt-1 py-1.5 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-medium flex items-center justify-center gap-1.5 transition"
                    >
                      <Compass className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Inspect Details & Eligibility</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Perspective A: Standard Student-Athlete Actions */
                <>
                  {/* Action 1: Academic Study & Exam Review */}
                  <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/50 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-sky-950">
                        1. Academic Exam & Study Window
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800">
                        Academics
                      </span>
                    </div>
                    <p className="text-xs text-sky-900 leading-relaxed">
                      CS 210 Exam Review scheduled for today. Maintain protected 90-minute evening study block before tomorrow's team training.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('balance-ai')}
                      className="w-full mt-1 py-1.5 px-3 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Review Study Blocks in BalanceAI</span>
                    </button>
                  </div>

                  {/* Action 2: Coach Discovery */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        2. Collegiate Coach Discovery
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                        {profile?.primary_sport || 'Collegiate'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Connect with accredited collegiate and performance coaches in {profile?.primary_sport || 'your sport'} to evaluate training progression.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('coaches')}
                      className="w-full mt-1 py-1.5 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-medium flex items-center justify-center gap-1.5 transition"
                    >
                      <Users className="w-3.5 h-3.5 text-amber-700" />
                      <span>Explore Coaches</span>
                    </button>
                  </div>

                  {/* Action 3: Open Competitions */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        3. Upcoming Collegiate Invitationals
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900">
                        Trials & Meets
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Cascade Collegiate Open & West Coast Showcase registrations are open for sophomore athletes.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('opportunities')}
                      className="w-full mt-1 py-1.5 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-medium flex items-center justify-center gap-1.5 transition"
                    >
                      <Compass className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Browse Opportunities</span>
                    </button>
                  </div>
                </>
              )}

              {/* Action 4: Retake Questionnaire Card */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    Onboarding Questionnaire
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-sky-700" />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Want to adjust your sport, performance level, schedule, or support requirements? Re-run the questionnaire at any time.
                </p>
                <button
                  type="button"
                  onClick={openOnboardingModal}
                  className="w-full mt-1 py-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <span>Retake Questionnaire</span>
                </button>
              </div>
            </div>
          </section>

          {/* Quick Support & Privacy Note */}
          <section className="p-4 rounded-xl border border-slate-200 bg-white text-xs text-slate-500 space-y-1">
            <span className="font-semibold text-slate-700 block">Privacy Guarantee</span>
            <p>
              Your accommodation notes, counselling interactions, and accessibility settings are private by default and never broadcast to public feeds.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
