// components/layout/Sidebar.tsx
import {
  GraduationCap, Home, Users, Calendar,
  DollarSign, BookOpen, BarChart3, Layers, X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

const menuItems: MenuItem[] = [
  { id: 'overview',   label: 'Overview',      icon: Home },
  { id: 'batches',    label: 'Batches',        icon: Layers },
  { id: 'students',   label: 'Students',       icon: Users },
  { id: 'attendance', label: 'Attendance',     icon: Calendar },
  { id: 'fees',       label: 'Fee Management', icon: DollarSign },
  { id: 'exams',      label: 'Exams',          icon: BookOpen },
  { id: 'reports',    label: 'Reports',        icon: BarChart3 },
];

const Sidebar = ({ currentView, setCurrentView, isSidebarOpen, setIsSidebarOpen }: SidebarProps) => {
  const handleClick = (viewId: string) => {
    setCurrentView(viewId);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Sidebar panel */}
      <aside
        className={`
          bg-slate-900 text-white flex-shrink-0 flex flex-col
          transition-all duration-300 ease-in-out
          
          /* Mobile: fixed overlay */
          fixed inset-y-0 left-0 z-30 
          lg:static lg:z-auto
          
          ${isSidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'}
          h-full
        `}
        style={{ height: '100dvh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-indigo-600 p-2 rounded-lg flex-shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            {isSidebarOpen && (
              <span className="font-bold text-base whitespace-nowrap truncate">
                CoachingApp
              </span>
            )}
          </div>
          {/* Close button — mobile only */}
          {isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {menuItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item.id)}
                title={!isSidebarOpen ? item.label : undefined}
                className={`
                  w-full flex items-center gap-3 rounded-lg
                  transition-all duration-150 touch-manipulation
                  ${isSidebarOpen ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center'}
                  ${isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }
                `}
              >
                <item.icon
                  size={20}
                  className="flex-shrink-0"
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                {isSidebarOpen && (
                  <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                )}
                {isSidebarOpen && item.badge && (
                  <span className="ml-auto text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 flex-shrink-0">
          {isSidebarOpen ? (
            <div className="text-xs text-slate-500 text-center">v1.0.0</div>
          ) : (
            <div className="h-4" />
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;