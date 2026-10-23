import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User, Role, AthleteProfile, AthleteSupportPreference, DemoUserOption,
  NotificationItem, AthletePerspective, OnboardingData
} from '../types';
import { api } from '../services/api';

export type TextSize = 'standard' | 'medium' | 'large' | 'xlarge';
export type LayoutDensity = 'standard' | 'comfortable' | 'simplified';

export interface AccessibilityPreferences {
  textSize: TextSize;
  highContrast: boolean;
  reducedMotion: boolean;
  layoutDensity: LayoutDensity;
  enhancedFocus: boolean;
  dyslexicFont: boolean;
  screenReaderAids: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  activeRole: Role;
  profile: AthleteProfile | null;
  supportPreference: AthleteSupportPreference | null;
  unreadCount: number;
  demoUsers: DemoUserOption[];
  switchDemoUser: (userId: number, roleOverride?: Role) => Promise<void>;
  refreshIdentity: () => Promise<void>;
  notifications: NotificationItem[];
  markNotificationAsRead: (id: number) => Promise<void>;
  
  // Perspective Personalization (A: Standard vs B: Accessible)
  perspective: AthletePerspective;
  switchPerspective: (perspective: AthletePerspective) => void;

  // Onboarding Questionnaire
  onboardingCompleted: boolean;
  isOnboardingModalOpen: boolean;
  openOnboardingModal: () => void;
  closeOnboardingModal: () => void;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  onboardingData: OnboardingData | null;

  // Accessibility Preferences
  accessibility: AccessibilityPreferences;
  setTextSize: (size: TextSize) => void;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  setLayoutDensity: (density: LayoutDensity) => void;
  toggleEnhancedFocus: () => void;
  toggleDyslexicFont: () => void;
  toggleScreenReaderAids: () => void;
  resetAccessibility: () => void;
}

