import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

// Pages
import { StandardDashboardPage } from './pages/StandardDashboardPage';
import { AccessibleDashboardPage } from './pages/AccessibleDashboardPage';
import { OverviewPage } from './pages/OverviewPage';
import { BalanceAIPage } from './pages/BalanceAIPage';
import { CoachesPage } from './pages/CoachesPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { ScholarshipsPage } from './pages/ScholarshipsPage';
import { SupportBridgePage } from './pages/SupportBridgePage';
import { DualProgressPage } from './pages/DualProgressPage';
import { FuelRightPage } from './pages/FuelRightPage';
import { TrainingRecoveryPage } from './pages/TrainingRecoveryPage';
import { MindStrongPage } from './pages/MindStrongPage';
import { AthleteConnectPage } from './pages/AthleteConnectPage';
import { SettingsPrivacyPage } from './pages/SettingsPrivacyPage';
import { StaffDashboardPage } from './pages/StaffDashboardPage';

const AppContent: React.FC = () => {
  const { perspective, activeRole } = useAuth();

  const getInitialTab = () => {
    if (activeRole === 'staff') return 'staff-dashboard';
    return perspective === 'accessible' ? 'accessible-dashboard' : 'standard-dashboard';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab());
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  // Strict Dashboard Guard: enforce complete separation between Standard and Accessible Dashboards
  useEffect(() => {
    if (activeRole === 'athlete') {
      if (perspective === 'standard' && (activeTab === 'accessible-dashboard' || activeTab === 'overview')) {
        setActiveTab('standard-dashboard');
      } else if (perspective === 'accessible' && (activeTab === 'standard-dashboard' || activeTab === 'overview')) {
        setActiveTab('accessible-dashboard');
      }
    }
  }, [perspective, activeRole, activeTab]);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'standard-dashboard':
        return <StandardDashboardPage setActiveTab={setActiveTab} />;
      case 'accessible-dashboard':
        return <AccessibleDashboardPage setActiveTab={setActiveTab} />;
      case 'overview':
        return perspective === 'accessible' ? (
          <AccessibleDashboardPage setActiveTab={setActiveTab} />
        ) : (
          <StandardDashboardPage setActiveTab={setActiveTab} />
        );
      case 'balance-ai':
        return <BalanceAIPage setActiveTab={setActiveTab} />;
      case 'coaches':
        return <CoachesPage />;
      case 'opportunities':
        return <OpportunitiesPage setActiveTab={setActiveTab} />;
      case 'scholarships':
        return <ScholarshipsPage />;
      case 'support-bridge':
        return <SupportBridgePage />;
      case 'dual-progress':
        return <DualProgressPage />;
      case 'fuel-right':
        return <FuelRightPage />;
      case 'training-recovery':
        return <TrainingRecoveryPage />;
      case 'mind-strong':
        return <MindStrongPage />;
      case 'athlete-connect':
        return <AthleteConnectPage />;
      case 'settings':
        return <SettingsPrivacyPage />;
      case 'staff-dashboard':
        return <StaffDashboardPage />;
      default:
        return perspective === 'accessible' ? (
          <AccessibleDashboardPage setActiveTab={setActiveTab} />
        ) : (
          <StandardDashboardPage setActiveTab={setActiveTab} />
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileNavOpen}
        setMobileOpen={setMobileNavOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onToggleMobileNav={() => setMobileNavOpen(true)}
          activeTab={activeTab}
        />

        <main id="main-content" tabIndex={-1} className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto outline-none">
          {renderActivePage()}
        </main>

        <footer className="py-6 border-t border-slate-200 bg-white/70 px-4 sm:px-8 text-center text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">
            ATHLETEBRIDGE — “One platform for every athlete. Personalized support for every ability.”
          </p>
          <p className="text-[11px] text-slate-400">
            Synthetic demo data prototype for hackathon judging & evaluation. Non-clinical, non-diagnostic guidance only.
          </p>
        </footer>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
