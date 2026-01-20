import { Zap, PlayCircle, CheckCircle } from 'lucide-react';
import type { PageKey } from '../pages/marketing/MarketingWebsite';

interface HeroSectionProps {
  openAuth: (mode: 'login' | 'signup') => void;
  navigateTo: (page: PageKey) => void;
}

const HeroSection = ({ openAuth, navigateTo }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-100 rounded-full blur-3xl opacity-50"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold mb-8 border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Zap className="w-4 h-4 fill-indigo-500" />
            <span>New: AI Camera Attendance is live!</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 text-slate-900 leading-[1.1]">
            Manage your Institute <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">
              Without the Chaos
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop juggling spreadsheets. Track fees, attendance, and exam results in one beautiful dashboard. Now with AI-powered class photo scanning.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => openAuth('signup')}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 transform hover:-translate-y-1"
            >
              Start Free Trial
            </button>
            <button 
              onClick={() => navigateTo('features')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group"
            >
              <PlayCircle className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
              Watch Demo
            </button>
          </div>
          <p className="mt-6 text-sm text-slate-500 flex items-center justify-center gap-2 flex-wrap">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> No credit card required 
            </span>
            <span className="mx-2">•</span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> Free 14-day trial
            </span>
          </p>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="relative mx-auto max-w-5xl">
          <div className="bg-slate-900 rounded-2xl p-2 shadow-2xl ring-1 ring-slate-900/10">
            <div className="bg-slate-800 rounded-xl overflow-hidden aspect-[16/9] relative group">
              {/* Abstract UI representation */}
              <div className="absolute inset-0 bg-slate-900 flex">
                {/* Sidebar */}
                <div className="w-16 md:w-64 border-r border-slate-700 p-4 hidden md:block">
                  <div className="h-8 w-32 bg-slate-700 rounded mb-8 opacity-50"></div>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-4 w-full bg-slate-800 rounded flex items-center gap-3">
                        <div className="w-4 h-4 bg-slate-700 rounded-full"></div>
                        <div className="h-2 w-20 bg-slate-700 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Main Content */}
                <div className="flex-1 p-6 md:p-8">
                  <div className="flex justify-between items-center mb-8">
                    <div className="h-8 w-48 bg-slate-700 rounded"></div>
                    <div className="h-10 w-10 bg-indigo-600 rounded-full shadow-lg shadow-indigo-500/20"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                        <div className="h-4 w-24 bg-slate-700 rounded mb-2"></div>
                        <div className="h-8 w-16 bg-emerald-500/20 text-emerald-500 rounded flex items-center px-2 text-xs font-mono font-bold">+12%</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-800 rounded-lg h-64 border border-slate-700 flex items-center justify-center">
                    <p className="text-slate-500 font-medium">Interactive Analytics Dashboard</p>
                  </div>
                </div>
              </div>
              
              {/* Overlay Content */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all cursor-pointer">
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-full border border-white/20 group-hover:scale-110 transition-transform duration-300">
                   <PlayCircle className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
          </div>
          {/* Decorative elements behind mockup */}
          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-3xl rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;