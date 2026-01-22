// import React from 'react';
import HeroSection from '../../sections/HeroSection';
import SocialProof from '../../sections/SocialProof';
import FeaturesGrid from '../../sections/FeaturesGrid';
import HowItWorks from '../../sections/HowItWorks';
import ROICalculator from '../../sections/ROICalculator';
import FAQSection from '../../sections/FAQSection';
import type { PageKey } from './MarketingWebsite';

interface HomePageProps {
  navigateTo: (page: PageKey) => void;
  openAuth: (mode: 'login' | 'signup') => void;
}

const HomePage = ({ navigateTo, openAuth }: HomePageProps) => {
  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero Section:
        Includes the main CTA and the interactive Dashboard Preview mockup 
      */}
      <HeroSection openAuth={openAuth} navigateTo={navigateTo} />
      
      {/* Social Proof:
        "Trusted by 500+ Institutes" logos 
      */}
      <SocialProof />
      
      {/* Features Grid:
        High-level overview cards (AI Attendance, Fee Manager, etc.)
      */}
      <FeaturesGrid />
      
      {/* How It Works:
        3-step process (Create Batch -> Add Students -> Automate)
      */}
      <HowItWorks />
      
      {/* ROI Calculator:
        Interactive slider to show time/money saved
      */}
      <ROICalculator />
      
      {/* FAQ:
        Common questions accordion
      */}
      <FAQSection />
    </div>
  );
};

export default HomePage;