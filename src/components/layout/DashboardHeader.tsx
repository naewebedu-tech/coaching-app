// components/layout/DashboardHeader.tsx
import React from 'react';
import { Menu, Bell, LogOut, ChevronRight } from 'lucide-react';
import type { User } from '../../App';

const VIEW_LABELS: Record<string, string> = {
  overview:   'Overview',
  batches:    'Batches',
  students:   'Students',
  attendance: 'Attendance',
  fees:       'Fees',
  exams:      'Exams',
  reports:    'Reports',
};

interface DashboardHeaderProps {
  user: User;
  onLogout: () => void;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentView: string;
}

const DashboardHeader = ({ user, onLogout, setIsSidebarOpen, currentView }: DashboardHeaderProps) => {
  return (
    <header className="bg-white border-b border-slate-200 px-3 sm:px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-30 flex-shrink-0">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Sidebar toggle — visible on all sizes */}
        <button
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          className="flex-shrink-0 p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors touch-manipulation"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-slate-400 text-sm hidden sm:inline font-medium">Dashboard</span>
          <ChevronRight className="text-slate-300 w-3.5 h-3.5 hidden sm:inline flex-shrink-0" />
          <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
            {VIEW_LABELS[currentView] || 'Dashboard'}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors touch-manipulation">
          <Bell className="w-5 h-5 text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        {/* User info — hidden on xs */}
        <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 pl-2 sm:pl-3">
          <div className="text-right hidden md:block">
            <p className="text-xs font-semibold text-slate-900 leading-tight">{user.name}</p>
            <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[120px]">
              {user.institute_name || 'Institute Admin'}
            </p>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm border border-indigo-200 select-none flex-shrink-0">
            {user.name ? user.name[0].toUpperCase() : 'U'}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-slate-400 touch-manipulation"
          title="Logout"
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;