import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, Settings, Loader2, BookOpen, Layers, 
  FileText, CheckSquare, ZoomIn, ZoomOut, ChevronLeft,
  PlusCircle, AlertTriangle
} from 'lucide-react';

// --- Types ---
interface Question {
  id: number;
  text: string;
  translation?: string;
  options?: string[]; // Only for MCQs
  optionsTranslation?: string[]; 
}

interface PaperData {
  coachingName: string;
  examTitle: string;
  subject: string;
  topic: string;
  class: string;
  time: string;
  marks: string;
  languageMode: 'english' | 'hindi' | 'bilingual';
  mcqCount: number;
  shortCount: number;
  longCount: number;
  // Data Sections
  mcqs: Question[];
  shortQuestions: Question[];
  longQuestions: Question[];
  isDemo?: boolean;
}

interface AIQPaperProps {
  onBack?: () => void;
  initialTopic?: string;
}

// ------------------------------------------------------------------
// 1. MOCK DATA GENERATOR (Updated for Sections)
// ------------------------------------------------------------------
const getMockData = (topic: string, mcqC: number, shortC: number, longC: number, lang: string) => {
    const isBi = lang === 'bilingual' || lang === 'hindi';
    
    // MCQs
    const mcqs = Array.from({ length: mcqC }).map((_, i) => ({
      id: i + 1,
      text: `Sample MCQ ${i + 1}: What is the core principle of ${topic}?`,
      translation: isBi ? `नमूना प्रश्न ${i + 1}: ${topic} का मूल सिद्धांत क्या है?` : undefined,
      options: [
        i % 2 === 0 ? "Short Option A" : "A very long detailed option explanation for testing layout", 
        "Option B", 
        "Option C", 
        "Option D"
      ],
      optionsTranslation: isBi ? [
        i % 2 === 0 ? "छोटा विकल्प A" : "लेआउट परीक्षण के लिए एक बहुत लंबा विस्तृत विकल्प", 
        "विकल्प B", "विकल्प C", "विकल्प D"
      ] : undefined
    }));

    // Short Questions
    const shortQuestions = Array.from({ length: shortC }).map((_, i) => ({
      id: i + 1,
      text: `Define the term '${topic}' and list two characteristics.`,
      translation: isBi ? `'${topic}' शब्द को परिभाषित करें और दो विशेषताओं को सूचीबद्ध करें।` : undefined
    }));

    // Long Questions
    const longQuestions = Array.from({ length: longC }).map((_, i) => ({
      id: i + 1,
      text: `Explain in detail the impact of ${topic} on modern society with examples.`,
      translation: isBi ? `आधुनिक समाज पर ${topic} के प्रभाव का उदाहरण सहित विस्तार से वर्णन करें।` : undefined
    }));

    return { mcqs, shortQuestions, longQuestions };
};

