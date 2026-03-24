import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';
import OverviewPage from './OverviewPage';
import StudentsPage from './StudentsPage';
import AttendancePage from './AttendancePage';
import FeesPage from './FeesPage';
import ExamsPage from './ExamsPage';
import ReportsPage from './ReportsPage';
import BatchesPage from './BatchesPage';
import useDashboardData from '../../hooks/useDashboardData';
import type { User } from '../../App';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [currentView, setCurrentView] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  const data = useDashboardData();

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return <OverviewPage user={user} data={data} />;
      case 'batches':
        return <BatchesPage data={data} />;
      case 'students':
        return <StudentsPage data={data} />;
      case 'attendance':
        return <AttendancePage data={data} />;
      case 'fees':
        return <FeesPage user={user} data={data} />;
      case 'exams':
        return <ExamsPage user={user} data={data} />;
      case 'reports':
        return <ReportsPage data={data} />;
      default:
        return <OverviewPage user={user} data={data} />;
    }
  };

  const handleSetView = (view: string) => {
    setCurrentView(view);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        currentView={currentView}
        setCurrentView={handleSetView}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <DashboardHeader
          user={user}
          onLogout={onLogout}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto pb-10">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;