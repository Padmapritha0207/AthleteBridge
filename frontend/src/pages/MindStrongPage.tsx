import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Counsellor, MoodEntry } from '../types';
import {
  HeartHandshake, Brain, BookOpen, Trash2, ShieldAlert,
  Plus, CheckCircle2, AlertTriangle, Sparkles, PhoneCall, X
} from 'lucide-react';

export const MindStrongPage: React.FC = () => {
  const [exercises, setExercises] = useState<Array<{
    id: string;
    title: string;
    category: string;
    duration: string;
    description: string;
    steps: string[];
  }>>([]);
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Active coping exercise modal
  const [activeExercise, setActiveExercise] = useState<any | null>(null);

  // New Mood Modal
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [moodScore, setMoodScore] = useState(4);
  const [reflection, setReflection] = useState('');

  // Booking Modal
  const [selectedCounsellor, setSelectedCounsellor] = useState<Counsellor | null>(null);
  const [requestedSlot, setRequestedSlot] = useState('Next Tuesday 14:00');
  const [bookingReason, setBookingReason] = useState('Competition Mindset & Pre-Race Nerves');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [exRes, cList, mList] = await Promise.all([
        api.getCopingExercises(),
        api.getCounsellors(),
        api.getMoods()
      ]);
      setExercises(exRes.exercises);
      setCounsellors(cList);
      setMoods(mList);
    } catch (err) {
      console.error('Failed to load MindStrong data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogMood = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.logMood({
        mood_score: Number(moodScore),
        reflection_notes: reflection
      });
      setShowMoodModal(false);
      setReflection('');
      await loadData();
    } catch (err: any) {
      alert(`Error logging reflection: ${err.message}`);
    }
  };

  const handleDeleteMood = async (id: number) => {
    try {
      await api.deleteMood(id);
      await loadData();
    } catch (err: any) {
      alert(`Error deleting reflection: ${err.message}`);
    }
  };

  const handleBookCounsellor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCounsellor) return;
    try {
      await api.bookCounsellor(selectedCounsellor.id, {
        requested_slot: requestedSlot,
        reason_category: bookingReason,
        notes: bookingNotes
      });
      setBookingSuccess(true);
      setTimeout(() => {
        setSelectedCounsellor(null);
        setBookingSuccess(false);
        setBookingNotes('');
      }, 1800);
    } catch (err: any) {
      alert(`Error booking consultation: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>MindStrong: Mental Skills & Sports Wellbeing</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold border border-purple-200">
              Non-Clinical Skills
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Performance mindset exercises, confidential reflection journaling, and demo sports psychology connections.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowMoodModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Private Reflection</span>
        </button>
      </div>

      {/* Prominent Crisis & Non-Therapy Disclaimer */}
      <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-2xl text-xs text-rose-950 space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-rose-900">
          <AlertTriangle className="w-4 h-4 text-rose-700" />
          <span>Safety Notice & Crisis Guidance</span>
        </div>
        <p className="leading-relaxed text-rose-900">
          MindStrong provides self-directed athletic performance coping tools and educational exercises. It does <strong>not</strong> provide psychiatric therapy, clinical diagnosis, or active crisis monitoring. If you or someone you know is experiencing acute distress:
        </p>
        <div className="flex flex-wrap gap-4 pt-1 font-semibold text-rose-950">
          <span>• National Suicide & Crisis Lifeline: Call or text <strong>988</strong></span>
          <span>• University Counselling Center: Contact your Dean of Students or Athletic Trainer</span>
        </div>
      </div>

      {/* Coping Exercises Section */}
      <section className="space-y-3">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <span>Evidence-Based Mental Performance Exercises</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {exercises.map(ex => (
            <div
              key={ex.id}
              onClick={() => setActiveExercise(ex)}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-purple-300 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-purple-700 uppercase">
                  <span>{ex.category.replace('_', ' ')}</span>
                  <span className="bg-purple-50 px-2 py-0.5 rounded-full">{ex.duration}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-purple-600 transition">
                  {ex.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {ex.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-700 font-semibold">
                <span>Start Exercise</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Two Columns: Confidential Reflections & Demo Counsellor Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Private Reflections */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              <span>Confidential Reflections & Mood Entries</span>
            </h3>
            <span className="text-xs text-slate-500">Strictly private to you</span>
          </div>

          {moods.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No reflection entries recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {moods.map(m => (
                <div
                  key={m.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-purple-950 flex items-center gap-1.5">
                      Mindset Score: {m.mood_score} / 5
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400">
                        {new Date(m.logged_at).toLocaleDateString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteMood(m.id)}
                        className="text-slate-400 hover:text-rose-600 transition"
                        title="Permanently delete this private reflection"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {m.reflection_notes && (
                    <p className="text-slate-700 leading-relaxed">
                      “{m.reflection_notes}”
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Demo Sports Psychologists */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-purple-600" />
              <span>Sports Psychology & Performance Counsellors</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Demo Directory
            </span>
          </div>

          <div className="space-y-3">
            {counsellors.map(c => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                    <p className="text-purple-700 font-semibold">{c.specialty}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCounsellor(c)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                  >
                    Inquire Consultation
                  </button>
                </div>

                <p className="text-slate-600 leading-relaxed">{c.bio}</p>

                <div className="text-[11px] text-slate-400 font-mono pt-1">
                  {c.credentials_demo} • {c.contact_info}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Coping Exercise Modal */}
      {activeExercise && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                  {activeExercise.category.replace('_', ' ')} • {activeExercise.duration}
                </span>
                <h3 className="text-base font-bold text-slate-900">{activeExercise.title}</h3>
              </div>
              <button type="button" onClick={() => setActiveExercise(null)}>✕</button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{activeExercise.description}</p>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 block">Step-by-Step Execution:</span>
              {activeExercise.steps.map((st: string, i: number) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-xs">
                  <span className="w-5 h-5 rounded-md bg-purple-200 text-purple-900 font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-purple-950 leading-relaxed font-medium">{st}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                type="button"
                onClick={() => setActiveExercise(null)}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold"
              >
                Finished Exercise
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Mood Modal */}
      {showMoodModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Log Private Reflection</h3>
              <button type="button" onClick={() => setShowMoodModal(false)}>✕</button>
            </div>

            <form onSubmit={handleLogMood} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1">
                  Mindset / Readiness Score (1 = Stressed, 5 = Confident & Grounded): {moodScore}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={moodScore}
                  onChange={e => setMoodScore(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Reflection Notes</label>
                <textarea
                  required
                  rows={4}
                  value={reflection}
                  onChange={e => setReflection(e.target.value)}
                  placeholder="How are you managing academic pressures and upcoming athletic splits today?..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <p className="text-[11px] text-slate-400 italic">
                Note: Reflections are strictly private to you. They can be deleted at any time.
              </p>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowMoodModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 text-white rounded-xl font-semibold"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Counsellor Booking Modal */}
      {selectedCounsellor && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Inquire Consultation: {selectedCounsellor.name}
              </h3>
              <button type="button" onClick={() => setSelectedCounsellor(null)}>✕</button>
            </div>

            {bookingSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">Consultation Inquired (Demo)</h4>
                <p className="text-xs text-slate-500">Inquiry recorded in prototype database.</p>
              </div>
            ) : (
              <form onSubmit={handleBookCounsellor} className="space-y-3 text-xs sm:text-sm">
                <div>
                  <label className="block font-semibold mb-1">Focus Category</label>
                  <select
                    value={bookingReason}
                    onChange={e => setBookingReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="Competition Mindset & Pre-Race Nerves">Competition Mindset & Pre-Race Nerves</option>
                    <option value="Balancing Academic Exams & Varsity Travel">Balancing Academic Exams & Varsity Travel</option>
                    <option value="Injury Recovery Resilience">Injury Recovery Resilience</option>
                    <option value="General Dual-Career Transition">General Dual-Career Transition</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Target Consultation Window</label>
                  <input
                    type="text"
                    required
                    value={requestedSlot}
                    onChange={e => setRequestedSlot(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Notes / Questions</label>
                  <textarea
                    rows={2}
                    value={bookingNotes}
                    onChange={e => setBookingNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setSelectedCounsellor(null)}
                    className="px-4 py-2 border rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 text-white rounded-xl font-semibold"
                  >
                    Send Demo Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
