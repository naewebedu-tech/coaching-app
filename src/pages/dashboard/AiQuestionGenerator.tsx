import React, { useState } from 'react';
import { Printer, Settings, Loader2, BookOpen, Layers } from 'lucide-react';

// --- Types ---
interface Question {
  id: number;
  text: string;
  translation?: string; // For bilingual
  options: string[];
  optionsTranslation?: string[]; // For bilingual options
}

interface PaperData {
  coachingName: string;
  examTitle: string;
  subject: string;
  topic: string;
  class: string;
  time: string;
  marks: string;
  questions: Question[];
  languageMode: 'english' | 'hindi' | 'bilingual';
}

// --- API Helper ---
const generateQuestionsAI = async (
  topic: string,
  subject: string,
  level: string,
  count: number,
  lang: string
): Promise<Question[]> => {
  const apiKey = ""; // System provides this at runtime
  
  let prompt = `Generate ${count} multiple choice questions for a student in Class ${level}, Subject: ${subject}, Topic: ${topic}. 
  Return ONLY valid JSON. No markdown formatting. No preamble.
  
  The structure must be:
  [
    {
      "id": 1,
      "text": "Question in English",
      "text_translation": "Question in ${lang === 'bilingual' ? 'Hindi' : lang} (only if bilingual/hindi selected, else null)",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "options_translation": ["Opt A Trans", "Opt B Trans", "Opt C Trans", "Opt D Trans"] (only if bilingual/hindi selected, else null)
    }
  ]
  
  Make the questions challenging and academic. Ensure options are short and concise.`;

  if (lang === 'bilingual') {
    prompt += ` PROVIDE HINDI TRANSLATIONS for both question text and options.`;
  } else if (lang === 'hindi') {
    prompt += ` Provide output primarily in Hindi.`;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    // Clean markdown if present
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr);
    
    // Map to our structure
    return parsed.map((q: any, idx: number) => ({
      id: idx + 1,
      text: q.text,
      translation: q.text_translation,
      options: q.options,
      optionsTranslation: q.options_translation
    }));

  } catch (error) {
    console.error("AI Generation Failed", error);
    // Fallback Mock Data if AI fails
    return Array.from({ length: count }).map((_, i) => ({
      id: i + 1,
      text: `Sample Question ${i + 1} about ${topic}?`,
      translation: lang === 'bilingual' ? `नमूना प्रश्न ${i + 1} ${topic} के बारे में?` : undefined,
      options: ["Option A", "Option B", "Option C", "Option D"],
      optionsTranslation: lang === 'bilingual' ? ["विकल्प A", "विकल्प B", "विकल्प C", "विकल्प D"] : undefined
    }));
  }
};

// --- Components ---

const InputForm = ({ onGenerate, loading }: { onGenerate: (data: any) => void, loading: boolean }) => {
  const [formData, setFormData] = useState({
    coachingName: "COACHING NAME, THAKURGANJ",
    examTitle: "WEEKLY TEST SERIES",
    subject: "Biology",
    topic: "Excretory Products",
    class: "12",
    time: "1:30 Hours",
    marks: "180",
    questionCount: 20,
    languageMode: "bilingual"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 max-w-2xl mx-auto mt-10 print:hidden">
      <div className="flex items-center gap-2 mb-6 border-b pb-4">
        <Settings className="text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800">Paper Configuration</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Coaching Name</label>
          <input name="coachingName" value={formData.coachingName} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        
        <div className="md:col-span-2">
           <label className="block text-sm font-medium text-gray-700 mb-1">Exam Title</label>
           <input name="examTitle" value={formData.examTitle} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input name="subject" value={formData.subject} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Topic/Chapter</label>
          <input name="topic" value={formData.topic} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class/Level</label>
          <input name="class" value={formData.class} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
          <select name="languageMode" value={formData.languageMode} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="english">English Only</option>
            <option value="hindi">Hindi Only</option>
            <option value="bilingual">Bilingual (Eng + Hindi)</option>
          </select>
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
           <input name="time" value={formData.time} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
           <input name="marks" value={formData.marks} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div className="md:col-span-2">
           <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions (AI Generated)</label>
           <input type="number" name="questionCount" value={formData.questionCount} onChange={handleChange} max={100} min={1} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>

      <button 
        onClick={() => onGenerate(formData)}
        disabled={loading}
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="animate-spin" /> : <BookOpen />}
        {loading ? "Generating Paper via AI..." : "Generate Question Paper"}
      </button>
    </div>
  );
};

