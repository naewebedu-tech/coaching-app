import { ScanFace, Printer, Brain, MessageCircle, CheckCircle, GraduationCap, FileText, Share2 } from 'lucide-react';

const FeaturesPage = () => {
  return (
    <div className="min-h-screen">
      <div className="bg-slate-900 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-6">Powerful Features</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Deep dive into the tools that will transform your administration.
          </p>
        </div>
      </div>

      {/* Feature 1: AI Attendance */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
              <ScanFace className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-slate-900">AI-Powered Attendance</h2>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              Forget wasting 15 minutes of every class on roll calls. With CoachingApp's "AI Scan", simply point your phone at the class and snap a photo.
            </p>
            <ul className="space-y-3 mb-8">
              <FeatureListItem text="98% Accuracy in face detection" />
              <FeatureListItem text="Works offline with local processing" />
              <FeatureListItem text="Manual override available for corrections" />
            </ul>
          </div>
          <div className="flex-1 bg-indigo-50 rounded-3xl p-8 aspect-square flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-2 opacity-10">
              {Array.from({length: 36}).map((_,i) => <div key={i} className="bg-indigo-500 rounded-full"></div>)}
            </div>
            <div className="relative bg-white rounded-xl shadow-xl p-4 w-64">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <span className="font-bold text-slate-700">Class 10-A</span>
                <span className="text-xs text-green-600 font-bold bg-green-100 px-2 py-1 rounded">Processed</span>
              </div>
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                      <div className="w-20 h-3 bg-slate-100 rounded"></div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 2: Bill Generator */}
      <div className="py-20 bg-slate-50">
        <div className="container mx-auto px-6 flex flex-col md:flex-row-reverse items-center gap-12">
          <div className="flex-1">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
              <Printer className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Bill Generator & Fee Tracking</h2>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              Create professional, GST-compliant fee receipts in seconds. Track pending dues and prevent revenue leakage.
            </p>
            <ul className="space-y-3 mb-8">
              <FeatureListItem text="Instant PDF Receipt Generation" />
              <FeatureListItem text="Auto-calculate pending dues" />
              <FeatureListItem text="Monthly revenue reports & charts" />
            </ul>
          </div>
          <div className="flex-1 bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">Paid</div>
            <div className="space-y-4 font-mono text-sm text-slate-600">
              <div className="flex justify-between border-b pb-4">
                <div>
                  <div className="font-bold text-slate-900 text-lg">INVOICE #0012</div>
                  <div>Date: Jan 03, 2026</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">CoachingApp Institute</div>
                  <div>Patna, Bihar</div>
                </div>
              </div>
              <div className="py-2">
                <div className="flex justify-between font-bold text-slate-800 mb-2">
                  <span>Description</span>
                  <span>Amount</span>
                </div>
                <div className="flex justify-between">
                  <span>Tuition Fee (Physics)</span>
                  <span>$500.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Exam Fee</span>
                  <span>$50.00</span>
                </div>
              </div>
              <div className="border-t pt-4 flex justify-between font-bold text-lg text-slate-900">
                <span>Total Paid</span>
                <span>$550.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 3: AI Question Generator */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 text-purple-600">
              <Brain className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-slate-900">AI Question Paper Generator</h2>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              Need a test paper for tomorrow? Select your subject, chapter, and difficulty level. Our AI generates a unique question paper branded with <strong>Your Institute Name</strong> in seconds.
            </p>
            <ul className="space-y-3 mb-8">
              <FeatureListItem text="Supports Physics, Math, Chemistry & Biology" />
              <FeatureListItem text="Auto-generates Answer Keys" />
              <FeatureListItem text="Custom Watermark with your branding" />
            </ul>
          </div>
          <div className="flex-1 bg-purple-50 rounded-3xl p-8 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">CA</div>
                <div>
                  <div className="font-bold text-sm">Your Institute Name</div>
                  <div className="text-xs text-slate-400">Weekly Test - Physics</div>
                </div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i}>
                    <div className="flex gap-2 text-sm font-medium text-slate-800 mb-1">
                      <span>Q{i}.</span>
                      <div className="h-2 bg-slate-200 rounded w-full mt-1.5"></div>
                    </div>
                    <div className="ml-6 h-2 bg-slate-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 bg-purple-600 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                <Printer className="w-4 h-4" /> Print Paper
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 4: WhatsApp Integration */}
      <div className="py-20 bg-emerald-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500 rounded-full blur-[100px] opacity-20"></div>

        <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-800 text-emerald-100 text-sm font-semibold mb-6 border border-emerald-700">
              <MessageCircle className="w-4 h-4 fill-emerald-500" />
              <span>New Integration</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Share Everything on WhatsApp</h2>
            <p className="text-emerald-100 text-lg mb-8 leading-relaxed">
              Parents don't check emails. They check WhatsApp. Share fee receipts, exam reports, and absent alerts directly to their phone with one click.
            </p>
            <button className="bg-white text-emerald-900 px-8 py-4 rounded-xl font-bold hover:bg-emerald-50 transition-colors flex items-center gap-3">
              <Share2 className="w-5 h-5" />
              Try WhatsApp Sharing
            </button>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-white text-slate-900 p-4 rounded-2xl shadow-2xl max-w-xs w-full -rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-sm">CoachingApp Bot</div>
                  <div className="text-xs text-slate-400">Today, 10:30 AM</div>
                </div>
              </div>
              <div className="bg-emerald-50 p-3 rounded-lg rounded-tl-none mb-2 text-sm">
                <p className="mb-2">Hello! Here is the monthly performance report for <strong>Rahul Kumar</strong>.</p>
                <div className="flex items-center gap-2 bg-white p-2 rounded border border-emerald-100">
                  <FileText className="w-8 h-8 text-red-500" />
                  <div className="text-xs">
                    <div className="font-semibold">Report_Jan.pdf</div>
                    <div className="text-slate-400">1.2 MB</div>
                  </div>
                </div>
              </div>
              <div className="bg-emerald-50 p-3 rounded-lg rounded-tl-none text-sm">
                Attendance: <span className="text-green-600 font-bold">Present</span> ✅
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface FeatureListItemProps {
  text: string;
}

const FeatureListItem = ({ text }: FeatureListItemProps) => (
  <li className="flex items-start gap-3">
    <CheckCircle className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
    <span className="text-slate-700">{text}</span>
  </li>
);

export default FeaturesPage;