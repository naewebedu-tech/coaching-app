// components/layout/BottomNav.tsx
import { Home, Users, Calendar, DollarSign, BookOpen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  setView: (view: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview',   label: 'Home',       icon: Home },
  { id: 'students',   label: 'Students',   icon: Users },
  { id: 'attendance', label: 'Attendance', icon: Calendar },
  { id: 'fees',       label: 'Fees',       icon: DollarSign },
  { id: 'exams',      label: 'Exams',      icon: BookOpen },
];

const BottomNav = ({ currentView, setView }: BottomNavProps) => {
  return (
    // md:hidden hides it on desktop; safe-area-inset handles iPhone notch
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`
                flex-1 flex flex-col items-center justify-center gap-0.5 
                transition-colors duration-150 relative
                active:scale-95 touch-manipulation
                ${isActive ? 'text-indigo-600' : 'text-slate-400'}
              `}
            >
              {/* Active indicator pill */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-600 rounded-b-full" />
              )}
              <item.icon
                size={22}
                strokeWidth={isActive ? 2.2 : 1.8}
                className={isActive ? 'text-indigo-600' : 'text-slate-400'}
              />
              <span className={`text-[10px] font-medium leading-none ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;