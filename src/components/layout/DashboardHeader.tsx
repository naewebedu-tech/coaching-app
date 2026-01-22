import React from 'react';
import { Menu, Bell, LogOut } from 'lucide-react';
import type { User } from '../../App';

interface DashboardHeaderProps {
  user: User;
  onLogout: () => void;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DashboardHeader = ({ user, onLogout, setIsSidebarOpen }: DashboardHeaderProps) => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {/* Sidebar Toggle */}
        <button 
          onClick={() => setIsSidebarOpen((prev) => !prev)} 
          className="text-slate-600 hover:text-slate-900 transition-colors p-1 hover:bg-slate-100 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900 hidden sm:block">Dashboard</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Notifications (Placeholder) */}
        <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        {/* User Profile */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">{user.name}</p>
            {/* Updated to match Django serializer: institute_name */}
            <p className="text-xs text-slate-500">{user.institute_name || 'Institute Admin'}</p>
          </div>
          
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold border border-indigo-200 select-none">
            {user.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          
          <button 
            onClick={onLogout} 
            className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-slate-500" 
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;