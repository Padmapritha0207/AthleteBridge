import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Settings, Lock, ShieldCheck, UserCheck, Eye, Bell,
  Save, CheckCircle2, AlertCircle, Sparkles
} from 'lucide-react';

export const SettingsPrivacyPage: React.FC = () => {
  const {
    currentUser,
    profile,
    supportPreference,
    refreshIdentity,
    accessibility,
    setTextSize,
    toggleHighContrast,
    toggleReducedMotion,
    toggleEnhancedFocus,
    toggleDyslexicFont,
    perspective,
    switchPerspective,
    openOnboardingModal
  } = useAuth();

  // Profile fields
  const [institution, setInstitution] = useState(profile?.institution || '');
  const [academicLevel, setAcademicLevel] = useState(profile?.academic_level || '');
  const [academicMajor, setAcademicMajor] = useState(profile?.academic_major || '');
  const [primarySport, setPrimarySport] = useState(profile?.primary_sport || '');
  const [secondarySports, setSecondarySports] = useState(profile?.secondary_sports || '');
  const [skillLevel, setSkillLevel] = useState(profile?.skill_level || '');
  const [goals, setGoals] = useState(profile?.goals || '');
  const [trainingTimes, setTrainingTimes] = useState(profile?.preferred_training_times || '');
  const [region, setRegion] = useState(profile?.region || '');
  const [visibility, setVisibility] = useState(profile?.visibility_preferences || 'institution_only');

  // Support preference fields (confidential)
  const [needsDesc, setNeedsDesc] = useState(supportPreference?.optional_needs_description || '');
  const [commPref, setCommPref] = useState(supportPreference?.communication_preference || '');
  const [equipNotes, setEquipNotes] = useState(supportPreference?.equipment_notes || '');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSupport, setSavingSupport] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);
  const [supportSavedMsg, setSupportSavedMsg] = useState(false);

  useEffect(() => {
    if (profile) {
      setInstitution(profile.institution);
      setAcademicLevel(profile.academic_level);
      setAcademicMajor(profile.academic_major);
      setPrimarySport(profile.primary_sport);
      setSecondarySports(profile.secondary_sports);
      setSkillLevel(profile.skill_level);
      setGoals(profile.goals);
      setTrainingTimes(profile.preferred_training_times);
      setRegion(profile.region);
      setVisibility(profile.visibility_preferences);
    }
    if (supportPreference) {
      setNeedsDesc(supportPreference.optional_needs_description);
      setCommPref(supportPreference.communication_preference);
      setEquipNotes(supportPreference.equipment_notes);
    }
  }, [profile, supportPreference]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      await api.updateProfile({
        institution,
        academic_level: academicLevel,
        academic_major: academicMajor,
        primary_sport: primarySport,
        secondary_sports: secondarySports,
        skill_level: skillLevel,
        goals,
        preferred_training_times: trainingTimes,
        region,
        visibility_preferences: visibility
      });
      await refreshIdentity();
      setProfileSavedMsg(true);
      setTimeout(() => setProfileSavedMsg(false), 2000);
    } catch (err: any) {
      alert(`Error saving profile: ${err.message}`);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSupport(true);
      await api.updateSupportPreferences({
        optional_needs_description: needsDesc,
        communication_preference: commPref,
        equipment_notes: equipNotes,
        is_private: true
      });
      await refreshIdentity();
      setSupportSavedMsg(true);
      setTimeout(() => setSupportSavedMsg(false), 2000);
    } catch (err: any) {
      alert(`Error saving support preferences: ${err.message}`);
    } finally {
      setSavingSupport(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Settings & Privacy Architecture</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 font-semibold">
            Confidential By Default
          </span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your dual-career athletic profile, granular sharing visibility, and private accommodation preferences.
        </p>
      </div>

      {/* Onboarding & Perspective Card */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-800">
              Active Platform Perspective:
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              perspective === 'accessible' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'bg-sky-100 text-sky-900 border border-sky-200'
            }`}>
              {perspective === 'accessible' ? 'Perspective B • Accessible & Adaptive Track' : 'Perspective A • Standard Student-Athlete Track'}
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            Configured through your onboarding questionnaire. You can switch tracks or retake the questionnaire at any time without losing your saved records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => switchPerspective(perspective === 'accessible' ? 'standard' : 'accessible')}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
          >
            Switch to {perspective === 'accessible' ? 'Standard Track' : 'Accessible Track'}
          </button>
          <button
            type="button"
            onClick={openOnboardingModal}
            className="px-3.5 py-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold shadow-2xs transition"
          >
            Retake Questionnaire
          </button>
        </div>
      </section>

      {/* Accessibility Preferences */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Eye className="w-5 h-5 text-sky-600" />
          <span>Accessibility & Visual Interface Preferences</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <button
            type="button"
            onClick={toggleHighContrast}
            className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
              accessibility.highContrast
                ? 'bg-sky-50 border-sky-300 text-sky-950 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <span>High Contrast</span>
            {accessibility.highContrast && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
          </button>

          <button
            type="button"
            onClick={() => setTextSize(accessibility.textSize === 'large' ? 'standard' : 'large')}
            className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
              accessibility.textSize === 'large'
                ? 'bg-sky-50 border-sky-300 text-sky-950 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <span>Large Text ({accessibility.textSize})</span>
            {accessibility.textSize === 'large' && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
          </button>

          <button
            type="button"
            onClick={toggleReducedMotion}
            className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
              accessibility.reducedMotion
                ? 'bg-sky-50 border-sky-300 text-sky-950 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <span>Reduced Motion</span>
            {accessibility.reducedMotion && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
          </button>

          <button
            type="button"
            onClick={toggleDyslexicFont}
            className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
              accessibility.dyslexicFont
                ? 'bg-sky-50 border-sky-300 text-sky-950 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <span>Dyslexic Font</span>
            {accessibility.dyslexicFont && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
          </button>
        </div>
      </section>

      {/* Confidential Support Preferences Form */}
      <section className="bg-white rounded-2xl border border-indigo-200 p-6 shadow-xs space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
          <div>
            <h3 className="font-bold text-indigo-950 text-base flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-600" />
              <span>Optional & Confidential Support Preferences</span>
            </h3>
            <p className="text-xs text-indigo-800/80 mt-0.5">
              These preferences are never displayed on public community profiles or shared with peers.
            </p>
          </div>
          {supportSavedMsg && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved Privately</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveSupport} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-800 mb-1" htmlFor="needs-desc">
              Facility, Ramp, or Training Access Notes (Optional)
            </label>
            <textarea
              id="needs-desc"
              rows={2}
              value={needsDesc}
              onChange={e => setNeedsDesc(e.target.value)}
              placeholder="e.g. Ramp-accessible weight room, noise-dampening warm-up area, visual starting light..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Why this is requested: Allows athletics coordinators to preemptively check venue readiness for travel meets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1" htmlFor="comm-pref">
                Communication Method Preference
              </label>
              <input
                id="comm-pref"
                type="text"
                value={commPref}
                onChange={e => setCommPref(e.target.value)}
                placeholder="e.g. Written in-app, SMS, or in-person"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1" htmlFor="equip-notes">
                Equipment Transport / Storage Requirements
              </label>
              <input
                id="equip-notes"
                type="text"
                value={equipNotes}
                onChange={e => setEquipNotes(e.target.value)}
                placeholder="e.g. Racing chair requires dedicated trailer bay"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingSupport}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-xs transition"
            >
              {savingSupport ? 'Saving...' : 'Save Private Preferences'}
            </button>
          </div>
        </form>
      </section>

      {/* Dual Career Profile Form */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-sky-600" />
            <span>Dual-Career Athlete Profile</span>
          </h3>
          {profileSavedMsg && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Profile Updated</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Institution</label>
              <input
                type="text"
                value={institution}
                onChange={e => setInstitution(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Academic Level</label>
              <input
                type="text"
                value={academicLevel}
                onChange={e => setAcademicLevel(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Academic Major</label>
              <input
                type="text"
                value={academicMajor}
                onChange={e => setAcademicMajor(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Primary Sport</label>
              <input
                type="text"
                value={primarySport}
                onChange={e => setPrimarySport(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Secondary / Adaptive Sports</label>
              <input
                type="text"
                value={secondarySports}
                onChange={e => setSecondarySports(e.target.value)}
                placeholder="e.g. Wheelchair Racing (T54)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Skill Level / Classification</label>
              <input
                type="text"
                value={skillLevel}
                onChange={e => setSkillLevel(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">Dual-Career Goals</label>
            <textarea
              rows={2}
              value={goals}
              onChange={e => setGoals(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Preferred Training Hours</label>
              <input
                type="text"
                value={trainingTimes}
                onChange={e => setTrainingTimes(e.target.value)}
                placeholder="e.g. Mornings (07:30-09:30)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Visibility Permission</label>
              <select
                value={visibility}
                onChange={e => setVisibility(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
              >
                <option value="private">Private (Only You)</option>
                <option value="institution_only">Institutional Staff & Coaches Only</option>
                <option value="public_badges">Public Badges Allowed</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs shadow-xs transition"
            >
              {savingProfile ? 'Saving...' : 'Update Athlete Profile'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
