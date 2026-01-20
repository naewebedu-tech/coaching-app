
const HowItWorks = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
            Up and running in 60 seconds
          </h2>
          <p className="text-lg text-slate-600">No complex setup. No technical skills required.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          <StepCard 
            number="1"
            title="Create a Batch"
            desc="Give your class a name. Set timing and fee structure."
          />
          <StepCard 
            number="2"
            title="Add Students"
            desc="Import from contacts or add manually."
          />
          <StepCard 
            number="3"
            title="Automate"
            desc="Start marking attendance with AI."
          />
        </div>
      </div>
    </section>
  );
};

interface StepCardProps {
  number: string;
  title: string;
  desc: string;
}

const StepCard = ({ number, title, desc }: StepCardProps) => (
  <div className="flex flex-col items-center text-center">
    <div className="w-24 h-24 bg-white rounded-full border-4 border-indigo-100 flex items-center justify-center mb-6 shadow-sm">
      <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
        {number}
      </div>
    </div>
    <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
    <p className="text-slate-600">{desc}</p>
  </div>
);

export default HowItWorks;