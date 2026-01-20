import { useState, useEffect } from 'react';
import { Save, Camera } from 'lucide-react';
import type { DashboardData } from '../../hooks/useDashboardData';

interface AttendancePageProps {
  data: DashboardData;
}

const AttendancePage = ({ data }: AttendancePageProps) => {
  const { students, batches, attendance, setAttendance } = data;
  
  // Initialize with the first batch ID or an empty string
  const [selectedBatch, setSelectedBatch] = useState<string | number>(batches[0]?.id || '');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Status is a map of studentId -> 'present' | 'absent'
  const [status, setStatus] = useState<Record<string | number, 'present' | 'absent'>>({});

  useEffect(() => {
    // Ensure accurate comparison by converting both to numbers
    const batchIdNum = Number(selectedBatch);
    const record = attendance.find(r => r.date === date && r.batchId === batchIdNum);

    if (record) {
      setStatus(record.records);
    } else {
      const batchStudents = students.filter(s => Number(s.batchId) === batchIdNum);
      const initialStatus: Record<string | number, 'present' | 'absent'> = {};
      batchStudents.forEach(s => initialStatus[s.id] = 'absent');
      setStatus(initialStatus);
    }
  }, [date, selectedBatch, students, attendance]);

  const handleSave = () => {
    const batchIdNum = Number(selectedBatch);
    
    const newRecord = { 
      id: Date.now(), 
      date, 
      batchId: batchIdNum, 
      records: status 
    };
    
    // Remove existing record for this date/batch if exists to overwrite
    const otherRecords = attendance.filter(r => !(r.date === date && r.batchId === batchIdNum));
    
    setAttendance([...otherRecords, newRecord]);
    alert("Attendance Saved!");
  };

  const toggleStatus = (id: string | number) => {
    setStatus((prev) => {
      const newStatus = prev[id] === 'present' ? 'absent' : 'present';
      
      // FIX: Use 'as' to strictly type the returned object
      return {
        ...prev,
        [id]: newStatus
      } as Record<string | number, 'present' | 'absent'>;
    });
  };

  const batchStudents = students.filter(s => Number(s.batchId) === Number(selectedBatch));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Attendance Manager</h2>
      
      <div className="bg-white rounded-xl p-4 border border-slate-200 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Batch</label>
          <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} className="w-full border rounded-lg px-3 py-2">
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50">
            <Camera size={18} /> AI Scan
          </button>
          <button onClick={handleSave} className="bg-indigo-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700">
            <Save size={18} /> Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {batchStudents.map(student => (
          <div 
            key={student.id} 
            onClick={() => toggleStatus(student.id)} 
            className={`cursor-pointer p-4 rounded-xl border-2 flex items-center justify-between transition-all select-none ${
              status[student.id] === 'present' ? 'border-green-500 bg-green-50' : 'border-red-100 bg-white hover:border-red-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                status[student.id] === 'present' ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                {student.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{student.name}</p>
                <p className="text-xs text-gray-500">Roll: {student.roll}</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              status[student.id] === 'present' ? 'bg-green-200 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {status[student.id] === 'present' ? 'P' : 'A'}
            </div>
          </div>
        ))}
        {batchStudents.length === 0 && (
          <p className="text-gray-500 col-span-3 text-center py-10">No students in this batch.</p>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;