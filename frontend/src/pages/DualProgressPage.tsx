import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ProgressGoal, AthleteAchievement } from '../types';
import {
  TrendingUp, Award, BookOpen, Target, CheckCircle2,
  Lock, Globe, Plus, Sparkles, X, ShieldCheck
} from 'lucide-react';

export const DualProgressPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState<ProgressGoal[]>([]);
  const [achievements, setAchievements] = useState<AthleteAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  // New Goal Modal
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalCategory, setGoalCategory] = useState<'academic' | 'sport'>('academic');
  const [goalTitle, setGoalTitle] = useState('');
  const [targetMetric, setTargetMetric] = useState('');
  const [currentMetric, setCurrentMetric] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);

  // New Achievement Modal
  const [showAchModal, setShowAchModal] = useState(false);
  const [achTitle, setAchTitle] = useState('');
  const [achCategory, setAchCategory] = useState('sport');
  const [achDate, setAchDate] = useState(new Date().toISOString().split('T')[0]);
  const [achProvenance, setAchProvenance] = useState('self_entered');
  const [isShared, setIsShared] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gList, achList] = await Promise.all([
        api.getGoals(),
        api.getAchievements()
      ]);
      setGoals(gList);
      setAchievements(achList);
    } catch (err) {
      console.error('Failed to load dual progress:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.id]);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createGoal({
        category: goalCategory,
        title: goalTitle,
        target_metric: targetMetric,
        current_metric: currentMetric,
        target_date: targetDate
      });
      setShowGoalModal(false);
      setGoalTitle('');
      setTargetMetric('');
      setCurrentMetric('');
      await loadData();
    } catch (err: any) {
      alert(`Error creating goal: ${err.message}`);
    }
  };

  const handleToggleGoal = async (goalId: number) => {
    try {
      await api.toggleGoalStatus(goalId);
      await loadData();
    } catch (err: any) {
      alert(`Error updating goal: ${err.message}`);
    }
  };

  const handleCreateAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAchievement({
        title: achTitle,
        category: achCategory,
        date_achieved: achDate,
        provenance: achProvenance,
        is_shared_publicly: isShared
      });
      setShowAchModal(false);
      setAchTitle('');
      await loadData();
    } catch (err: any) {
      alert(`Error saving achievement: ${err.message}`);
    }
  };

  const handleToggleShare = async (achId: number) => {
    try {
      await api.toggleAchievementShare(achId);
      await loadData();
    } catch (err: any) {
      alert(`Error toggling share setting: ${err.message}`);
    }
  };

  const academicGoals = goals.filter(g => g.category === 'academic');
  const sportGoals = goals.filter(g => g.category === 'sport');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>DualProgress & Athlete Passport</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold border border-sky-200">
              Provenance & Privacy Verified
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track dual-career progression with independent academic and athletic benchmarks. No arbitrary combined score.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGoalModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Goal</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAchModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-sm transition"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Record Milestone</span>
          </button>
        </div>
      </div>

      {/* Two Column Goals Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic Goals Column */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Academic Milestones & GPA</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {academicGoals.filter(g => g.status === 'achieved').length} / {academicGoals.length} completed
            </span>
          </div>

          <div className="space-y-3">
            {academicGoals.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No academic goals logged.</p>
            ) : (
              academicGoals.map(g => (
                <div
                  key={g.id}
                  className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-3 ${
                    g.status === 'achieved'
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="space-y-1">
                    <p className={`text-xs font-bold ${g.status === 'achieved' ? 'line-through text-emerald-800' : ''}`}>
                      {g.title}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Target: <strong>{g.target_metric}</strong> (Current: {g.current_metric}) • Due: {g.target_date}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleGoal(g.id)}
                    className={`p-1.5 rounded-lg border text-xs font-semibold transition shrink-0 ${
                      g.status === 'achieved'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Sports Goals Column */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Athletic Splits & Standards</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {sportGoals.filter(g => g.status === 'achieved').length} / {sportGoals.length} completed
            </span>
          </div>

          <div className="space-y-3">
            {sportGoals.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No athletic goals logged.</p>
            ) : (
              sportGoals.map(g => (
                <div
                  key={g.id}
                  className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-3 ${
                    g.status === 'achieved'
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="space-y-1">
                    <p className={`text-xs font-bold ${g.status === 'achieved' ? 'line-through text-emerald-800' : ''}`}>
                      {g.title}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Standard: <strong>{g.target_metric}</strong> (Current: {g.current_metric}) • Target: {g.target_date}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleGoal(g.id)}
                    className={`p-1.5 rounded-lg border text-xs font-semibold transition shrink-0 ${
                      g.status === 'achieved'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Athlete Passport & Verified Achievements */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Athlete Passport: Verifiable Provenance & Badges</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Every milestone displays its verification source. You control which badges are visible.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map(ach => (
            <div
              key={ach.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    ach.category === 'academic' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {ach.category}
                  </span>

                  <span className="text-[10px] text-slate-400">
                    {ach.date_achieved}
                  </span>
                </div>

                <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                  {ach.title}
                </h4>
              </div>

              <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-500">
                  <span>Verified by: </span>
                  <strong className="text-slate-700">{ach.verified_by}</strong>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleShare(ach.id)}
                  className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition ${
                    ach.is_shared_publicly
                      ? 'bg-sky-50 text-sky-700 border-sky-200'
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}
                  title={ach.is_shared_publicly ? 'Shared (Click to make private)' : 'Private (Click to share)'}
                >
                  {ach.is_shared_publicly ? (
                    <>
                      <Globe className="w-3.5 h-3.5 text-sky-600" />
                      <span className="text-[10px] font-semibold">Shared</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Private</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Add Goal Modal */}
      {showGoalModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Goal</h3>
              <button type="button" onClick={() => setShowGoalModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1">Category</label>
                <select
                  value={goalCategory}
                  onChange={e => setGoalCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                >
                  <option value="academic">Academic Goal</option>
                  <option value="sport">Sport / Athletic Goal</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={goalTitle}
                  onChange={e => setGoalTitle(e.target.value)}
                  placeholder="e.g. Sub-15.0s Split or Maintain 3.8 GPA"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Target Metric *</label>
                  <input
                    type="text"
                    required
                    value={targetMetric}
                    onChange={e => setTargetMetric(e.target.value)}
                    placeholder="e.g. 14.80s or 3.75 GPA"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Current Metric *</label>
                  <input
                    type="text"
                    required
                    value={currentMetric}
                    onChange={e => setCurrentMetric(e.target.value)}
                    placeholder="e.g. 15.10s or 3.65 GPA"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Target Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={e => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl font-semibold"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Achievement Modal */}
      {showAchModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Record Athlete Milestone</h3>
              <button type="button" onClick={() => setShowAchModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateAchievement} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1">Milestone Title *</label>
                <input
                  type="text"
                  required
                  value={achTitle}
                  onChange={e => setAchTitle(e.target.value)}
                  placeholder="e.g. Regional 400m Champion or Dean's Honor Roll"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    value={achCategory}
                    onChange={e => setAchCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="sport">Athletic</option>
                    <option value="academic">Academic</option>
                    <option value="leadership">Leadership & Inclusion</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Date Achieved</label>
                  <input
                    type="date"
                    value={achDate}
                    onChange={e => setAchDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="ach-share"
                  type="checkbox"
                  checked={isShared}
                  onChange={e => setIsShared(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                />
                <label htmlFor="ach-share" className="text-xs font-semibold text-slate-800">
                  Display on public athlete badge profile (private by default)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAchModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 text-white rounded-xl font-semibold"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