const PaperView = ({ data }: { data: PaperData }) => {
  return (
    <div className="w-[210mm] mx-auto bg-white p-[10mm] shadow-2xl mb-8 print:shadow-none print:w-full print:p-0 print:m-0 font-serif text-black leading-snug">
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-2 mb-2">
        <h1 className="text-3xl font-black uppercase tracking-wider mb-1">{data.coachingName}</h1>
        <h2 className="text-lg font-bold uppercase">{data.examTitle}</h2>
      </div>

      {/* Meta Table */}
      <table className="w-full border-y border-black mb-4 font-bold text-sm">
        <tbody>
          <tr>
            <td className="p-1 text-left">Class: {data.class} | Subject: {data.subject}</td>
            <td className="p-1 text-center">Topic: {data.topic}</td>
          </tr>
          <tr>
            <td className="p-1 text-left">Time: {data.time}</td>
            <td className="p-1 text-right">Max Marks: {data.marks}</td>
          </tr>
        </tbody>
      </table>

      {/* Questions Column Layout */}
      <div className="columns-1 md:columns-2 gap-[8mm] [column-rule:1px_solid_#eee]">
        {data.questions.map((q, _idx) => (
          <div key={q.id} className="mb-4 break-inside-avoid text-[9pt]">
            <div className="font-bold mb-1">
              {q.id}. {q.text} {q.translation && <span className="font-normal ml-1">{q.translation}</span>}
            </div>
            
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
              {q.options.map((opt, optIdx) => (
                <div key={optIdx} className="text-[8.5pt]">
                  {String.fromCharCode(65 + optIdx)}. {opt}
                  {q.optionsTranslation && (
                     <span className="ml-1 text-gray-800">({q.optionsTranslation[optIdx]})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center font-bold mt-6 border-t pt-2 text-sm">--- END OF TEST ---</div>
    </div>
  );
};

const OMRView = ({ data }: { data: PaperData }) => {
  // --- Updated Logic: Force 4 Columns ---
  const totalQs = data.questions.length;
  const colCount = 4;
  // Calculate how many questions per column to evenly distribute them
  // e.g., if 20 qs, 20/4 = 5 rows per column.
  const questionsPerCol = Math.max(1, Math.ceil(totalQs / colCount));

  return (
    <div className="w-[210mm] mx-auto bg-white p-[10mm] shadow-2xl print:shadow-none print:w-full print:p-0 print:m-0 font-sans text-black">
      {/* OMR Header */}
      <div className="text-center border-b-2 border-gray-800 pb-2 mb-4">
        <h1 className="text-2xl font-black uppercase tracking-widest">{data.coachingName}</h1>
        <h2 className="text-lg font-bold uppercase mt-1">OMR ANSWER SHEET</h2>
      </div>

      {/* Student Details */}
      <div className="grid grid-cols-2 gap-4 border-2 border-gray-800 p-2 rounded mb-4 text-sm">
        <div className="flex items-baseline gap-2"><span className="font-bold">Name:</span> <div className="border-b border-dashed border-black flex-grow h-4"></div></div>
        <div className="flex items-baseline gap-2"><span className="font-bold">Date:</span> <div className="border-b border-dashed border-black flex-grow h-4"></div></div>
        <div className="flex items-baseline gap-2"><span className="font-bold">Roll No:</span> <div className="border-b border-dashed border-black flex-grow h-4"></div></div>
        <div className="flex items-baseline gap-2"><span className="font-bold">Batch:</span> <div className="border-b border-dashed border-black flex-grow h-4"></div></div>
        <div className="col-span-2 flex items-baseline gap-2"><span className="font-bold">Test Topic:</span> <div className="border-b border-dashed border-black flex-grow h-4">{data.topic}</div></div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-100 p-2 rounded mb-6 text-xs flex justify-between items-center">
        <div>
          <p><strong>INSTRUCTIONS:</strong> 1. Use Blue/Black Ball Point Pen. 2. Darken circle completely.</p>
        </div>
        <div className="flex items-center gap-2">
           <span>Correct:</span>
           <div className="w-3 h-3 rounded-full bg-black border border-black"></div>
           <div className="w-3 h-3 rounded-full border border-black"></div>
           <div className="w-3 h-3 rounded-full border border-black"></div>
        </div>
      </div>

      {/* OMR Grid - 4 Columns Layout */}
      <div 
        className="grid grid-flow-col gap-x-6 gap-y-1 border-t-2 border-gray-800 pt-4" 
        style={{ 
          gridTemplateRows: `repeat(${questionsPerCol}, min-content)`,
          gridTemplateColumns: `repeat(4, 1fr)` // Force 4 equal width columns
        }}
      >
        {data.questions.map((q) => (
          <div key={q.id} className="flex items-center text-xs whitespace-nowrap">
             <span className="w-6 text-right mr-2 font-bold text-gray-700">{q.id}.</span>
             <div className="flex gap-2">
                {['A','B','C','D'].map((opt) => (
                  <div key={opt} className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center text-[7pt] font-bold text-gray-500 hover:bg-gray-800 hover:text-white cursor-pointer transition-colors">
                    {opt}
                  </div>
                ))}
             </div>
          </div>
        ))}
      </div>

      {/* Footer Signatures */}
      <div className="flex justify-between mt-12 pt-8">
        <div className="border-t-2 border-black w-40 text-center text-xs font-bold pt-1">Student Signature</div>
        <div className="border-t-2 border-black w-40 text-center text-xs font-bold pt-1">Marks Obtained</div>
        <div className="border-t-2 border-black w-40 text-center text-xs font-bold pt-1">Invigilator Signature</div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function AIQPaper() {
  const [paperData, setPaperData] = useState<PaperData | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'form' | 'paper' | 'omr'>('form');

  const handleGenerate = async (formData: any) => {
    setLoading(true);
    const questions = await generateQuestionsAI(
      formData.topic, 
      formData.subject, 
      formData.class, 
      Number(formData.questionCount),
      formData.languageMode
    );

    setPaperData({
      ...formData,
      questions: questions
    });
    setLoading(false);
    setView('paper');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      
      {/* Top Navigation Bar (Hidden on Print) */}
      <nav className="bg-gray-900 text-white p-4 shadow-md print:hidden sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
             <Layers className="text-yellow-400" />
             <h1 className="text-xl font-bold">AI Question Paper</h1>
          </div>

          <div className="flex gap-2 bg-gray-800 p-1 rounded-lg">
            <button 
              onClick={() => setView('form')} 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'form' ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-300'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => paperData ? setView('paper') : alert('Generate a paper first')} 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'paper' ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-300'}`}
              disabled={!paperData}
            >
              Question Paper
            </button>
            <button 
              onClick={() => paperData ? setView('omr') : alert('Generate a paper first')} 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'omr' ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-300'}`}
              disabled={!paperData}
            >
              OMR Sheet
            </button>
          </div>

          <div className="flex gap-2">
             {view !== 'form' && (
                <button onClick={handlePrint} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-bold transition-shadow shadow-lg">
                  <Printer size={18} /> Print {view === 'paper' ? 'Paper' : 'OMR'}
                </button>
             )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="p-4 md:p-8">
        
        {view === 'form' && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8 print:hidden">
                <h2 className="text-xl font-extrabold text-red-400">(For Demo Only, feature coming Soon)</h2>

                <h2 className="text-3xl font-extrabold text-gray-800">AI Question Paper Generator</h2>
                <p className="text-gray-600 mt-2">Generate print-ready papers and OMR sheets for any board or subject instantly.</p>
              </div>
              <InputForm onGenerate={handleGenerate} loading={loading} />
           </div>
        )}

        {view === 'paper' && paperData && (
          <div className="animate-in zoom-in-95 duration-300">
            <PaperView data={paperData} />
          </div>
        )}

        {view === 'omr' && paperData && (
          <div className="animate-in zoom-in-95 duration-300">
            <OMRView data={paperData} />
          </div>
        )}

      </main>

    </div>
  );
}