import { CheckCircle } from 'lucide-react';

interface PricingPageProps {
  openAuth: (mode: 'login' | 'signup') => void;
}

const PricingPage = ({ openAuth }: PricingPageProps) => {
  return (
    <div className="py-20 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-bold mb-4 text-slate-900">Simple, Transparent Pricing</h1>
          <p className="text-lg text-slate-600">Start for free, upgrade as you grow. No hidden charges.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <PricingCard 
            title="Starter" 
            price="$0" 
            period="/forever" 
            features={[
              "Up to 2 Batches",
              "Max 50 Students",
              "Manual Attendance",
              "Basic Fee Tracking",
              "Local Storage Only"
            ]}
            cta="Start Free"
            onClick={() => openAuth('signup')}
          />

          <PricingCard 
            title="Pro Institute" 
            price="$29" 
            period="/month" 
            highlighted={true}
            features={[
              "Unlimited Batches",
              "Unlimited Students",
              "AI Camera Attendance",
              "Exam Portal & Reports",
              "Cloud Sync & Backups",
              "WhatsApp Reminders"
            ]}
            cta="Get Pro"
            onClick={() => openAuth('signup')}
          />

          <PricingCard 
            title="Enterprise" 
            price="$99" 
            period="/month" 
            features={[
              "Multi-branch Support",
              "White-label App",
              "Dedicated Account Manager",
              "API Access",
              "Custom Feature Requests",
              "24/7 Priority Support"
            ]}
            cta="Contact Sales"
            onClick={() => openAuth('signup')}
          />
        </div>
      </div>
    </div>
  );
};

interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  onClick: () => void;
  highlighted?: boolean;
}

const PricingCard = ({ title, price, period, features, cta, onClick, highlighted }: PricingCardProps) => (
  <div className={`relative p-8 rounded-3xl border flex flex-col ${highlighted ? 'border-indigo-500 shadow-2xl scale-105 z-10 bg-white' : 'border-slate-200 bg-white/50'}`}>
    {highlighted && (
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
        Most Popular
      </div>
    )}
    <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
    <div className="flex items-baseline mb-6">
      <span className="text-4xl font-extrabold text-slate-900">{price}</span>
      <span className="text-slate-500 font-medium ml-1">{period}</span>
    </div>
    <ul className="space-y-4 mb-8 flex-1">
      {features.map((feat, i) => (
        <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
          <CheckCircle className={`w-4 h-4 ${highlighted ? 'text-indigo-500' : 'text-slate-400'}`} />
          {feat}
        </li>
      ))}
    </ul>
    <button 
      onClick={onClick}
      className={`w-full py-3 rounded-xl font-bold transition-colors ${highlighted ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
    >
      {cta}
    </button>
  </div>
);

export default PricingPage;