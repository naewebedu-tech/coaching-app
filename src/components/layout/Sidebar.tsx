// import React from 'react';
import { 
  GraduationCap, 
  Home, 
  Users, 
  Calendar, 
  DollarSign, 
  BookOpen, 
  BarChart3,
  Layers
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isSidebarOpen: boolean;
  // Properly typed to accept the state setter from Dashboard.tsx
  setIsSidebarOpen: (isOpen: boolean) => void; 
}

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const Sidebar = ({ currentView, setCurrentView, isSidebarOpen, setIsSidebarOpen }: SidebarProps) => {
  const menuItems: MenuItem[] = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'batches', label: 'Batches', icon: Layers },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'fees', label: 'Fee Management', icon: DollarSign },
    { id: 'exams', label: 'Exams', icon: BookOpen },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  const handleMenuClick = (viewId: string) => {
    setCurrentView(viewId);
    // On mobile, auto-close sidebar when a menu item is clicked
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <aside 
      className={`
        bg-slate-900 text-white transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'w-64' : 'w-0 md:w-20'} 
        overflow-hidden flex-shrink-0 flex flex-col h-full
      `}
    >
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg flex-shrink-0">
          <GraduationCap className="w-6 h-6" />
        </div>
        {isSidebarOpen && (
          <span className="font-bold text-lg whitespace-nowrap animate-in fade-in duration-300">
            CoachingApp
          </span>
        )}
      </div>
      
      {/* Navigation Links */}
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item.id)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all whitespace-nowrap
              ${currentView === item.id 
                ? 'bg-indigo-600 shadow-md shadow-indigo-900/20' 
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }
            `}
            title={!isSidebarOpen ? item.label : ''}
          >
            <item.icon className={`w-5 h-5 flex-shrink-0 ${currentView === item.id ? 'text-white' : ''}`} />
            {isSidebarOpen && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Optional: Bottom/Footer area of sidebar */}
      <div className="p-4 border-t border-slate-800">
        {isSidebarOpen ? (
          <div className="text-xs text-slate-500 text-center">
            v1.0.0
          </div>
        ) : (
          <div className="h-4"></div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;