// ------------------------------------------------------------------
// 2. API HELPER (Updated for Structured Response)
// ------------------------------------------------------------------
const generateQuestionsAI = async (
  formData: any
): Promise<{ mcqs: Question[], shortQuestions: Question[], longQuestions: Question[], isDemo: boolean }> => {
  
  const apiKey: string = ""; // Insert Key Here
  const { topic, subject, class: level, languageMode: lang, mcqCount, shortCount, longCount } = formData;

  // A. Demo Check
  if (!apiKey || apiKey.trim() === "") {
      console.log("Using Demo Data (No API Key)");
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mocks = getMockData(topic, Number(mcqCount), Number(shortCount), Number(longCount), lang);
      return { ...mocks, isDemo: true };
  }

  // B. AI Prompt
  let prompt = `Generate an exam paper for Class ${level}, Subject: ${subject}, Topic: ${topic}.
  Return ONLY valid JSON.
  Structure:
  {
    "mcqs": [ {"id": 1, "text": "...", "text_trans": "...", "options": ["..."], "options_trans": ["..."]} ] (Generate ${mcqCount}),
    "short": [ {"id": 1, "text": "...", "text_trans": "..."} ] (Generate ${shortCount}),
    "long": [ {"id": 1, "text": "...", "text_trans": "..."} ] (Generate ${longCount})
  }
  ${lang === 'bilingual' ? 'PROVIDE HINDI TRANSLATIONS in keys ending with _trans.' : ''}
  ${lang === 'hindi' ? 'Provide output in HINDI.' : ''}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    
    if (!response.ok) throw new Error("API Error");

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr);
    
    // Map Response
    const mapQ = (q: any, i: number) => ({
      id: i + 1,
      text: q.text,
      translation: q.text_trans,
      options: q.options,
      optionsTranslation: q.options_trans
    });

    return { 
        mcqs: (parsed.mcqs || []).map(mapQ),
        shortQuestions: (parsed.short || []).map(mapQ),
        longQuestions: (parsed.long || []).map(mapQ),
        isDemo: false 
    };

  } catch (error) {
    console.error("AI Failed", error);
    const mocks = getMockData(topic, Number(mcqCount), Number(shortCount), Number(longCount), lang);
    return { ...mocks, isDemo: true };
  }
};

// --- Components ---

// --- Fix: Added initialTopic to the type definition ---
const InputForm = ({ 
  onGenerate, 
  loading, 
  initialTopic 
}: { 
  onGenerate: (data: any) => void, 
  loading: boolean, 
  initialTopic?: string // <--- Added this line
}) => {
  const [formData, setFormData] = useState({
    coachingName: "NAE COACHING CENTER",
    examTitle: "QUARTERLY EXAM – 2026",
    subject: "Home Science",
    topic: initialTopic || "Balanced Diet", // Uses the prop here
    class: "12",
    time: "3 Hours",
    marks: "70",
    mcqCount: 10,
    shortCount: 5,
    longCount: 3,
    languageMode: "bilingual"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 max-w-2xl w-full mx-auto print:hidden">
      
      {/* Status Banner */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mb-6 flex items-start gap-3">
        <AlertTriangle className="text-indigo-500 shrink-0 mt-0.5" size={18} />
        <div>
            <h3 className="text-sm font-bold text-indigo-800">Smart Layout Engine</h3>
            <p className="text-xs text-indigo-700 mt-1">
                Options automatically arrange into <b>2x2 Grid</b> or <b>Vertical Stack</b> based on text length.
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <label className="font-semibold text-gray-500 uppercase text-xs">Coaching Name</label>
          <input name="coachingName" value={formData.coachingName} onChange={handleChange} className="input-field" />
        </div>
        <div className="space-y-1">
           <label className="font-semibold text-gray-500 uppercase text-xs">Exam Title</label>
           <input name="examTitle" value={formData.examTitle} onChange={handleChange} className="input-field" />
        </div>
        <div className="space-y-1">
          <label className="font-semibold text-gray-500 uppercase text-xs">Subject</label>
          <input name="subject" value={formData.subject} onChange={handleChange} className="input-field" />
        </div>
        <div className="space-y-1">
          <label className="font-semibold text-gray-500 uppercase text-xs">Topic</label>
          <input name="topic" value={formData.topic} onChange={handleChange} className="input-field" />
        </div>
        <div className="space-y-1">
          <label className="font-semibold text-gray-500 uppercase text-xs">Class</label>
          <input name="class" value={formData.class} onChange={handleChange} className="input-field" />
        </div>
        <div className="space-y-1">
          <label className="font-semibold text-gray-500 uppercase text-xs">Language</label>
          <select name="languageMode" value={formData.languageMode} onChange={handleChange} className="input-field">
            <option value="bilingual">Bilingual (Eng + Hindi)</option>
            <option value="english">English Only</option>
            <option value="hindi">Hindi Only</option>
          </select>
        </div>
        <div className="space-y-1">
           <label className="font-semibold text-gray-500 uppercase text-xs">Duration</label>
           <input name="time" value={formData.time} onChange={handleChange} className="input-field" />
        </div>
        <div className="space-y-1">
           <label className="font-semibold text-gray-500 uppercase text-xs">Total Marks</label>
           <input name="marks" value={formData.marks} onChange={handleChange} className="input-field" />
        </div>
        
        {/* Question Counts */}
        <div className="md:col-span-2 grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-2">
            <div className="space-y-1">
                <label className="font-bold text-gray-600 text-xs">MCQs</label>
                <input type="number" name="mcqCount" value={formData.mcqCount} onChange={handleChange} className="input-field text-center font-bold" />
            </div>
            <div className="space-y-1">
                <label className="font-bold text-gray-600 text-xs">Short Qs</label>
                <input type="number" name="shortCount" value={formData.shortCount} onChange={handleChange} className="input-field text-center font-bold" />
            </div>
            <div className="space-y-1">
                <label className="font-bold text-gray-600 text-xs">Long Qs</label>
                <input type="number" name="longCount" value={formData.longCount} onChange={handleChange} className="input-field text-center font-bold" />
            </div>
        </div>
      </div>

      <button 
        onClick={() => onGenerate(formData)}
        disabled={loading}
        className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {loading ? <Loader2 className="animate-spin" /> : <BookOpen size={20} />}
        {loading ? "Generating Paper..." : "Generate Paper"}
      </button>

      <style>{`
        .input-field {
            width: 100%;
            padding: 10px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            outline: none;
            font-size: 14px;
            transition: all 0.2s;
        }
        .input-field:focus {
            background: white;
            border-color: #6366f1;
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
        }
      `}</style>
    </div>
  );
};

// --- Mobile Scaler ---
const PaperScaler = ({ children }: { children: React.ReactNode }) => {
  const [scale, setScale] = useState(1);
  const [isScaled, setIsScaled] = useState(true); 
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && isScaled) {
        const screenWidth = window.innerWidth - 32; 
        const paperWidth = 794; 
        const newScale = Math.min(1, screenWidth / paperWidth);
        setScale(newScale);
      } else {
        setScale(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isScaled]);

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="flex gap-2 mb-4 print:hidden sticky top-20 z-30 bg-gray-800/80 backdrop-blur text-white p-2 rounded-full shadow-lg">
         <button onClick={() => setIsScaled(true)} className={`p-1.5 rounded-full ${isScaled ? 'bg-indigo-500' : 'hover:bg-gray-600'}`} title="Fit"><ZoomOut size={16}/></button>
         <button onClick={() => setIsScaled(false)} className={`p-1.5 rounded-full ${!isScaled ? 'bg-indigo-500' : 'hover:bg-gray-600'}`} title="Actual"><ZoomIn size={16}/></button>
      </div>
      <div 
        ref={containerRef}
        className="origin-top transition-transform duration-300 ease-out print:!transform-none print:!w-full"
        style={{ transform: `scale(${scale})` }}
      >
        {children}
      </div>
      {isScaled && (
         <div style={{ height: `${(1123 * scale) - 1123}px` }} className="print:hidden"></div>
      )}
    </div>
  );
};

// --- 3. PAPER VIEW (Smart Layout) ---
const PaperView = ({ data }: { data: PaperData }) => {
  
  // Helper to determine layout class based on option length
  const getOptionLayoutClass = (options?: string[]) => {
      if(!options) return '';
      // If any option is longer than 25 chars, force vertical stack (4x1)
      // Otherwise use grid (2x2)
      const isLong = options.some(opt => opt.length > 25);
      return isLong ? 'options-stack' : 'options-grid';
  };

  return (
    <>
    <div className="paper-container w-[210mm] min-h-[297mm] mx-auto bg-white p-[10mm] shadow-2xl mb-8 print:shadow-none print:w-full print:p-0 print:m-0 font-[Times_New_Roman] text-black leading-tight relative">
      
      {data.isDemo && (
          <div className="absolute top-0 right-0 bg-red-100 text-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wider print:hidden rounded-bl-lg">
              Demo
          </div>
      )}

      {/* Header */}
      <div className="text-center border-b-2 border-black pb-2 mb-2">
        <h1 className="text-[24pt] font-black uppercase tracking-wide leading-none m-0">{data.coachingName}</h1>
        <h2 className="text-[12pt] font-bold uppercase mt-1.5">{data.examTitle}</h2>
        <div className="text-[11pt] font-bold mt-1 uppercase">{data.subject} | {data.topic}</div>
        
        <table className="w-full border-t border-b border-black mt-2 font-bold text-[10pt] border-collapse">
          <tbody>
            <tr>
              <td className="p-1 text-left">Sub Code: 118</td>
              <td className="p-1 text-center border-l border-r border-black">Time: {data.time}</td>
              <td className="p-1 text-right">Full Marks: {data.marks}</td>
            </tr>
          </tbody>
        </table>
        
        <div className="text-[9pt] italic text-left mt-1">
          <strong>INSTRUCTIONS:</strong> 1. Answer in your own words. 2. Figures in margin indicate full marks. 3. 15 Min extra reading time.
        </div>
      </div>

      {/* --- 2-COLUMN LAYOUT WRAPPER --- */}
      <div className="content-columns">
        
        {/* MCQs */}
        {data.mcqs.length > 0 && (
            <>
                <div className="section-header">SECTION-A (Objective Type) | खण्ड-अ</div>
                <div className="text-center text-[9pt] italic mb-2 column-span-all">
                    <strong>निर्देश:</strong> किन्हीं {data.mcqCount} प्रश्नों का उत्तर दें। ({data.mcqCount} × 1 = {data.mcqCount})
                </div>
                
                {data.mcqs.map((q) => {
                    const layoutClass = getOptionLayoutClass(q.options);
                    return (
                      <div key={q.id} className="question-box">
                        <div className="font-bold text-[10pt] mb-1">
                          {q.id}. {q.text} <br/>
                          {q.translation && <span className="font-bold">{q.translation}</span>}
                        </div>
                        
                        <div className={layoutClass}>
                          {q.options?.map((opt, optIdx) => (
                            <div key={optIdx} className="option-item text-[9.5pt]">
                              ({String.fromCharCode(65 + optIdx)}) {opt}
                              {q.optionsTranslation && q.optionsTranslation[optIdx] && (
                                 <span className="ml-2 font-medium">({q.optionsTranslation[optIdx]})</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                })}
            </>
        )}

        {/* Short Questions */}
        {data.shortQuestions.length > 0 && (
            <>
                <div className="section-header mt-4">SECTION-B (Short Answer) | खण्ड-ब</div>
                <div className="text-center text-[9pt] italic mb-2">
                    <strong>निर्देश:</strong> लघु उत्तरीय प्रश्न (2 Marks Each)
                </div>
                {data.shortQuestions.map((q, idx) => (
                    <div key={q.id} className="question-box">
                        <div className="text-[10pt]">
                            <strong>{idx + 1}.</strong> {q.text} <br/>
                            {q.translation && <span className="font-bold">{q.translation}</span>}
                        </div>
                    </div>
                ))}
            </>
        )}

        {/* Long Questions */}
        {data.longQuestions.length > 0 && (
            <>
                <div className="section-header mt-4">SECTION-C (Long Answer) | खण्ड-स</div>
                <div className="text-center text-[9pt] italic mb-2">
                    <strong>निर्देश:</strong> दीर्घ उत्तरीय प्रश्न (5 Marks Each)
                </div>
                {data.longQuestions.map((q, idx) => (
                    <div key={q.id} className="question-box">
                        <div className="text-[10pt]">
                            <strong>{idx + 1}.</strong> {q.text} <br/>
                            {q.translation && <span className="font-bold">{q.translation}</span>}
                        </div>
                    </div>
                ))}
            </>
        )}

      </div>
      
      <div className="text-center font-bold mt-4 border-t pt-2 text-sm">--- END OF TEST ---</div>
    </div>

    <style>{`
        .content-columns {
            column-count: 2;
            column-gap: 6mm;
            column-rule: 1px solid #ccc;
            text-align: justify;
        }
        .section-header {
            background: #eee;
            border: 1px solid #000;
            text-align: center;
            font-weight: bold;
            padding: 2px;
            margin: 10px 0 5px 0;
            font-size: 10pt;
            column-span: all;
            -webkit-column-span: all;
        }
        .question-box {
            margin-bottom: 8px;
            break-inside: avoid;
            page-break-inside: avoid;
        }
        
        /* 2x2 Grid Layout */
        .options-grid {
            display: flex;
            flex-wrap: wrap;
            margin-top: 2px;
        }
        .options-grid .option-item {
            width: 50%;
            box-sizing: border-box;
            padding-right: 4px;
        }

        /* 4x1 Vertical Stack Layout */
        .options-stack {
            display: flex;
            flex-direction: column;
            margin-top: 2px;
        }
        .options-stack .option-item {
            width: 100%;
            margin-bottom: 2px;
        }

        @media print {
            @page { margin: 10mm; size: A4; }
            .paper-container {
                box-shadow: none !important;
                margin: 0 !important;
                width: 100% !important;
            }
            body { background-color: white; }
        }
    `}</style>
    </>
  );
};

const OMRView = ({ data }: { data: PaperData }) => {
  const totalQs = data.mcqs.length;
  // Use 4 columns for dense OMR
  const questionsPerCol = Math.max(1, Math.ceil(totalQs / 4));

  return (
    <div className="w-[210mm] min-h-[297mm] mx-auto bg-white p-[10mm] shadow-2xl print:shadow-none print:w-full print:p-0 print:m-0 font-sans text-black">
      <div className="text-center border-b-2 border-gray-800 pb-2 mb-4">
        <h1 className="text-2xl font-black uppercase tracking-widest">{data.coachingName}</h1>
        <h2 className="text-lg font-bold uppercase mt-1">OMR SHEET</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 border-2 border-gray-800 p-2 rounded mb-4 text-sm">
        <div className="flex items-baseline gap-2"><span className="font-bold">Name:</span> <div className="border-b border-dashed border-black flex-grow h-4"></div></div>
        <div className="flex items-baseline gap-2"><span className="font-bold">Subject:</span> <div className="border-b border-dashed border-black flex-grow h-4">{data.subject}</div></div>
      </div>
      <div className="grid grid-flow-col gap-x-6 gap-y-1 border-t-2 border-gray-800 pt-4" style={{ gridTemplateRows: `repeat(${questionsPerCol}, min-content)`, gridTemplateColumns: `repeat(4, 1fr)` }}>
        {data.mcqs.map((q) => (
          <div key={q.id} className="flex items-center text-xs whitespace-nowrap">
             <span className="w-6 text-right mr-2 font-bold text-gray-700">{q.id}.</span>
             <div className="flex gap-2">
                {['A','B','C','D'].map((opt) => (
                  <div key={opt} className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center text-[7pt] font-bold hover:bg-black hover:text-white">{opt}</div>
                ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function AIQPaper({ onBack, initialTopic }: AIQPaperProps) {
  const [paperData, setPaperData] = useState<PaperData | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'form' | 'paper' | 'omr'>('form');

  const handleGenerate = async (formData: any) => {
    setLoading(true);
    const result = await generateQuestionsAI(formData);
    
    setPaperData({ 
        ...formData, 
        mcqs: result.mcqs,
        shortQuestions: result.shortQuestions,
        longQuestions: result.longQuestions,
        isDemo: result.isDemo,
        questions: [] // Legacy field fallback
    });
    
    setLoading(false);
    setView('paper');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20 md:pb-0">
      <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40 print:hidden shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             {onBack && <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full md:hidden"><ChevronLeft size={20}/></button>}
             <div className="p-2 bg-indigo-600 rounded-lg text-white"><Layers size={20} /></div>
             <h1 className="text-lg font-bold leading-none">AI Paper</h1>
          </div>
          <div className="flex gap-3">
             {view !== 'form' && <button onClick={() => setView('form')} className="hidden md:flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium"><PlusCircle size={16}/> New</button>}
             {view !== 'form' && <button onClick={() => window.print()} className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium"><Printer size={16}/> Print</button>}
          </div>
        </div>
      </nav>

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {view === 'form' && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col items-center">
              <InputForm onGenerate={handleGenerate} loading={loading} initialTopic={initialTopic} />
           </div>
        )}
        {view === 'paper' && paperData && (
          <div className="animate-in zoom-in-95 duration-300">
            <PaperScaler><PaperView data={paperData} /></PaperScaler>
          </div>
        )}
        {view === 'omr' && paperData && (
          <div className="animate-in zoom-in-95 duration-300">
            <PaperScaler><OMRView data={paperData} /></PaperScaler>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 z-50 flex justify-around md:hidden print:hidden pb-safe">
         <button onClick={() => setView('form')} className={`flex flex-col items-center gap-1 p-2 rounded-lg w-20 ${view === 'form' ? 'text-indigo-600' : 'text-gray-400'}`}><Settings size={20}/><span className="text-[10px]">Config</span></button>
         <button onClick={() => paperData ? setView('paper') : null} disabled={!paperData} className={`flex flex-col items-center gap-1 p-2 rounded-lg w-20 ${view === 'paper' ? 'text-indigo-600' : 'text-gray-400'}`}><FileText size={20}/><span className="text-[10px]">Paper</span></button>
         <button onClick={() => paperData ? setView('omr') : null} disabled={!paperData} className={`flex flex-col items-center gap-1 p-2 rounded-lg w-20 ${view === 'omr' ? 'text-indigo-600' : 'text-gray-400'}`}><CheckSquare size={20}/><span className="text-[10px]">OMR</span></button>
      </div>
    </div>
  );
}