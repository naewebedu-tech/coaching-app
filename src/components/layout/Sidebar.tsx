import { GraduationCap, Home, Users, Calendar, DollarSign, BookOpen, BarChart3, type LucideIcon } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isSidebarOpen: boolean;
  // 1. Add the missing prop definition here
  setIsSidebarOpen: (isOpen: boolean) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

// 2. Destructure the prop here
const Sidebar = ({ currentView, setCurrentView, isSidebarOpen, setIsSidebarOpen }: SidebarProps) => {
  const menuItems: MenuItem[] = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'fees', label: 'Fee Management', icon: DollarSign },
    { id: 'exams', label: 'Exams', icon: BookOpen },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  const handleMenuClick = (viewId: string) => {
    setCurrentView(viewId);
    // Optional: Close sidebar automatically on mobile when a link is clicked
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <aside className={`bg-slate-900 text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0 md:w-20'} overflow-hidden flex-shrink-0`}>
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg flex-shrink-0">
          <GraduationCap className="w-6 h-6" />
        </div>
        {isSidebarOpen && <span className="font-bold text-lg whitespace-nowrap">CoachingApp</span>}
      </div>
      
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
              currentView === item.id ? 'bg-indigo-600' : 'hover:bg-slate-800'
            }`}
            title={!isSidebarOpen ? item.label : ''}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;