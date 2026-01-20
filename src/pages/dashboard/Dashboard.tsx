import { useState } from 'react';
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

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [currentView, setCurrentView] = useState<string>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const data = useDashboardData();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
      />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader 
          user={user} 
          onLogout={onLogout} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />
        
        <main className="flex-1 p-6 overflow-auto">
          {currentView === 'overview' && <OverviewPage user={user} data={data} />}
          {currentView === 'students' && <StudentsPage data={data} />}
          {currentView === 'attendance' && <AttendancePage data={data} />}
          {currentView === 'fees' && <FeesPage data={data} user={user} />}
          {currentView === 'exams' && <ExamsPage data={data} user={user} />}
          {currentView === 'reports' && <ReportsPage data={data} />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;