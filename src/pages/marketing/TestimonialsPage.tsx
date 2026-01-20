import { Star } from 'lucide-react';

const TestimonialsPage = () => {
  return (
    <div className="py-20 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 text-slate-900">Success Stories</h1>
          <p className="text-lg text-slate-600">Hear from institute owners who scaled with CoachingApp.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <TestimonialCard 
            name="Sarah Jenkins"
            role="Director, MathWhiz Academy"
            quote="Before CoachingApp, I spent every Sunday calculating fees manually. Now it takes 5 minutes. The AI attendance feature is a complete game changer for my large batches."
            stars={5}
          />
          <TestimonialCard 
            name="Raj Patel"
            role="Founder, Physics Point"
            quote="The student performance reports helped me show parents exactly where their kids were struggling. Retention rates have gone up by 25% since we started using the exam portal."
            stars={5}
          />
          <TestimonialCard 
            name="Emily Chen"
            role="Owner, Chen Language School"
            quote="I love that it works offline. My internet is spotty, but the app never crashes. It just syncs when I'm back online. Highly recommended."
            stars={4}
          />
          <TestimonialCard 
            name="Michael Ross"
            role="Head Tutor, Ross Prep"
            quote="Simple interface, no clutter. My staff learned how to use it in 10 minutes. The fee receipts generation alone is worth the subscription."
            stars={5}
          />
        </div>
      </div>
    </div>
  );
};

interface TestimonialCardProps {
  name: string;
  role: string;
  quote: string;
  stars: number;
}

const TestimonialCard = ({ name, role, quote, stars }: TestimonialCardProps) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
    <div className="flex gap-1 mb-4 text-yellow-400">
      {Array.from({length: 5}).map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < stars ? 'fill-current' : 'text-slate-200'}`} />
      ))}
    </div>
    <p className="text-slate-700 italic mb-6 leading-relaxed">"{quote}"</p>
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
        {name[0]}
      </div>
      <div>
        <h4 className="font-bold text-slate-900 text-sm">{name}</h4>
        <p className="text-xs text-slate-500">{role}</p>
      </div>
    </div>
  </div>
);

export default TestimonialsPage;