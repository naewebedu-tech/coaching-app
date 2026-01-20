import { useState, type FormEvent } from 'react';
import { Search, UserPlus, Eye, Trash2, CheckCircle, ArrowLeft } from 'lucide-react';
import type { DashboardData, Student } from '../../hooks/useDashboardData';

interface StudentsPageProps {
  data: DashboardData;
}

const StudentsPage = ({ data }: StudentsPageProps) => {
  const { students, setStudents, batches } = data;
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentStudent, setCurrentStudent] = useState<Partial<Student> | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'profile'>('list');

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.phone.includes(searchTerm);
    // Ensure we compare numbers to numbers for batchId
    const matchesBatch = selectedBatch === 'all' || Number(s.batchId) === Number(selectedBatch);
    return matchesSearch && matchesBatch;
  });

  const handleSaveStudent = (e: FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;

    if (currentStudent.id) {
      // Edit existing
      const updatedStudent = currentStudent as Student;
      setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    } else {
      // Add new
      const newStudent: Student = {
        ...currentStudent,
        id: Date.now(),
        feesPaid: 0, // Default to 0
        // Ensure strictly typed fallbacks
        totalFees: Number(currentStudent.totalFees) || 0,
        batchId: Number(currentStudent.batchId)
      } as Student;
      setStudents([...students, newStudent]);
    }
    setIsEditing(false);
    setCurrentStudent(null);
  };

  const deleteStudent = (id: number | string) => {
    if(window.confirm("Are you sure? This will delete all student data.")) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  // --- PROFILE VIEW ---
  if (viewMode === 'profile' && selectedStudentId) {
    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return <div>Student not found</div>;
    
    const batch = batches.find(b => b.id === Number(student.batchId));
    
    // FIX: No need to cast to string and back to int. They are already numbers.
    const total = student.totalFees || 0;
    const paid = student.feesPaid || 0;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setViewMode('list')} className="p-2 hover:bg-slate-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold">Student Profile</h2>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-3xl font-bold text-indigo-600">
              {student.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold">{student.name}</h3>
              <p className="text-slate-500">Roll No: {student.roll} • {batch?.name}</p>
              <div className="flex gap-4 mt-2">
                <span className="text-sm bg-slate-100 px-3 py-1 rounded">📞 {student.phone}</span>
                <span className="text-sm bg-slate-100 px-3 py-1 rounded">🎓 {batch?.timing}</span>
              </div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 uppercase font-bold">Fee Status</p>
              <p className="text-2xl font-bold text-green-600">
                {paid >= total ? 'Paid' : `₹${(total - paid).toLocaleString()} Due`}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Students</h2>
        <button 
          onClick={() => {
            setCurrentStudent({ name: '', batchId: batches[0]?.id || 0, phone: '', roll: '', totalFees: 0 });
            setIsEditing(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
        >
          <UserPlus className="w-4 h-4" />
          Add Student
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="px-4 py-2 border border-slate-200 rounded-lg bg-white outline-none"
          value={selectedBatch}
          onChange={e => setSelectedBatch(e.target.value)}
        >
          <option value="all">All Batches</option>
          {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {isEditing && currentStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{currentStudent.id ? 'Edit Student' : 'Add New Student'}</h3>
            <form onSubmit={handleSaveStudent} className="space-y-4">
              <input 
                type="text" 
                placeholder="Full Name" 
                required
                className="w-full px-4 py-2 border rounded-lg"
                value={currentStudent.name || ''}
                onChange={e => setCurrentStudent({...currentStudent, name: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="Roll Number"
                className="w-full px-4 py-2 border rounded-lg"
                value={currentStudent.roll || ''}
                onChange={e => setCurrentStudent({...currentStudent, roll: e.target.value})}
              />
              <input 
                type="tel" 
                placeholder="Phone"
                required
                className="w-full px-4 py-2 border rounded-lg"
                value={currentStudent.phone || ''}
                onChange={e => setCurrentStudent({...currentStudent, phone: e.target.value})}
              />
              
              {/* Batch ID Select */}
              <select 
                className="w-full px-4 py-2 border rounded-lg"
                value={currentStudent.batchId || ''}
                // FIX: Convert string value from select to Number
                onChange={e => setCurrentStudent({...currentStudent, batchId: Number(e.target.value)})}
                required
              >
                <option value="">Select Batch</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>

              {/* Total Fees Input */}
              <input 
                type="number" 
                placeholder="Total Course Fee (₹)"
                required
                className="w-full px-4 py-2 border rounded-lg"
                value={currentStudent.totalFees || ''}
                // FIX: Convert input string to Number before setting state
                onChange={e => setCurrentStudent({...currentStudent, totalFees: Number(e.target.value)})}
              />
              
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Roll No</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Batch</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Fees Status</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredStudents.map(student => {
                // FIX: Removed unnecessary parseInt/casting
                const total = student.totalFees || 0;
                const paid = student.feesPaid || 0;
                const pending = total - paid;
                
                return (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-xs text-slate-500">{student.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{student.roll}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">
                        {batches.find(b => b.id === Number(student.batchId))?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {pending <= 0 ? (
                        <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                          <CheckCircle size={14} /> Paid
                        </span>
                      ) : (
                        <div className="text-sm">
                          <span className="text-orange-600 font-medium">Due: ₹{pending.toLocaleString()}</span>
                          <div className="w-20 h-1.5 bg-slate-200 rounded mt-1">
                            <div className="h-full bg-green-500 rounded" style={{width: `${total > 0 ? (paid / total) * 100 : 0}%`}}></div>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setSelectedStudentId(student.id); setViewMode('profile'); }}
                          className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"
                        >
                          <Eye size={16} /> View
                        </button>
                        <button 
                          onClick={() => deleteStudent(student.id)}
                          className="text-slate-400 hover:text-red-500 p-2"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentsPage;