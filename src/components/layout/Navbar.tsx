import { GraduationCap, Menu, X } from 'lucide-react';
import type { PageKey } from '../../pages/marketing/MarketingWebsite'; // Assuming PageKey is exported from here

interface NavbarProps {
  scrolled: boolean;
  currentPage: string;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  navigateTo: (page: PageKey) => void;
  openAuth: (mode: 'login' | 'signup') => void;
}

interface NavLink {
  id: PageKey;
  label: string;
}

const Navbar = ({ 
  scrolled, 
  currentPage, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen, 
  navigateTo, 
  openAuth 
}: NavbarProps) => {
  const navLinks: NavLink[] = [
    { id: 'home', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'testimonials', label: 'Stories' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
    }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigateTo('home')}>
          <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-700 transition-colors">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-indigo-500">
            CoachingApp
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => navigateTo(link.id)}
              className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
                currentPage === link.id ? 'text-indigo-600' : 'text-slate-600'
              }`}
            >
              {link.label}
            </button>
          ))}
          
          <div className="h-6 w-px bg-slate-300 mx-2"></div>

          <button onClick={() => openAuth('login')} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
            Login
          </button>
          
          <button onClick={() => openAuth('signup')} className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-800 transition-all hover:shadow-lg transform hover:-translate-y-0.5">
            Get Started Free
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-slate-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-slate-100 p-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => navigateTo(link.id)}
              className={`text-left text-base font-medium p-2 rounded-lg ${
                currentPage === link.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="border-t border-slate-100 my-2"></div>
          <button onClick={() => openAuth('login')} className="w-full text-left p-2 font-semibold text-slate-600">
            Login
          </button>
          <button onClick={() => openAuth('signup')} className="bg-indigo-600 text-white w-full py-3 rounded-lg font-semibold shadow-md">
            Get Started Free
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;