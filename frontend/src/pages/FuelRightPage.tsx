import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MealLog } from '../types';
import {
  Apple, Droplets, Clock, AlertTriangle, Plus, CheckCircle2,
  Sparkles, Coffee, Utensils
} from 'lucide-react';

export const FuelRightPage: React.FC = () => {
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);

  // Meal Form
  const [mealType, setMealType] = useState('pre_training');
  const [description, setDescription] = useState('');
  const [hydrationMl, setHydrationMl] = useState(600);
  const [timing, setTiming] = useState('1.5 - 2 hours prior to interval workout');
  const [dietaryFlags, setDietaryFlags] = useState('Plant-based, Complex Carbs');

  const loadMeals = async () => {
    try {
      setLoading(true);
      const data = await api.getMeals();
      setMeals(data);
    } catch (err) {
      console.error('Failed to load meals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeals();
  }, []);

  const handleLogMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.logMeal({
        meal_type: mealType,
        description,
        hydration_ml: Number(hydrationMl),
        timing_relative_to_training: timing,
        dietary_flags: dietaryFlags
      });
      setShowLogModal(false);
      setDescription('');
      await loadMeals();
    } catch (err: any) {
      alert(`Error logging meal: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>FuelRight: Sports Nutrition & Hydration</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
              General Educational Guidance
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            General timing ideas and self-reported hydration habits around heavy training blocks and competitions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowLogModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Log Meal / Hydration</span>
        </button>
      </div>

      {/* Prominent Medical Non-Diagnostic Disclaimer */}
      <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl text-xs text-amber-950 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">
            Important Educational Health & Non-Diagnostic Disclaimer:
          </p>
          <p className="leading-relaxed text-amber-900">
            FuelRight provides general sports nutrition principles and self-tracking only. It does not provide medical advice, diagnosis, treatment, or clinical calorie prescriptions. Student-athletes with metabolic conditions, dietary requirements, or eating recovery needs should consult a certified sports dietitian or university medical health professional.
          </p>
        </div>
      </div>

      {/* Educational Timing Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs">
            1
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Pre-Training (2-3 hrs prior)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Prioritize easily digestible complex carbohydrates with moderate protein and low fiber to support sustained muscle glycogen without gastrointestinal distress.
          </p>
          <span className="text-[11px] text-sky-700 font-medium block">
            Example: Oatmeal with banana and pumpkin seeds + 500ml water.
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
            2
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Post-Session Window (&lt;45 mins)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Aim for a balanced 3:1 ratio of carbohydrates to high-quality protein to jumpstart muscle tissue repair and replenish energy stores before afternoon classes.
          </p>
          <span className="text-[11px] text-emerald-700 font-medium block">
            Example: Tofu grain bowl, Greek yogurt with berries, or protein smoothie.
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
            3
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Hydration Baseline</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Consistent fluid intake throughout academic classes prevents acute cognitive and athletic dehydration fatigue. Include electrolytes during hot or long endurance blocks.
          </p>
          <span className="text-[11px] text-indigo-700 font-medium block">
            Tip: Keep a reusable measured bottle at your lecture desk.
          </span>
        </div>
      </div>

      {/* Athlete Logged Meals */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Utensils className="w-5 h-5 text-emerald-600" />
          <span>My Self-Reported Meal & Fluid Entries</span>
        </h3>

        {loading ? (
          <p className="text-xs text-slate-400 py-4 text-center">Loading meal logs...</p>
        ) : meals.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No meal logs recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {meals.map(m => (
              <div
                key={m.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 capitalize">
                      {m.meal_type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {m.dietary_flags}
                    </span>
                    <span className="text-slate-400">
                      {new Date(m.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-700">{m.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <span className="flex items-center gap-1 font-semibold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
                    <Droplets className="w-3.5 h-3.5" />
                    {m.hydration_ml} mL
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {m.timing_relative_to_training}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Log Meal Modal */}
      {showLogModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Log Meal & Hydration</h3>
              <button type="button" onClick={() => setShowLogModal(false)}>✕</button>
            </div>

            <form onSubmit={handleLogMeal} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1">Meal Timing Context</label>
                <select
                  value={mealType}
                  onChange={e => setMealType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 capitalize"
                >
                  <option value="pre_training">Pre-Training Fuel</option>
                  <option value="post_training">Post-Training Recovery</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Academic Study Snack</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Meal Description *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Quinoa bowl with roasted sweet potatoes, greens, tofu and seeds..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Hydration (mL)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={hydrationMl}
                    onChange={e => setHydrationMl(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Dietary Focus</label>
                  <input
                    type="text"
                    value={dietaryFlags}
                    onChange={e => setDietaryFlags(e.target.value)}
                    placeholder="e.g. Vegetarian, High Carb"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Timing Relative to Activity</label>
                <input
                  type="text"
                  value={timing}
                  onChange={e => setTiming(e.target.value)}
                  placeholder="e.g. 1.5h before workout"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
