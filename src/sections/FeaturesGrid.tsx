import { ScanFace, CreditCard, BarChart3, Users, ShieldCheck, Smartphone, type LucideIcon } from 'lucide-react';

const FeaturesGrid = () => {
  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
            Everything you need to run your coaching
          </h2>
          <p className="text-lg text-slate-600">
            Built specifically for private tutors, coaching centers, and educational institutes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={ScanFace} 
            title="AI Attendance" 
            desc="Take a photo of the classroom. Our AI detects faces and marks attendance automatically."
            color="bg-indigo-500"
          />
          <FeatureCard 
            icon={CreditCard} 
            title="Smart Fee Manager" 
            desc="Track payments, partial deposits, and overdue fees. Send automated WhatsApp reminders."
            color="bg-emerald-500"
          />
          <FeatureCard 
            icon={BarChart3} 
            title="Performance Reports" 
            desc="Visual graphs for every student's progress. Compare batch averages."
            color="bg-blue-500"
          />
          <FeatureCard 
            icon={Users} 
            title="Student Hub" 
            desc="A complete CRM for your students. Store contacts and history in one place."
            color="bg-purple-500"
          />
          <FeatureCard 
            icon={ShieldCheck} 
            title="Secure Data" 
            desc="Your data is encrypted and stored securely. Regular backups ensure safety."
            color="bg-orange-500"
          />
          <FeatureCard 
            icon={Smartphone} 
            title="Mobile First" 
            desc="Manage your institute from anywhere. Works perfectly on your phone."
            color="bg-pink-500"
          />
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
}

const FeatureCard = ({ icon: Icon, title, desc, color }: FeatureCardProps) => (
  <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center mb-6 text-white shadow-lg transform group-hover:rotate-6 transition-transform`}>
      <Icon className="w-7 h-7" />
    </div>
    <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{desc}</p>
  </div>
);

export default FeaturesGrid;