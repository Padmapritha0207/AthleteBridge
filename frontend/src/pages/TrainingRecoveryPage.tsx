import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { TrainingSession, RecoveryLog } from '../types';
import { getSportTrackingConfig } from '../services/personalization';
import {
  Activity, Moon, Zap, AlertCircle, Plus, CheckCircle2,
  Clock, Dumbbell, ShieldCheck
} from 'lucide-react';

export const TrainingRecoveryPage: React.FC = () => {
  const { currentUser, perspective } = useAuth();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [recoveryLogs, setRecoveryLogs] = useState<RecoveryLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  // Derive sport tracking configuration from current user profile
  const userSport = currentUser?.profile?.primary_sport || 'Track & Field';
  const isAccessible = perspective === 'accessible';
  const sportConfig = getSportTrackingConfig(userSport, isAccessible);

  // Training Form
  const [sport, setSport] = useState(userSport);
  const [duration, setDuration] = useState(60);
  const [intensity, setIntensity] = useState('moderate');
  const [equipment, setEquipment] = useState(
    currentUser?.support_preference?.equipment_notes || sportConfig.equipmentChecklist.slice(0, 3).join(', ')
  );
  const [trainNotes, setTrainNotes] = useState('');

  // Update default form inputs when user changes
  useEffect(() => {
    if (currentUser?.profile?.primary_sport) {
      setSport(currentUser.profile.primary_sport);
    }
    if (currentUser?.support_preference?.equipment_notes) {
      setEquipment(currentUser.support_preference.equipment_notes);
    } else {
      setEquipment(sportConfig.equipmentChecklist.slice(0, 3).join(', '));
    }
  }, [currentUser?.id]);

  // Recovery Form
  const [sleepHours, setSleepHours] = useState(7.5);
  const [fatigue, setFatigue] = useState(2); // 1-5
  const [rpe, setRpe] = useState(6); // 1-10
  const [quality, setQuality] = useState('good');
  const [recNotes, setRecNotes] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [tList, rList] = await Promise.all([
        api.getTrainingSessions(),
        api.getRecoveryLogs()
      ]);
      setSessions(tList);
      setRecoveryLogs(rList);
    } catch (err) {
      console.error('Failed to load training/recovery telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.logTrainingSession({
        sport,
        duration_minutes: Number(duration),
        intensity,
        equipment_used: equipment,
        completed: true,
        notes: trainNotes
      });
      setShowTrainingModal(false);
      setTrainNotes('');
      await loadData();
    } catch (err: any) {
      alert(`Error logging workout: ${err.message}`);
    }
  };

  const handleLogRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.logRecovery({
        sleep_hours: Number(sleepHours),
        fatigue_level: Number(fatigue),
        perceived_exertion: Number(rpe),
        rest_quality: quality,
        self_notes: recNotes
      });
      setShowRecoveryModal(false);
      setRecNotes('');
      await loadData();
    } catch (err: any) {
      alert(`Error logging recovery: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Training Planner & RecoveryTracker</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold border border-sky-200">
              Self-Reported Readiness
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Log athletic training load and self-reported recovery metrics to observe individual trends.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTrainingModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition"
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Log Workout</span>
          </button>
          <button
            type="button"
            onClick={() => setShowRecoveryModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-sm transition"
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Check In Recovery</span>
          </button>
        </div>
      </div>

      {/* Non-Diagnostic Disclaimer */}
      <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-2xl text-xs text-sky-950 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Self-Reported Non-Diagnostic Metrics:</strong> Recovery and perceived exertion scores reflect personal subjective perceptions. AthleteBridge never uses these entries to infer medical diagnoses, predict injuries, or dictate clinical clearance.
        </p>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Training Sessions List */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-600" />
              <span>Completed Training Sessions</span>
            </h3>
            <span className="text-xs text-slate-500">{sessions.length} logged</span>
          </div>

          <div className="space-y-3">
            {sessions.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No workouts recorded yet.</p>
            ) : (
              sessions.map(s => (
                <div
                  key={s.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 text-sm">{s.sport}</span>
                    <span className="font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 capitalize">
                      {s.intensity} intensity
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-600">
                    <span className="flex items-center gap-1 font-mono font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {s.duration_minutes} mins
                    </span>
                    <span className="truncate text-slate-500">
                      Gear: {s.equipment_used}
                    </span>
                  </div>

                  {s.notes && (
                    <p className="italic text-slate-600 pt-1 border-t border-slate-200/50">
                      “{s.notes}”
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Recovery Logs List */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-600" />
              <span>Self-Reported Recovery Logs</span>
            </h3>
            <span className="text-xs text-slate-500">{recoveryLogs.length} entries</span>
          </div>

          <div className="space-y-3">
            {recoveryLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No recovery check-ins yet.</p>
            ) : (
              recoveryLogs.map(r => (
                <div
                  key={r.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Moon className="w-3.5 h-3.5 text-indigo-500" />
                      {r.sleep_hours} hrs sleep ({r.rest_quality} rest)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(r.logged_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-600 pt-1">
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-semibold">
                      Fatigue: {r.fatigue_level} / 5
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-900 border border-sky-200 font-semibold">
                      Perceived Exertion (RPE): {r.perceived_exertion} / 10
                    </span>
                  </div>

                  {r.self_notes && (
                    <p className="italic text-slate-600 pt-1 border-t border-slate-200/50">
                      “{r.self_notes}”
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Log Workout Modal */}
      {showTrainingModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Log Training Session</h3>
              <button type="button" onClick={() => setShowTrainingModal(false)}>✕</button>
            </div>

            <form onSubmit={handleLogTraining} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1">Sport / Discipline</label>
                <input
                  type="text"
                  required
                  value={sport}
                  onChange={e => setSport(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="360"
                    value={duration}
                    onChange={e => setDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Intensity</label>
                  <select
                    value={intensity}
                    onChange={e => setIntensity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 capitalize"
                  >
                    <option value="low">Low (Active Recovery)</option>
                    <option value="moderate">Moderate Aerobic</option>
                    <option value="high">High Intensity Intervals</option>
                    <option value="race_pace">Competition Race Pace</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Equipment / Facility Used</label>
                <input
                  type="text"
                  value={equipment}
                  onChange={e => setEquipment(e.target.value)}
                  placeholder="e.g. Accessible weight room, racing chair..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Session Notes</label>
                <textarea
                  rows={2}
                  value={trainNotes}
                  onChange={e => setTrainNotes(e.target.value)}
                  placeholder="Cadence, feelings, split times..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowTrainingModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl font-semibold"
                >
                  Save Workout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Recovery Modal */}
      {showRecoveryModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Check In Recovery</h3>
              <button type="button" onClick={() => setShowRecoveryModal(false)}>✕</button>
            </div>

            <form onSubmit={handleLogRecovery} className="space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Sleep (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="18"
                    value={sleepHours}
                    onChange={e => setSleepHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Rest Quality</label>
                  <select
                    value={quality}
                    onChange={e => setQuality(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 capitalize"
                  >
                    <option value="poor">Restless / Poor</option>
                    <option value="moderate">Moderate</option>
                    <option value="good">Good</option>
                    <option value="restful">Deep & Restful</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Fatigue Level (1 = Refreshed, 5 = Exhausted): {fatigue}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={fatigue}
                  onChange={e => setFatigue(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Perceived Exertion (1 = Minimal, 10 = Maximum Effort): {rpe}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={rpe}
                  onChange={e => setRpe(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Self Notes</label>
                <textarea
                  rows={2}
                  value={recNotes}
                  onChange={e => setRecNotes(e.target.value)}
                  placeholder="Physical sensations, mobility notes..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 text-white rounded-xl font-semibold"
                >
                  Save Recovery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
