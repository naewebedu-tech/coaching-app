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
      <HeroSection openAuth={openAuth} navigateTo={navigateTo} />
      <SocialProof />
      <FeaturesGrid />
      <HowItWorks />
      <ROICalculator />
      <FAQSection />
    </div>
  );
};

export default HomePage;