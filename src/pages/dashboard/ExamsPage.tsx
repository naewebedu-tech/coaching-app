import React, { useState } from 'react';
import { Plus, List, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { testService } from '../../services/api';
import type { DashboardData, Test } from '../../hooks/useDashboardData';
import type { User } from '../../App';
import toast from 'react-hot-toast';
import AIQPaper from './AiQuestionGenerator';

interface ExamsPageProps {
  data: DashboardData;
  user: User;
}

const ExamsPage = ({ data }: ExamsPageProps) => {
  const { tests, students, batches } = data;
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'marks'>('list');
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  
  // Marks Entry State: Map studentId -> marks
  const [marksEntry, setMarksEntry] = useState<Record<string, number>>({});
  
  // Create Test Form State
  const [testForm, setTestForm] = useState<Partial<Test>>({ 
    name: '', 
    date: new Date().toISOString().split('T')[0], 
    total_marks: 100, 
    batch: '', 
    board: 'CBSE', 
    duration: '3.0' 
  });

  const queryClient = useQueryClient();

  // --- Mutations ---

  const createTestMutation = useMutation({
    mutationFn: testService.create,
    onSuccess: () => {
      toast.success("Test Scheduled Successfully");
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      setViewMode('list');
      setTestForm({ ...testForm, name: '', batch: '' });
    },
    onError: (err: any) => {
      toast.error("Failed to create test");
      console.error(err);
    }
  });

  const saveMarksMutation = useMutation({
    mutationFn: (data: { testId: string, marks: any[] }) => 
      testService.saveMarksBulk(data.testId, data.marks),
    onSuccess: () => {
      toast.success("Marks Saved Successfully");
      queryClient.invalidateQueries({ queryKey: ['tests'] }); // Refetch tests to update averages
      setViewMode('list');
    },
    onError: (err: any) => {
      toast.error("Failed to save marks");
      console.error(err);
    }
  });

  // --- Handlers ---

  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testForm.batch || !testForm.name) return;
    createTestMutation.mutate(testForm);
  };

  const handleOpenMarks = async (test: Test) => {
    setActiveTest(test);
    setMarksEntry({}); // Reset
    
    // Ideally, fetch existing marks for this test from API
    // For now, we rely on what might be loaded or load freshly
    try {
      const existingMarks = await testService.getAllMarks(test.id);
      const marksMap: Record<string, number> = {};
      existingMarks.forEach((m: any) => {
        marksMap[m.student] = m.marks_obtained;
      });
      setMarksEntry(marksMap);
      setViewMode('marks');
    } catch (error) {
      toast.error("Could not load existing marks");
    }
  };

  const handleSaveMarks = () => {
    if (!activeTest) return;
    
    // Convert map to array for API
    const marksArray = Object.entries(marksEntry).map(([studentId, score]) => ({
      student: studentId,
      marks_obtained: score
    }));

    saveMarksMutation.mutate({ testId: activeTest.id, marks: marksArray });
  };

  // --- Views ---

  if (viewMode === 'create') {
    return (
      <div className="bg-white rounded-xl p-6 border border-slate-200 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl">Create New Test</h3>
          <button onClick={() => setViewMode('list')} className="text-slate-500 hover:text-slate-700">Cancel</button>
        </div>
        <form onSubmit={handleCreateTest}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Test Name</label>
              <input required value={testForm.name} onChange={e => setTestForm({...testForm, name: e.target.value})} placeholder="e.g. Physics Weekly Test" className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Batch</label>
              <select className="w-full border p-2 rounded-lg" value={testForm.batch} onChange={e => setTestForm({...testForm, batch: e.target.value})} required>
                <option value="">Select Batch</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input type="date" required value={testForm.date} onChange={e => setTestForm({...testForm, date: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Board Pattern</label>
              <select className="w-full border p-2 rounded-lg" value={testForm.board} onChange={e => setTestForm({...testForm, board: e.target.value})}>
                <option value="CBSE">CBSE</option>
                <option value="Bihar Board">Bihar Board</option>
                <option value="ICSE">ICSE</option>
                <option value="State Board">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration (Hours)</label>
              <input type="number" step="0.5" required value={testForm.duration} onChange={e => setTestForm({...testForm, duration: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Marks</label>
              <input type="number" value={testForm.total_marks} onChange={e => setTestForm({...testForm, total_marks: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="submit" disabled={createTestMutation.isPending} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 flex items-center gap-2">
              {createTestMutation.isPending && <Loader2 className="animate-spin w-4 h-4"/>}
              Save & Create
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (viewMode === 'marks' && activeTest) {
    const batchStudents = students.filter(s => s.batch === activeTest.batch);
    
    return (
      <div className="space-y-4 max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">{activeTest.name}</h2>
            <p className="text-gray-500">Max Marks: {activeTest.total_marks}</p>
          </div>
          <button onClick={() => setViewMode('list')} className="p-2 hover:bg-slate-100 rounded-lg"><ArrowLeft size={20}/></button>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4 w-32">Marks Obtained</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {batchStudents.map(s => (
                <tr key={s.id}>
                  <td className="p-4 font-medium">{s.name} <span className="text-xs text-gray-400 block">{s.roll}</span></td>
                  <td className="p-4">
                    <input 
                      type="number" 
                      className="w-full border rounded p-2 text-center focus:ring-2 focus:ring-indigo-500 outline-none" 
                      max={activeTest.total_marks} 
                      value={marksEntry[s.id] || ''} 
                      onChange={e => setMarksEntry({...marksEntry, [s.id]: Number(e.target.value)})} 
                      placeholder="0"
                    />
                  </td>
                </tr>
              ))}
              {batchStudents.length === 0 && (
                <tr><td colSpan={2} className="p-6 text-center text-gray-500">No students found in this batch.</td></tr>
              )}
            </tbody>
          </table>
          <div className="p-4 bg-gray-50 border-t flex justify-end">
            <button onClick={handleSaveMarks} disabled={saveMarksMutation.isPending} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
               {saveMarksMutation.isPending ? <Loader2 className="animate-spin w-4 h-4"/> : <Save size={18}/>}
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
        <h2 className="text-2xl font-bold text-gray-800">Exam Portal</h2>
        <button onClick={() => setViewMode('create')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors">
          <Plus size={18} /> New Test
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map(test => {
          // Note: Average calculation relies on backend data or local calculation if marks are loaded
          // Here we assume the backend might send an 'average_marks' field if implemented in serializer
          // For now, we display basic info
          return (
            <div key={test.id} className="bg-white rounded-xl p-5 border border-slate-200 hover:shadow-lg transition-all border-t-4 border-t-indigo-500 group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg group-hover:text-indigo-600 transition-colors">{test.name}</h3>
                <div className="flex flex-col items-end">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 mb-1">{new Date(test.date).toLocaleDateString()}</span>
                  <span className="text-[10px] uppercase font-bold text-indigo-600">{test.board}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-4">{test.batch_name || batches.find(b => b.id === test.batch)?.name || 'Unknown Batch'}</p>
              
              <div className="flex items-center gap-4 text-sm mb-4 bg-slate-50 p-2 rounded-lg">
                <div><p className="text-gray-400 text-xs">Total Marks</p><p className="font-bold text-gray-800">{test.total_marks}</p></div>
                <div><p className="text-gray-400 text-xs">Duration</p><p className="font-bold text-gray-800">{test.duration} hrs</p></div>
              </div>

              <button onClick={() => handleOpenMarks(test)} className="w-full bg-indigo-50 text-indigo-700 py-2 px-3 rounded-lg text-sm font-semibold hover:bg-indigo-100 flex items-center justify-center gap-2 transition-colors">
                <List size={16} /> Update Marks
              </button>
            </div>
          );
        })}
        {tests.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400"><List size={32} /></div>
            <p className="text-gray-500 font-medium">No tests scheduled yet.</p>
            <p className="text-sm text-gray-400">Create a new test to get started.</p>
          </div>
        )}
      </div>
      <AIQPaper />
    </div>
    
  );
};

export default ExamsPage;