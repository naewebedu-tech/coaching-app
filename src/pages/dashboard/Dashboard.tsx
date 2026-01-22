import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';
import OverviewPage from './OverviewPage';
import StudentsPage from './StudentsPage';
import AttendancePage from './AttendancePage';
import FeesPage from './FeesPage';
import ExamsPage from './ExamsPage';
import ReportsPage from './ReportsPage';
import useDashboardData from '../../hooks/useDashboardData';
import type { User } from '../../App';
import BatchesPage from './BatchesPage';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [currentView, setCurrentView] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  
  // 1. Central Data Fetching
  // This hook uses React Query to fetch all necessary data (Students, Batches, Fees, etc.)
  // automatically on mount. It passes this data down to sub-pages.
  const data = useDashboardData();

  // Handle mobile sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. View Router
  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return <OverviewPage user={user} data={data} />;
      case 'batches': // <--- ADD THIS CASE
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

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentView={currentView} 
        setCurrentView={(view) => {
          setCurrentView(view);
          // Auto-close sidebar on mobile when a link is clicked
          if (window.innerWidth < 768) setIsSidebarOpen(false);
        }} 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Layout */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Header */}
        <DashboardHeader 
          user={user} 
          onLogout={onLogout} 
          setIsSidebarOpen={setIsSidebarOpen}
        />
        
        {/* Scrollable Content Area */}
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