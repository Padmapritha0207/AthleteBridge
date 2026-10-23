import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AccessibilityPreferencesModal } from './AccessibilityPreferencesModal';
import { OnboardingModal } from './OnboardingModal';
import {
  Bell, Eye, Sliders, CheckCircle2, AlertTriangle,
  UserCheck, Shield, ChevronDown, Check, Sparkles, SlidersHorizontal,
  ClipboardList
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileNav: () => void;
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileNav, activeTab }) => {
  const {
    currentUser,
    activeRole,
    demoUsers,
    switchDemoUser,
    unreadCount,
    notifications,
    markNotificationAsRead,
    accessibility,
    perspective,
    switchPerspective,
    isOnboardingModalOpen,
    openOnboardingModal,
    closeOnboardingModal
  } = useAuth();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [isA11yModalOpen, setIsA11yModalOpen] = useState(false);

  // Check if any non-default accessibility preference is currently active
  const hasActiveA11ySettings =
    accessibility.highContrast ||
    accessibility.textSize !== 'normal' ||
    accessibility.reducedMotion ||
    accessibility.layoutDensity !== 'standard' ||
    accessibility.enhancedFocus ||
    accessibility.dyslexicFont;

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 lg:px-8 py-3 flex items-center justify-between shadow-2xs">
        {/* Mobile Menu Trigger & Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileNav}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-sky-600"
            aria-label="Open mobile navigation"
          >
            <Sliders className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg lg:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 capitalize">
              {activeTab.replace('-', ' ')}
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              One platform for every athlete. Personalized support for every ability.
            </p>
          </div>
        </div>

        {/* Right Controls: Track Indicator, Questionnaire, Display & Access, Notifications, Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Track Badge (Informational only - strict dashboard separation enforced) */}
          {activeRole === 'athlete' && (
            <span
              className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${
                perspective === 'accessible'
                  ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                  : 'bg-sky-50 text-sky-900 border-sky-200'
              }`}
              title={
                perspective === 'accessible'
                  ? 'Assigned to Accessible & Adaptive Athlete Experience'
                  : 'Assigned to Standard Student-Athlete Experience'
              }
            >
              <span className={`w-2 h-2 rounded-full ${perspective === 'accessible' ? 'bg-indigo-600' : 'bg-sky-600'}`} />
              <span>{perspective === 'accessible' ? 'Accessible Track' : 'Standard Track'}</span>
            </span>
          )}

          {/* Onboarding Questionnaire Re-trigger */}
          <button
            type="button"
            onClick={openOnboardingModal}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition focus-visible:ring-2 focus-visible:ring-sky-600"
            title="Open Initial Onboarding Questionnaire to re-personalize profile and goals"
          >
            <ClipboardList className="w-3.5 h-3.5 text-sky-700 shrink-0" />
            <span className="hidden lg:inline">Questionnaire</span>
          </button>

          {/* Experience B: Customize Display & Access (Prominent & Accessible) */}
          <button
            type="button"
            onClick={() => setIsA11yModalOpen(true)}
            className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-medium transition focus-visible:ring-2 focus-visible:ring-sky-600 ${
              hasActiveA11ySettings
                ? 'border-sky-300 bg-sky-50/80 text-sky-900 font-semibold'
                : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700'
            }`}
            aria-label="Open accessibility and display preferences"
            title="Adjust text size, high contrast, layout spacing, and reading assistance"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-sky-700 shrink-0" />
            <span className="hidden sm:inline">Customize Experience</span>
            <span className="sm:hidden">Display</span>
            {hasActiveA11ySettings && (
              <span className="w-2 h-2 rounded-full bg-sky-600" title="Custom preferences active" />
            )}
          </button>

          {/* Conspicuous Demo Badge */}
          <span
            className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200"
            title="Fictional seed data for evaluation only. No real medical or academic records stored."
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Prototype Demo</span>
          </span>

        {/* Notifications Center */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowRoleMenu(false);
            }}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus-visible:ring-2 focus-visible:ring-sky-600"
            aria-label={`Notifications: ${unreadCount} unread`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs bg-sky-100 text-sky-800 font-semibold rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">Demo alerts</span>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No notifications.</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition ${
                        n.is_read
                          ? 'bg-white border-slate-100 text-slate-600'
                          : 'bg-sky-50/60 border-sky-100 text-slate-900 font-medium'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-sky-900">{n.title}</span>
                        {!n.is_read && <span className="w-2 h-2 rounded-full bg-sky-600 shrink-0 mt-1" />}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Demo Persona / Role Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowNotifMenu(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition text-left focus-visible:ring-2 focus-visible:ring-sky-600"
            aria-expanded={showRoleMenu}
            aria-label="Switch demo persona"
          >
            <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {currentUser?.avatar_initials || 'AB'}
            </div>
            <div className="hidden sm:block text-xs leading-tight">
              <div className="font-semibold text-slate-800 flex items-center gap-1">
                {currentUser?.display_name || 'Loading...'}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-[11px] text-sky-700 font-medium capitalize">
                Role: {activeRole}
              </div>
            </div>
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 max-h-[85vh] overflow-y-auto">
              <div className="px-2 py-1.5 mb-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>Switch Demo Persona</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Experience dynamic content personalization across all 4 benchmark test profiles
                </p>
              </div>

              {/* Group 1: Benchmark Profiles A, B, C, D */}
              <div className="mb-2">
                <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider px-2 block mb-1">
                  Seva Challenge Benchmark Profiles
                </span>
                <div className="space-y-1">
                  {demoUsers.filter(u => [5, 6, 7, 8].includes(u.id)).map(u => {
                    const isCurrent = currentUser?.id === u.id;
                    const subtext =
                      u.id === 5 ? 'College Badminton • Standard Track (Alex Chen)' :
                      u.id === 6 ? 'High School Swimmer • Standard Track (Samira Patel)' :
                      u.id === 7 ? 'Wheelchair Basketball • Accessible Track (Tariq Malik)' :
                      'College VI Track & Field • Accessible Track (Zoe Rivera)';

                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          switchDemoUser(u.id);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition border ${
                          isCurrent
                            ? 'bg-sky-50 border-sky-200 text-sky-950 font-semibold'
                            : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-7 h-7 rounded-lg text-[11px] font-bold flex items-center justify-center shrink-0 ${
                            [7, 8].includes(u.id)
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}>
                            {u.avatar_initials}
                          </span>
                          <div>
                            <p className="text-xs font-semibold leading-tight text-slate-900">{u.display_name}</p>
                            <p className="text-[10px] text-slate-500 line-clamp-1">{subtext}</p>
                          </div>
                        </div>
                        {isCurrent && <Check className="w-4 h-4 text-sky-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Group 2: Baseline Athletes */}
              <div className="mb-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 block mb-1">
                  Baseline Athlete Personas
                </span>
                <div className="space-y-1">
                  {demoUsers.filter(u => [1, 2].includes(u.id)).map(u => {
                    const isCurrent = currentUser?.id === u.id;
                    const subtext =
                      u.id === 1 ? 'Wheelchair Racing (T54) • Accessible Track' :
                      'Varsity Swimming & Pre-Med • Standard Track';

                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          switchDemoUser(u.id);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition border ${
                          isCurrent
                            ? 'bg-sky-50 border-sky-200 text-sky-950 font-semibold'
                            : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                            {u.avatar_initials}
                          </span>
                          <div>
                            <p className="text-xs font-semibold leading-tight text-slate-900">{u.display_name}</p>
                            <p className="text-[10px] text-slate-500 line-clamp-1">{subtext}</p>
                          </div>
                        </div>
                        {isCurrent && <Check className="w-4 h-4 text-sky-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Group 3: Institutional Roles */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 block mb-1">
                  Staff & Coaching
                </span>
                <div className="space-y-1">
                  {demoUsers.filter(u => [3, 4].includes(u.id)).map(u => {
                    const isCurrent = currentUser?.id === u.id;
                    const subtext =
                      u.id === 3 ? 'Athletic Department Academic Advisor' :
                      'Head Varsity & Paralympic S&C Coach';

                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          switchDemoUser(u.id, u.role);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition border ${
                          isCurrent
                            ? 'bg-sky-50 border-sky-200 text-sky-950 font-semibold'
                            : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                            {u.avatar_initials}
                          </span>
                          <div>
                            <p className="text-xs font-semibold leading-tight text-slate-900">{u.display_name}</p>
                            <p className="text-[10px] text-slate-500 line-clamp-1">{subtext}</p>
                          </div>
                        </div>
                        {isCurrent && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>

    <AccessibilityPreferencesModal
      isOpen={isA11yModalOpen}
      onClose={() => setIsA11yModalOpen(false)}
    />

    <OnboardingModal
      isOpen={isOnboardingModalOpen}
      onClose={closeOnboardingModal}
    />
  </>
  );
};

