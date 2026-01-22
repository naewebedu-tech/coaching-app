import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import AuthModal from '../../components/auth/AuthModal';
import HomePage from './HomePage';
import FeaturesPage from './FeaturesPage';
import PricingPage from './PricingPage';
import TestimonialsPage from './TestimonialsPage';
import ContactPage from './ContactPage';

// Define the available page keys
export type PageKey = 'home' | 'features' | 'pricing' | 'testimonials' | 'contact';

interface MarketingWebsiteProps {
  // Updated to accept the full API response (user + tokens)
  onLogin: (data: any) => void;
}

const MarketingWebsite = ({ onLogin }: MarketingWebsiteProps) => {
  const [currentPage, setCurrentPage] = useState<PageKey>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  // Handle scroll effect for navbar transparency
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateTo = (page: PageKey) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar 
        scrolled={scrolled}
        currentPage={currentPage}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        navigateTo={navigateTo}
        openAuth={openAuth}
      />

      <main className="pt-20">
        {currentPage === 'home' && <HomePage navigateTo={navigateTo} openAuth={openAuth} />}
        {currentPage === 'features' && <FeaturesPage />}
        {currentPage === 'pricing' && <PricingPage openAuth={openAuth} />}
        {currentPage === 'testimonials' && <TestimonialsPage />}
        {currentPage === 'contact' && <ContactPage />}
      </main>

      {isAuthOpen && (
        <AuthModal 
          mode={authMode} 
          onClose={() => setIsAuthOpen(false)} 
          switchMode={setAuthMode}
          onLogin={onLogin}
        />
      )}

      <Footer />
    </div>
  );
};

export default MarketingWebsite;