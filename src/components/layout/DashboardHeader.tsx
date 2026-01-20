import React from 'react';
import { Menu, Bell, LogOut } from 'lucide-react';
import type { User } from '../../App'; // Importing the User interface defined in App.tsx

interface DashboardHeaderProps {
  user: User;
  onLogout: () => void;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DashboardHeader = ({ user, onLogout, setIsSidebarOpen }: DashboardHeaderProps) => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={() => setIsSidebarOpen(prev => !prev)} className="md:hidden text-slate-600">
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500">{user.instituteName || 'Institute'}</p>
          </div>
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
            {user.name[0]}
          </div>
          <button onClick={onLogout} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Logout">
            <LogOut className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;