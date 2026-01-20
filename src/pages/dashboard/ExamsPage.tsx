import { useState, type FormEvent } from 'react';
import { Plus, List } from 'lucide-react';
import type { DashboardData, Test } from '../../hooks/useDashboardData';
import type { User } from '../../App';

interface ExamsPageProps {
  data: DashboardData;
  user: User;
}

const ExamsPage = ({ data }: ExamsPageProps) => {
  const { tests, setTests, marks, setMarks, students, batches } = data;
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'marks'>('list');
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [marksEntry, setMarksEntry] = useState<Record<string | number, string | number>>({});
  
  const [testForm, setTestForm] = useState<Partial<Test>>({ 
    name: '', 
    date: '', 
    totalMarks: 100, 
    batchId: batches[0]?.id, 
    board: 'CBSE', 
    duration: '3', 
    questions: [] 
  });

  const handleCreateTest = (e: FormEvent) => {
    e.preventDefault();
    if (!testForm.batchId) return;

    const newTest: Test = { 
      ...testForm, 
      id: Date.now(), 
      batchId: parseInt(testForm.batchId.toString()),
      name: testForm.name || '',
      date: testForm.date || '',
      totalMarks: testForm.totalMarks || 100,
      board: testForm.board || 'CBSE',
      duration: testForm.duration || '3'
    };
    
    setTests([...tests, newTest]);
    setTestForm({ name: '', date: '', totalMarks: 100, batchId: batches[0]?.id, board: 'CBSE', duration: '3', questions: [] });
    setViewMode('list');
  };

  const openMarksEntry = (test: Test) => {
    setActiveTest(test);
    const existingMarks = marks.filter(m => m.testId === test.id);
    const marksMap: Record<string | number, string | number> = {};
    existingMarks.forEach(m => marksMap[m.studentId] = m.marksObtained);
    setMarksEntry(marksMap);
    setViewMode('marks');
  };

  const saveMarks = () => {
    if (!activeTest) return;
    const otherMarks = marks.filter(m => m.testId !== activeTest.id);
    const newMarks = Object.keys(marksEntry).map(studentId => ({
      testId: activeTest.id,
      studentId: parseInt(studentId),
      marksObtained: parseInt(marksEntry[studentId]?.toString() || '0')
    }));
    setMarks([...otherMarks, ...newMarks]);
    setViewMode('list');
  };

  if (viewMode === 'create') {
    return (
      <div className="bg-white rounded-xl p-6 border border-slate-200 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl">Create New Test</h3>
          <button onClick={() => setViewMode('list')} className="text-slate-500 hover:text-slate-700">
            Cancel
          </button>
        </div>
        <form onSubmit={handleCreateTest}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Test Name</label>
              <input 
                required 
                value={testForm.name} 
                onChange={e => setTestForm({...testForm, name: e.target.value})} 
                placeholder="e.g. Physics Weekly Test"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Batch</label>
              <select 
                className="w-full border p-2 rounded-lg" 
                value={testForm.batchId} 
                onChange={e => setTestForm({...testForm, batchId: parseInt(e.target.value)})}
              >
                {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input 
                type="date" 
                required 
                value={testForm.date} 
                onChange={e => setTestForm({...testForm, date: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Board Pattern</label>
              <select 
                className="w-full border p-2 rounded-lg" 
                value={testForm.board} 
                onChange={e => setTestForm({...testForm, board: e.target.value})}
              >
                <option value="CBSE">CBSE</option>
                <option value="Bihar Board">Bihar Board</option>
                <option value="ICSE">ICSE</option>
                <option value="State Board">Other State Board</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration (Hours)</label>
              <input 
                type="number" 
                step="0.5" 
                required 
                value={testForm.duration} 
                onChange={e => setTestForm({...testForm, duration: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Marks</label>
              <input 
                type="number" 
                value={testForm.totalMarks} 
                onChange={e => setTestForm({...testForm, totalMarks: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700">
              Save & Create Test
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (viewMode === 'marks' && activeTest) {
    const batchStudents = students.filter(s => parseInt(s.batchId as string) === activeTest.batchId);
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">{activeTest.name}</h2>
            <p className="text-gray-500">Max Marks: {activeTest.totalMarks}</p>
          </div>
          <button onClick={() => setViewMode('list')} className="text-slate-500 hover:text-slate-700">
            Back
          </button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4 w-32">Marks</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {batchStudents.map(s => (
                <tr key={s.id}>
                  <td className="p-4 font-medium">{s.name}</td>
                  <td className="p-4">
                    <input 
                      type="number" 
                      className="w-full border rounded p-1 text-center" 
                      max={activeTest.totalMarks} 
                      value={marksEntry[s.id] || ''} 
                      onChange={e => setMarksEntry({...marksEntry, [s.id]: e.target.value})} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 bg-gray-50 border-t flex justify-end">
            <button onClick={saveMarks} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
              Save Marks
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Test Reports & Papers</h2>
        <button 
          onClick={() => setViewMode('create')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus size={18} /> New Test
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map(test => {
          const testMarks = marks.filter(m => m.testId === test.id);
          const avg = testMarks.length ? (testMarks.reduce((a, b) => a + b.marksObtained, 0) / testMarks.length).toFixed(1) : 0;
          return (
            <div 
              key={test.id} 
              className="bg-white rounded-xl p-5 border border-slate-200 hover:shadow-lg transition-all border-t-4 border-t-indigo-500"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{test.name}</h3>
                <div className="flex flex-col items-end">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 mb-1">
                    {new Date(test.date).toLocaleDateString()}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-indigo-600">
                    {test.board || 'CBSE'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                {batches.find(b => b.id === test.batchId)?.name}
              </p>
              <div className="flex items-center gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-400 text-xs">Average</p>
                  <p className="font-bold text-gray-800">{avg} / {test.totalMarks}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Attended</p>
                  <p className="font-bold text-gray-800">{testMarks.length}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => openMarksEntry(test)}
                  className="flex-1 bg-slate-100 text-slate-700 py-2 px-3 rounded-lg text-xs font-medium hover:bg-slate-200 flex items-center justify-center gap-1"
                >
                  <List size={14} /> Marks
                </button>
              </div>
            </div>
          );
        })}
        {tests.length === 0 && (
          <p className="col-span-3 text-center text-gray-400 py-10">No tests scheduled yet.</p>
        )}
      </div>
    </div>
  );
};

export default ExamsPage;