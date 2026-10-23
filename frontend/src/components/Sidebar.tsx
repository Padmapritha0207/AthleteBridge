import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Compass,
  Award,
  ShieldCheck,
  TrendingUp,
  Apple,
  Activity,
  HeartHandshake,
  MessageSquare,
  Settings,
  ShieldAlert,
  X,
  Sparkles,
  Accessibility
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen
}) => {
  const { activeRole, perspective } = useAuth();

  // Strict Navigation Separation based on User Perspective & Role
  let navItems: { id: string; label: string; icon: any; badge?: string }[] = [];

  if (activeRole === 'staff') {
    navItems = [
      { id: 'staff-dashboard', label: 'Staff Coordinator Console', icon: ShieldAlert, badge: 'Staff' },
      { id: 'support-bridge', label: 'SupportBridge Queue', icon: ShieldCheck, badge: 'Confidential' },
      { id: 'balance-ai', label: 'Calendar Conflicts', icon: CalendarDays },
      { id: 'coaches', label: 'Coach Directory', icon: Users },
      { id: 'opportunities', label: 'Opportunities & Events', icon: Compass },
      { id: 'settings', label: 'Settings & Privacy', icon: Settings }
    ];
  } else if (perspective === 'accessible') {
    // PERSPECTIVE B: Accessible & Adaptive Student-Athlete Navigation
    navItems = [
      { id: 'accessible-dashboard', label: 'Accessible Dashboard', icon: Accessibility, badge: 'Adaptive' },
      { id: 'balance-ai', label: 'Accessible Schedule Planner', icon: CalendarDays, badge: 'Buffers' },
      { id: 'support-bridge', label: 'SupportBridge Accommodations', icon: ShieldCheck, badge: 'Active' },
      { id: 'coaches', label: 'Adaptive Coach Finder', icon: Users },
      { id: 'training-recovery', label: 'Adaptive Training & Gear', icon: Activity },
      { id: 'opportunities', label: 'Inclusive Competitions', icon: Compass },
      { id: 'scholarships', label: 'Adaptive Grants & Aid', icon: Award },
      { id: 'dual-progress', label: 'Progress & Passport', icon: TrendingUp },
      { id: 'fuel-right', label: 'FuelRight Nutrition', icon: Apple },
      { id: 'mind-strong', label: 'MindStrong Wellbeing', icon: HeartHandshake },
      { id: 'athlete-connect', label: 'AthleteConnect', icon: MessageSquare },
      { id: 'settings', label: 'Settings & Privacy', icon: Settings }
    ];
  } else {
    // PERSPECTIVE A: Standard Student-Athlete Navigation (No disability-specific tabs)
    navItems = [
      { id: 'standard-dashboard', label: 'Standard Dashboard', icon: LayoutDashboard },
      { id: 'balance-ai', label: 'Education & Sports Planner', icon: CalendarDays, badge: 'Smart' },
      { id: 'coaches', label: 'Coach Finder', icon: Users },
      { id: 'training-recovery', label: 'Training & Performance', icon: Activity },
      { id: 'opportunities', label: 'Competitions & Meets', icon: Compass },
      { id: 'scholarships', label: 'Scholarship Finder', icon: Award },
      { id: 'dual-progress', label: 'Dual-Progress Tracking', icon: TrendingUp },
      { id: 'fuel-right', label: 'FuelRight Nutrition', icon: Apple },
      { id: 'mind-strong', label: 'MindStrong Wellbeing', icon: HeartHandshake },
      { id: 'athlete-connect', label: 'AthleteConnect', icon: MessageSquare },
      { id: 'settings', label: 'Settings & Privacy', icon: Settings }
    ];
  }

  const handleSelect = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static`}
        aria-label="Main Navigation"
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">
                ATHLETEBRIDGE
              </span>
              <span className="text-[10px] text-sky-400 font-medium block">
                Inclusive Athlete Development
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-sky-500"
            aria-label="Close navigation sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition text-left group focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-sky-700/80 text-sky-100'
                        : 'bg-slate-800 text-sky-400 group-hover:bg-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info & Disclaimer */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5">
          <p className="font-semibold text-slate-300">
            “One platform for every athlete.”
          </p>
          <p className="text-slate-400">
            Synthetic demo environment with accessible design standards.
          </p>
        </div>
      </aside>
    </>
  );
};
