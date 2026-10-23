import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { OnboardingData } from '../types';
import {
  Sparkles, ArrowRight, ArrowLeft, Check, ShieldCheck,
  Award, Calendar, HeartHandshake, Eye, BookOpen, Dumbbell,
  CheckCircle2, X, AlertCircle, Edit2
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExperienceAssigned?: (experience: 'standard' | 'accessible') => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onExperienceAssigned
}) => {
  const { currentUser, profile, completeOnboarding, perspective } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const examPeriodOptions = [
    'None / Normal Class Schedule',
    'Approaching midterms (in 2-3 weeks)',
    'Active midterm exams',
    'Approaching finals (in 2-3 weeks)',
    'Active final exams'
  ];

  const improvementAreaOptions = [
    'Endurance',
    'Technique',
    'Consistency',
    'Coordination',
    'Strategic understanding',
    'Competition preparation',
    'Speed & sprint turnover'
  ];

  const platformGoalOptions = [
    'Balance education and sports',
    'Improve sporting performance',
    'Find a coach',
    'Discover competitions',
    'Find scholarships',
    'Improve time management',
    'Access learning resources',
    'Find suitable training facilities',
    'Discover inclusive sports programs',
    'Track personal progress'
  ];

  // 5-Step Form State matching Seva Innovation Challenge Specification
  const [formData, setFormData] = useState<OnboardingData>({
    // Step 1: Personal and Educational Profile
    display_name: currentUser?.display_name || '',
    age: 19,
    education_level: 'College student',
    academic_goals: 'Maintain Dean\'s List standing while balancing collegiate athletics.',
    support_subjects: 'Computer Science & Data Lab assignments',
    exam_period: 'Approaching midterms (in 2-3 weeks)',

    // Step 2: Sports Profile
    primary_sport: profile?.primary_sport || 'Track & Field',
    secondary_sport: 'Wheelchair Racing (T54)',
    skill_level: (profile?.skill_level as any) || 'School or college level',
    training_frequency: '4-5 sessions per week',
    competition_level: 'Collegiate / National',
    sporting_goals: 'Qualify for National Championships and optimize transition buffers.',
    short_term_sport_goals: 'Improve technical cadence and stroke consistency.',
    long_term_sport_goals: 'Qualify for conference and national championships.',
    improvement_areas: ['Technique', 'Consistency', 'Endurance'],

    // Step 3: Experience Type and Accessibility Requirements
    experience_type: perspective === 'accessible' ? 'accessible' : 'standard',
    accessibility_status: perspective === 'accessible' ? 'requires_support' : 'no_support',
    platform_goals: ['Balance education and sports', 'Improve sporting performance', 'Track personal progress'],
    accommodations: ['Wheelchair-accessible venues', 'Adaptive sports equipment'],
    other_accommodations: '',

    // Step 4: Schedule and Preferences
    study_availability: 'Evening',
    training_availability: 'Morning',
    preferred_learning_formats: ['Visual / Interactive', 'Digital screen-reader ready'],
    preferred_communication_methods: 'Email & In-App Notifications',
    reminder_preferences: ['24 hours before deadlines', '30m buffer alert before training'],
    support_preferences: ['Study planning', 'Training reminders', 'Competition scheduling', 'Transit buffer protection']
  });

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        display_name: currentUser?.display_name || prev.display_name,
        education_level: (profile.academic_level as any) || prev.education_level,
        primary_sport: profile.primary_sport || prev.primary_sport,
        secondary_sport: profile.secondary_sports || prev.secondary_sport,
        skill_level: (profile.skill_level as any) || prev.skill_level,
        academic_goals: profile.goals || prev.academic_goals,
        exam_period: profile.exam_period || prev.exam_period,
        short_term_sport_goals: profile.short_term_sport_goals || prev.short_term_sport_goals,
        long_term_sport_goals: profile.long_term_sport_goals || prev.long_term_sport_goals,
        improvement_areas: profile.improvement_areas ? profile.improvement_areas.split(', ').map(s => s.trim()) : prev.improvement_areas,
        platform_goals: profile.platform_goals ? profile.platform_goals.split(', ').map(s => s.trim()) : prev.platform_goals,
        experience_type: (profile.experience_type as any) || (perspective === 'accessible' ? 'accessible' : 'standard'),
        accessibility_status: profile.experience_type === 'accessible' || perspective === 'accessible' ? 'requires_support' : 'no_support'
      }));
    } else if (currentUser?.display_name && !formData.display_name) {
      setFormData(prev => ({ ...prev, display_name: currentUser.display_name }));
    }
  }, [profile, currentUser?.display_name, perspective]);

  if (!isOpen) return null;

  const popularSports = [
    'Track & Field', 'Swimming', 'Wheelchair Racing',
    'Basketball', 'Para Powerlifting', 'Badminton',
    'Tennis', 'Archery', 'Soccer'
  ];

  const accommodationOptions = [
    { id: 'Mobility and wheelchair accessibility', label: 'Mobility and wheelchair accessibility' },
    { id: 'Visual accessibility and screen-reader support', label: 'Visual accessibility and screen-reader support' },
    { id: 'Hearing accessibility, captions, and communication support', label: 'Hearing accessibility, captions, and communication support' },
    { id: 'Adaptive sports equipment', label: 'Adaptive sports equipment' },
    { id: 'Accessible training instructions', label: 'Accessible training instructions' },
    { id: 'Sign-language support', label: 'Sign-language support' },
    { id: 'Assistance with navigating venues', label: 'Assistance with navigating venues' },
    { id: 'Other', label: 'Other individually specified accommodations' }
  ];

  const learningFormats = [
    'Visual & Interactive',
    'Screen-reader compatible digital text',
    'Captioned video & transcripts',
    'Step-by-step printed race/study itineraries'
  ];

  const reminderOptions = [
    '24 hours before deadlines',
    '2 hours before exams/classes',
    '30m buffer alert before training',
    'Daily morning agenda summary'
  ];

  const supportOptions = [
    'Study planning',
    'Training reminders',
    'Competition scheduling',
    'Academic resource recommendations',
    'Transit buffer protection',
    'Faculty accommodation letters'
  ];

  const handleToggleAccommodation = (id: string) => {
    setFormData(prev => {
      const exists = prev.accommodations.includes(id);
      return {
        ...prev,
        accommodations: exists
          ? prev.accommodations.filter(a => a !== id)
          : [...prev.accommodations, id]
      };
    });
  };

  const handleToggleLearningFormat = (item: string) => {
    setFormData(prev => {
      const current = prev.preferred_learning_formats || [];
      const exists = current.includes(item);
      return {
        ...prev,
        preferred_learning_formats: exists
          ? current.filter(i => i !== item)
          : [...current, item]
      };
    });
  };

  const handleToggleReminder = (item: string) => {
    setFormData(prev => {
      const current = prev.reminder_preferences || [];
      const exists = current.includes(item);
      return {
        ...prev,
        reminder_preferences: exists
          ? current.filter(i => i !== item)
          : [...current, item]
      };
    });
  };

  const handleToggleSupport = (item: string) => {
    setFormData(prev => {
      const exists = prev.support_preferences.includes(item);
      return {
        ...prev,
        support_preferences: exists
          ? prev.support_preferences.filter(s => s !== item)
          : [...prev.support_preferences, item]
      };
    });
  };

  const handleToggleImprovementArea = (area: string) => {
    setFormData(prev => {
      const current = prev.improvement_areas || [];
      const exists = current.includes(area);
      return {
        ...prev,
        improvement_areas: exists ? current.filter(a => a !== area) : [...current, area]
      };
    });
  };

  const handleTogglePlatformGoal = (goal: string) => {
    setFormData(prev => {
      const current = prev.platform_goals || [];
      const exists = current.includes(goal);
      return {
        ...prev,
        platform_goals: exists ? current.filter(g => g !== goal) : [...current, goal]
      };
    });
  };

  const validateStep = (currentStep: number): boolean => {
    setValidationError(null);
    if (currentStep === 1) {
      if (!formData.display_name.trim()) {
        setValidationError('Please enter your name.');
        return false;
      }
      if (!formData.age || Number(formData.age) < 10 || Number(formData.age) > 99) {
        setValidationError('Please enter a valid age (10 to 99).');
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.primary_sport.trim()) {
        setValidationError('Please specify your primary sport.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    setStep(prev => Math.min(5, prev + 1));
  };

  const handleBack = () => {
    setValidationError(null);
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleConfirmAndLaunch = async () => {
    try {
      setSubmitting(true);
      await completeOnboarding(formData);
      if (onExperienceAssigned) {
        onExperienceAssigned(formData.experience_type);
      }
      onClose();
    } catch (err: any) {
      console.error('Onboarding submission handled:', err);
      // Ensure modal closes and experience is assigned gracefully
      if (onExperienceAssigned) {
        onExperienceAssigned(formData.experience_type);
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto border border-slate-200">
        
        {/* Header / Welcome Banner */}
        <div className="pb-4 border-b border-slate-100 relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>Personalized Onboarding</span>
              </div>
              <h2 id="onboarding-modal-title" className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Welcome to AthleteBridge
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-sky-800 mt-0.5">
                Your Goals. Your Game. Your Future.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Tell us a little about yourself so we can assign your specialized dashboard experience.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 5-Step Progress Tracker */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
              <span>
                Step {step} of 5: {
                  step === 1 ? 'Personal & Education Profile' :
                  step === 2 ? 'Sports Profile' :
                  step === 3 ? 'Experience Type & Accessibility' :
                  step === 4 ? 'Schedule & Preferences' :
                  'Profile Confirmation'
                }
              </span>
              <span className="text-sky-700">{Math.round((step / 5) * 100)}% Completed</span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map(s => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all ${
                    s <= step ? 'bg-sky-600' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Validation Error Alert */}
        {validationError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* STEP 1: PERSONAL AND EDUCATIONAL PROFILE */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-700" />
              <span>Step 1: Personal and Educational Profile</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="ob-name">
                  What is your name? *
                </label>
                <input
                  id="ob-name"
                  type="text"
                  required
                  value={formData.display_name}
                  onChange={e => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="e.g. Jordan Reed"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="ob-age">
                  What is your age? *
                </label>
                <input
                  id="ob-age"
                  type="number"
                  min={10}
                  max={99}
                  required
                  value={formData.age}
                  onChange={e => setFormData({ ...formData, age: Number(e.target.value) || '' })}
                  placeholder="e.g. 19"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Current Education Level *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {['School student', 'College student', 'Other'].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFormData({ ...formData, education_level: lvl as any })}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition ${
                      formData.education_level === lvl
                        ? 'border-sky-600 bg-sky-50 text-sky-900 shadow-2xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{lvl}</span>
                      {formData.education_level === lvl && <Check className="w-3.5 h-3.5 text-sky-600" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="ob-academic-goals">
                Academic Goals (e.g. GPA target, graduate requirements, balance)
              </label>
              <input
                id="ob-academic-goals"
                type="text"
                value={formData.academic_goals || ''}
                onChange={e => setFormData({ ...formData, academic_goals: e.target.value })}
                placeholder="e.g. Dean's List standing, pass all midterm examinations"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="ob-support-subjects">
                Subjects or Skills Requiring Additional Support (Optional)
              </label>
              <input
                id="ob-support-subjects"
                type="text"
                value={formData.support_subjects || ''}
                onChange={e => setFormData({ ...formData, support_subjects: e.target.value })}
                placeholder="e.g. Data Structures, Physics Lab evaluations, exam buffer time"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="ob-exam-period">
                Exam Timeline / Approaching Evaluation Period
              </label>
              <select
                id="ob-exam-period"
                value={formData.exam_period || 'None / Normal Class Schedule'}
                onChange={e => setFormData({ ...formData, exam_period: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600"
              >
                {examPeriodOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* STEP 2: SPORTS PROFILE */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-sky-700" />
              <span>Step 2: Sports Profile</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="ob-sport">
                  Primary Sport *
                </label>
                <input
                  id="ob-sport"
                  type="text"
                  required
                  value={formData.primary_sport}
                  onChange={e => setFormData({ ...formData, primary_sport: e.target.value })}
                  placeholder="e.g. Track & Field, Swimming, Wheelchair Racing"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-600 mb-2"
                />

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400">Popular:</span>
                  {popularSports.slice(0, 5).map(sp => (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => setFormData({ ...formData, primary_sport: sp })}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition ${
                        formData.primary_sport === sp
                          ? 'bg-sky-100 text-sky-800 border-sky-300'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {sp}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="ob-sec-sport">
                  Secondary Sport (Optional)
                </label>
                <input
                  id="ob-sec-sport"
                  type="text"
                  value={formData.secondary_sport || ''}
                  onChange={e => setFormData({ ...formData, secondary_sport: e.target.value })}
                  placeholder="e.g. Wheelchair Racing (T54), Open Water"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Experience Level *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Beginner',
                  'School or college level',
                  'District or state level',
                  'National or international level'
                ].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFormData({ ...formData, skill_level: lvl as any })}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition ${
                      formData.skill_level === lvl
                        ? 'border-sky-600 bg-sky-50 text-sky-900 shadow-2xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{lvl}</span>
                      {formData.skill_level === lvl && <Check className="w-3.5 h-3.5 text-sky-600" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Training Frequency
                </label>
                <select
                  value={formData.training_frequency || '4-5 sessions per week'}
                  onChange={e => setFormData({ ...formData, training_frequency: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="1-2 sessions per week">1-2 sessions per week</option>
                  <option value="3-4 sessions per week">3-4 sessions per week</option>
                  <option value="4-5 sessions per week">4-5 sessions per week</option>
                  <option value="Daily / High Performance">Daily / High Performance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Competition Level
                </label>
                <select
                  value={formData.competition_level || 'Collegiate / Regional'}
                  onChange={e => setFormData({ ...formData, competition_level: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="Intramural / Recreational">Intramural / Recreational</option>
                  <option value="Collegiate / Regional">Collegiate / Regional</option>
                  <option value="National Trials & Meets">National Trials & Meets</option>
                  <option value="International / Para Contender">International / Para Contender</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="ob-short-goals">
                  Short-term Sporting Goal (Next 1-3 months)
                </label>
                <input
                  id="ob-short-goals"
                  type="text"
                  value={formData.short_term_sport_goals || ''}
                  onChange={e => setFormData({ ...formData, short_term_sport_goals: e.target.value })}
                  placeholder="e.g. Improve backhand clear and court footwork reaction time"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="ob-long-goals">
                  Long-term Sporting Goal (Season / Year)
                </label>
                <input
                  id="ob-long-goals"
                  type="text"
                  value={formData.long_term_sport_goals || ''}
                  onChange={e => setFormData({ ...formData, long_term_sport_goals: e.target.value })}
                  placeholder="e.g. Qualify for National Championships or recruitment"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Primary Areas for Improvement
                </label>
                <span className="text-[10px] text-slate-400">Multi-select chips</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {improvementAreaOptions.map(area => {
                  const isSelected = (formData.improvement_areas || []).includes(area);
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => handleToggleImprovementArea(area)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-sky-100 text-sky-900 border-sky-300 font-semibold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span>{area}</span>
                      {isSelected && <Check className="w-3 h-3 text-sky-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: EXPERIENCE TYPE AND ACCESSIBILITY REQUIREMENTS */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-sky-700" />
              <span>Step 3: Experience Type and Accessibility Requirements</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Which type of support would best suit your needs? *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1: Standard Experience */}
                <div
                  onClick={() => setFormData({
                    ...formData,
                    experience_type: 'standard',
                    accessibility_status: 'no_support'
                  })}
                  className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                    formData.experience_type === 'standard'
                      ? 'border-sky-600 bg-sky-50 text-sky-950 shadow-xs ring-2 ring-sky-600/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">
                        1. Standard Student-Athlete Experience
                      </span>
                      {formData.experience_type === 'standard' && (
                        <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      For student-athletes balancing academic courses, exams, varsity training, and general competition opportunities.
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-sky-800 mt-2 block">
                    Routes to: Standard Athlete Dashboard
                  </span>
                </div>

                {/* Option 2: Disability-Inclusive Experience */}
                <div
                  onClick={() => setFormData({
                    ...formData,
                    experience_type: 'accessible',
                    accessibility_status: 'requires_support'
                  })}
                  className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                    formData.experience_type === 'accessible'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-950 shadow-xs ring-2 ring-indigo-600/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-indigo-950">
                        2. Disability-Inclusive Experience
                      </span>
                      {formData.experience_type === 'accessible' && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      For student-athletes with disabilities who want accessible facilities, adaptive gear, SupportBridge accommodation tracking, and sensory buffers.
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-indigo-900 mt-2 block">
                    Routes to: Accessible Athlete Dashboard
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Platform Goals — What do you want AthleteBridge to support?
                </label>
                <span className="text-[10px] text-slate-400">Multi-select</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {platformGoalOptions.map(goal => {
                  const isSelected = (formData.platform_goals || []).includes(goal);
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => handleTogglePlatformGoal(goal)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-sky-100 text-sky-900 border-sky-300 font-semibold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span>{goal}</span>
                      {isSelected && <Check className="w-3 h-3 text-sky-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Accommodations if Disability-Inclusive selected */}
            {formData.experience_type === 'accessible' && (
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Which accommodations would help you participate comfortably? (Optional)
                  </label>
                  <span className="text-[11px] text-slate-400">Multi-select</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {accommodationOptions.map(opt => {
                    const isSelected = formData.accommodations.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleToggleAccommodation(opt.id)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-medium transition flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-semibold'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="text-[11px]">{opt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {formData.accommodations.includes('Other') && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="ob-other">
                      Please describe your other accessibility requirements:
                    </label>
                    <input
                      id="ob-other"
                      type="text"
                      value={formData.other_accommodations || ''}
                      onChange={e => setFormData({ ...formData, other_accommodations: e.target.value })}
                      placeholder="e.g. Low-sensory warmup room, specific chair tie-downs"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-600"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Privacy Guarantee Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero Medical Disclosure Barrier</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                We collect only the information necessary to personalize your dashboard. We never require a medical diagnosis. You can update your experience at any time.
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: SCHEDULE AND PREFERENCES */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-700" />
              <span>Step 4: Schedule and Preferences</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Study Availability Window *
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Morning', 'Afternoon', 'Evening', 'My schedule varies'].map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setFormData({ ...formData, study_availability: slot as any })}
                      className={`p-2 rounded-lg border text-left text-xs font-semibold transition ${
                        formData.study_availability === slot
                          ? 'border-sky-600 bg-sky-50 text-sky-900'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{slot}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Training Availability Window *
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Morning', 'Afternoon', 'Evening', 'My schedule varies'].map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setFormData({ ...formData, training_availability: slot as any })}
                      className={`p-2 rounded-lg border text-left text-xs font-semibold transition ${
                        formData.training_availability === slot
                          ? 'border-sky-600 bg-sky-50 text-sky-900'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{slot}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Learning Formats
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {learningFormats.map(fmt => {
                  const isSelected = (formData.preferred_learning_formats || []).includes(fmt);
                  return (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => handleToggleLearningFormat(fmt)}
                      className={`p-2 rounded-lg border text-left text-xs font-medium transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-sky-50 border-sky-300 text-sky-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[11px]">{fmt}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reminder Preferences
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {reminderOptions.map(rem => {
                  const isSelected = (formData.reminder_preferences || []).includes(rem);
                  return (
                    <button
                      key={rem}
                      type="button"
                      onClick={() => handleToggleReminder(rem)}
                      className={`p-2 rounded-lg border text-left text-xs font-medium transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-sky-50 border-sky-300 text-sky-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[11px]">{rem}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: PROFILE CONFIRMATION & REVIEW */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Step 5: Profile Confirmation & Experience Assignment</span>
            </h3>

            <p className="text-xs text-slate-600">
              Please review your profile summary below before we route you to your dedicated dashboard.
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              {/* Experience Assignment Pill */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="font-semibold text-slate-600">Assigned Dashboard Experience:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  formData.experience_type === 'accessible'
                    ? 'bg-indigo-100 text-indigo-900 border-indigo-200'
                    : 'bg-sky-100 text-sky-900 border-sky-200'
                }`}>
                  {formData.experience_type === 'accessible'
                    ? 'Disability-Inclusive Athlete Experience'
                    : 'Standard Student-Athlete Experience'}
                </span>
              </div>

              {/* Summary Items */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[11px]">Name & Age:</span>
                  <span className="font-bold text-slate-800">{formData.display_name} ({formData.age} yrs)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Education & Exam Timeline:</span>
                  <span className="font-bold text-slate-800">{formData.education_level} • {formData.exam_period || 'Normal schedule'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Primary Sport & Level:</span>
                  <span className="font-bold text-slate-800">{formData.primary_sport} ({formData.skill_level})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Schedule Windows:</span>
                  <span className="font-bold text-slate-800">Train: {formData.training_availability} | Study: {formData.study_availability}</span>
                </div>
              </div>

              {(formData.short_term_sport_goals || formData.long_term_sport_goals) && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block text-[11px]">Personalized Athletic Goals:</span>
                  <p className="text-slate-800 text-[11px] font-medium mt-0.5">
                    {formData.short_term_sport_goals && <span>Short-term: {formData.short_term_sport_goals}</span>}
                    {formData.short_term_sport_goals && formData.long_term_sport_goals && <br />}
                    {formData.long_term_sport_goals && <span>Long-term: {formData.long_term_sport_goals}</span>}
                  </p>
                </div>
              )}

              {formData.improvement_areas && formData.improvement_areas.length > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block text-[11px]">Targeted Improvement Areas:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.improvement_areas.map(area => (
                      <span key={area} className="px-2 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-sky-900 text-[10px] font-medium">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {formData.platform_goals && formData.platform_goals.length > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block text-[11px]">Platform Support Priorities:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.platform_goals.map(goal => (
                      <span key={goal} className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-medium">
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {formData.experience_type === 'accessible' && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block text-[11px]">Requested Accommodations:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.accommodations.map(a => (
                      <span key={a} className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 text-[10px] font-medium">
                        {a}
                      </span>
                    ))}
                    {formData.other_accommodations && (
                      <span key="other" className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 text-[10px] font-medium">
                        {formData.other_accommodations}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-950 flex items-center justify-between">
              <span>Need to change anything?</span>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="font-bold text-sky-800 hover:underline flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Profile Answers</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                Skip for now
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold shadow-2xs transition"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmAndLaunch}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold shadow-md transition"
              >
                {submitting ? (
                  <span>Saving & Launching Dashboard...</span>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-sky-200" />
                    <span>Confirm & Launch Dashboard</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
