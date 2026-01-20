import { useState } from 'react';
import { Users, Clock, DollarSign } from 'lucide-react';

const ROICalculator = () => {
  const [students, setStudents] = useState<number>(50);
  const hoursSaved = Math.round((students * 10) / 60);
  const moneySaved = Math.round(students * 100 * 0.02);

  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500 rounded-full blur-3xl opacity-20"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">See how much you save</h2>
            <p className="text-indigo-200 text-lg mb-10">
              CoachingApp pays for itself by preventing revenue leakage.
            </p>
            
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
              <label className="block text-sm font-medium text-slate-400 mb-4">Number of Students</label>
              <div className="flex items-center gap-4 mb-8">
                <Users className="text-indigo-400 w-6 h-6" />
                <input 
                  type="range" 
                  min="10" 
                  max="500" 
                  value={students} 
                  onChange={(e) => setStudents(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="text-2xl font-bold w-16 text-right">{students}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-2xl shadow-xl">
              <div className="flex items-center gap-4 mb-2 text-indigo-200">
                <Clock className="w-6 h-6" />
                <span className="font-semibold">Time Saved Per Month</span>
              </div>
              <div className="text-5xl font-bold mb-1">{hoursSaved} Hours</div>
              <p className="text-sm opacity-80">That's {(hoursSaved/8).toFixed(1)} full work days!</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 rounded-2xl shadow-xl">
              <div className="flex items-center gap-4 mb-2 text-emerald-200">
                <DollarSign className="w-6 h-6" />
                <span className="font-semibold">Revenue Recovered</span>
              </div>
              <div className="text-5xl font-bold mb-1">${moneySaved}</div>
              <p className="text-sm opacity-80">By tracking unpaid dues.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ROICalculator;