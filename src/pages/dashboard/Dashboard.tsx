// pages/dashboard/Dashboard.tsx
import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';
import BottomNav from '../../components/layout/BottomNav';
import OverviewPage from './OverviewPage';
import StudentsPage from './StudentsPage';
import AttendancePage from './AttendancePage';
import FeesPage from './FeesPage';
import ExamsPage from './ExamsPage';
import ReportsPage from './ReportsPage';
import BatchesPage from './BatchesPage';
import useDashboardData from '../../hooks/useDashboardData';
import { usePWA } from '../../hooks/usePWA';
import type { User } from '../../App';
import { WifiOff, Download, X } from 'lucide-react';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

// Parse ?view= from URL for PWA shortcuts
const getViewFromUrl = (): string => {
  const params = new URLSearchParams(window.location.search);
  return params.get('view') || 'overview';
};

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [currentView, setCurrentView] = useState(getViewFromUrl);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const data = useDashboardData();
  const { isOnline, canInstall, promptInstall, isInstalled } = usePWA();

  // Show install banner after 30s if installable
  useEffect(() => {
    if (canInstall && !isInstalled) {
      const timer = setTimeout(() => setShowInstallBanner(true), 30000);
      return () => clearTimeout(timer);
    }
  }, [canInstall, isInstalled]);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update URL when view changes (for PWA shortcuts)
  useEffect(() => {
    const url = new URL(window.location.href);
    if (currentView !== 'overview') {
      url.searchParams.set('view', currentView);
    } else {
      url.searchParams.delete('view');
    }
    window.history.replaceState({}, '', url.toString());
  }, [currentView]);

  const handleSetView = (view: string) => {
    setCurrentView(view);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'overview':    return <OverviewPage user={user} data={data} setView={handleSetView} />;
      case 'batches':     return <BatchesPage data={data} />;
      case 'students':    return <StudentsPage data={data} />;
      case 'attendance':  return <AttendancePage data={data} />;
      case 'fees':        return <FeesPage user={user} data={data} />;
      case 'exams':       return <ExamsPage user={user} data={data} />;
      case 'reports':     return <ReportsPage data={data} />;
      default:            return <OverviewPage user={user} data={data} setView={handleSetView} />;
    }
  };

  const handleInstall = async () => {
    await promptInstall();
    setShowInstallBanner(false);
  };

  return (
    <div className="flex h-[100dvh] bg-slate-50 overflow-hidden">
      {/* Sidebar — hidden on mobile, shown on lg+ */}
      <Sidebar
        currentView={currentView}
        setCurrentView={handleSetView}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Sidebar backdrop for mobile */}
      {isSidebarOpen && window.innerWidth < 1024 && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Offline banner */}
        {!isOnline && (
          <div className="bg-amber-500 text-white px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 flex-shrink-0">
            <WifiOff size={14} />
            You're offline — showing cached data
          </div>
        )}

        {/* PWA install banner */}
        {showInstallBanner && (
          <div className="bg-indigo-600 text-white px-4 py-2.5 flex items-center justify-between flex-shrink-0 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Download size={16} />
              <span className="font-medium">Install CoachingApp</span>
              <span className="text-indigo-200 hidden sm:inline">for faster access & offline use</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstall}
                className="bg-white text-indigo-600 text-xs font-bold px-3 py-1 rounded-full hover:bg-indigo-50 transition-colors"
              >
                Install
              </button>
              <button onClick={() => setShowInstallBanner(false)} className="text-indigo-200 hover:text-white">
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <DashboardHeader
          user={user}
          onLogout={onLogout}
          setIsSidebarOpen={setIsSidebarOpen}
          currentView={currentView}
        />

        {/* Main scrollable area — pb accounts for bottom nav on mobile */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Bottom Navigation — mobile only */}
      <BottomNav currentView={currentView} setView={handleSetView} />
    </div>
  );
};

export default Dashboard;