const defaultAccessibility: AccessibilityPreferences = {
  textSize: 'standard',
  highContrast: false,
  reducedMotion: false,
  layoutDensity: 'standard',
  enhancedFocus: true, // Visible focus enabled by default for usability
  dyslexicFont: false,
  screenReaderAids: false
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<Role>(
    (localStorage.getItem('ab_demo_role') as Role) || 'athlete'
  );
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [supportPreference, setSupportPreference] = useState<AthleteSupportPreference | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [demoUsers, setDemoUsers] = useState<DemoUserOption[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Perspective State (Perspective A: Standard vs Perspective B: Accessible)
  const [perspective, setPerspective] = useState<AthletePerspective>('standard');
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(true);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState<boolean>(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);

  // Load accessibility preferences from localStorage or OS defaults
  const [accessibility, setAccessibility] = useState<AccessibilityPreferences>(() => {
    try {
      const saved = localStorage.getItem('ab_accessibility_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved accessibility preferences', e);
    }

    // Detect OS preferences
    const prefersReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersContrast = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-contrast: more)').matches;

    return {
      ...defaultAccessibility,
      reducedMotion: prefersReducedMotion,
      highContrast: prefersContrast
    };
  });

  const savePreferences = (prefs: AccessibilityPreferences) => {
    setAccessibility(prefs);
    try {
      localStorage.setItem('ab_accessibility_v2', JSON.stringify(prefs));
    } catch (e) {
      console.warn('Failed to save accessibility preferences', e);
    }
  };

  const setTextSize = (size: TextSize) => {
    savePreferences({ ...accessibility, textSize: size });
  };

  const toggleHighContrast = () => {
    savePreferences({ ...accessibility, highContrast: !accessibility.highContrast });
  };

  const toggleReducedMotion = () => {
    savePreferences({ ...accessibility, reducedMotion: !accessibility.reducedMotion });
  };

  const setLayoutDensity = (density: LayoutDensity) => {
    savePreferences({ ...accessibility, layoutDensity: density });
  };

  const toggleEnhancedFocus = () => {
    savePreferences({ ...accessibility, enhancedFocus: !accessibility.enhancedFocus });
  };

  const toggleDyslexicFont = () => {
    savePreferences({ ...accessibility, dyslexicFont: !accessibility.dyslexicFont });
  };

  const toggleScreenReaderAids = () => {
    savePreferences({ ...accessibility, screenReaderAids: !accessibility.screenReaderAids });
  };

  const resetAccessibility = () => {
    savePreferences(defaultAccessibility);
  };

  const loadIdentity = async () => {
    try {
      const [meRes, usersRes, notifsRes] = await Promise.all([
        api.getMe(),
        api.getDemoUsers(),
        api.getNotifications()
      ]);

      setCurrentUser(meRes.user);
      setActiveRole(meRes.active_role as Role);
      setProfile(meRes.profile);
      setSupportPreference(meRes.support_preference);
      setUnreadCount(meRes.unread_notifications);
      setDemoUsers(usersRes);
      setNotifications(notifsRes);

      // Resolve perspective from storage or adaptive support presence
      const savedPersp = localStorage.getItem(`ab_perspective_${meRes.user.id}`) as AthletePerspective | null;
      const isJordan = meRes.user.id === 1;
      const desc = meRes.support_preference?.optional_needs_description?.toLowerCase() || '';
      const hasAdaptiveSupport =
        desc.includes('accessible') ||
        desc.includes('wheelchair') ||
        desc.includes('ramp') ||
        desc.includes('visual') ||
        desc.includes('hearing') ||
        desc.includes('adaptive');

      const resolvedPerspective: AthletePerspective =
        savedPersp ||
        (meRes.profile?.experience_type as AthletePerspective) ||
        (isJordan || hasAdaptiveSupport ? 'accessible' : 'standard');
      setPerspective(resolvedPerspective);

      // Check onboarding completion
      const completed = localStorage.getItem(`ab_onboarding_completed_${meRes.user.id}`) === 'true';
      setOnboardingCompleted(completed);

      // Trigger onboarding automatically on very first visit if not yet completed
      const hasVisited = localStorage.getItem('ab_visited_flag');
      if (!completed && !hasVisited) {
        setIsOnboardingModalOpen(true);
        localStorage.setItem('ab_visited_flag', 'true');
      }

      // Load saved onboarding answers if any
      try {
        const savedData = localStorage.getItem(`ab_onboarding_data_${meRes.user.id}`);
        if (savedData) setOnboardingData(JSON.parse(savedData));
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.error('Failed to load user identity context:', err);
    }
  };

  useEffect(() => {
    loadIdentity();
  }, []);

  const switchPerspective = (newPerspective: AthletePerspective) => {
    setPerspective(newPerspective);
    const uid = currentUser?.id || 1;
    localStorage.setItem(`ab_perspective_${uid}`, newPerspective);
  };

  const completeOnboarding = async (data: OnboardingData) => {
    const targetPersp =
      data.experience_type ||
      (data.accessibility_status === 'requires_support' || data.accommodations.length > 0 ? 'accessible' : 'standard');

    try {
      const res = await api.submitOnboarding(data);
      if (res.user) setCurrentUser(res.user);
      if (res.profile) setProfile(res.profile);
      if (res.support_preference) setSupportPreference(res.support_preference);

      const chosenPersp = res.perspective || targetPersp;
      setPerspective(chosenPersp);
      const uid = res.user?.id || currentUser?.id || 1;
      localStorage.setItem(`ab_perspective_${uid}`, chosenPersp);
      localStorage.setItem(`ab_onboarding_completed_${uid}`, 'true');
      localStorage.setItem(`ab_onboarding_data_${uid}`, JSON.stringify(data));
    } catch (err: any) {
      console.warn('Backend onboarding sync warning, proceeding with local persistence fallback:', err);
      // Fallback local persistence
      const uid = currentUser?.id || 1;
      setPerspective(targetPersp);
      localStorage.setItem(`ab_perspective_${uid}`, targetPersp);
      localStorage.setItem(`ab_onboarding_completed_${uid}`, 'true');
      localStorage.setItem(`ab_onboarding_data_${uid}`, JSON.stringify(data));

      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          display_name: data.display_name || currentUser.display_name
        });
      }
      if (profile) {
        setProfile({
          ...profile,
          primary_sport: data.primary_sport,
          academic_level: data.education_level,
          skill_level: data.skill_level,
          goals: data.sporting_goals || data.academic_goals || data.primary_goal || profile.goals
        });
      }
    } finally {
      setOnboardingData(data);
      setOnboardingCompleted(true);
      setIsOnboardingModalOpen(false);

      // Auto-adapt display if accommodations indicate visual/reading assistance
      if (data.accommodations.includes('Visual assistance and screen-reader compatibility')) {
        savePreferences({
          ...accessibility,
          textSize: 'large',
          enhancedFocus: true,
          screenReaderAids: true
        });
      } else if (
        data.accommodations.includes('Wheelchair-accessible venues') ||
        data.accommodations.includes('Personal assistance')
      ) {
        savePreferences({
          ...accessibility,
          layoutDensity: 'comfortable',
          enhancedFocus: true
        });
      }
    }
  };

  const switchDemoUser = async (userId: number, roleOverride?: Role) => {
    const targetUser = demoUsers.find(u => u.id === userId);
    const chosenRole = roleOverride || (targetUser ? targetUser.role : 'athlete');

    localStorage.setItem('ab_demo_user_id', String(userId));
    localStorage.setItem('ab_demo_role', chosenRole);

    setActiveRole(chosenRole);
    await loadIdentity();
  };

  const markNotificationAsRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  // Build root class string based on active accessibility preferences
  const getTextSizeClass = () => {
    switch (accessibility.textSize) {
      case 'medium': return 'text-size-medium';
      case 'large': return 'text-size-large';
      case 'xlarge': return 'text-size-xlarge';
      default: return 'text-size-standard';
    }
  };

  const getDensityClass = () => {
    switch (accessibility.layoutDensity) {
      case 'comfortable': return 'density-comfortable';
      case 'simplified': return 'density-simplified';
      default: return 'density-standard';
    }
  };

  const rootClasses = [
    'min-h-screen app-shell',
    getTextSizeClass(),
    getDensityClass(),
    accessibility.highContrast ? 'theme-high-contrast' : 'theme-default',
    accessibility.reducedMotion ? 'motion-reduce-active' : '',
    accessibility.enhancedFocus ? 'focus-enhanced' : '',
    accessibility.dyslexicFont ? 'font-dyslexic' : ''
  ].filter(Boolean).join(' ');

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeRole,
        profile,
        supportPreference,
        unreadCount,
        demoUsers,
        switchDemoUser,
        refreshIdentity: loadIdentity,
        notifications,
        markNotificationAsRead,
        perspective,
        switchPerspective,
        onboardingCompleted,
        isOnboardingModalOpen,
        openOnboardingModal: () => setIsOnboardingModalOpen(true),
        closeOnboardingModal: () => setIsOnboardingModalOpen(false),
        completeOnboarding,
        onboardingData,
        accessibility,
        setTextSize,
        toggleHighContrast,
        toggleReducedMotion,
        setLayoutDensity,
        toggleEnhancedFocus,
        toggleDyslexicFont,
        toggleScreenReaderAids,
        resetAccessibility
      }}
    >
      <div className={rootClasses}>
        {children}
      </div>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
