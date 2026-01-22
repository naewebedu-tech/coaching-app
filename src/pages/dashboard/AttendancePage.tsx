import { useState, useEffect } from 'react';
import { Save, Camera, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '../../services/api';
import type { DashboardData } from '../../hooks/useDashboardData';
import toast from 'react-hot-toast';

interface AttendancePageProps {
  data: DashboardData;
}

const AttendancePage = ({ data }: AttendancePageProps) => {
  const { students, batches, attendance } = data;
  
  // State
  const [selectedBatch, setSelectedBatch] = useState<string>(batches[0]?.id || '');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [statusMap, setStatusMap] = useState<Record<string, 'present' | 'absent'>>({});
  const [isNewRecord, setIsNewRecord] = useState(true);

  const queryClient = useQueryClient();

  // --- Effects ---

  useEffect(() => {
    if (!selectedBatch) return;

    // 1. Find if attendance exists for this batch & date in the loaded data
    const existingRecord = attendance.find(
      (r) => r.batch === selectedBatch && r.date === date
    );

    if (existingRecord) {
      // Load existing status
      setIsNewRecord(false);
      const newStatusMap: Record<string, 'present' | 'absent'> = {};
      
      // Map API records array to local state object
      existingRecord.records.forEach((rec) => {
        newStatusMap[rec.student] = rec.status;
      });
      setStatusMap(newStatusMap);
    } else {
      // Reset for new entry
      setIsNewRecord(true);
      const batchStudents = students.filter(s => s.batch === selectedBatch);
      const initialStatus: Record<string, 'present' | 'absent'> = {};
      
      // Default to 'present' for better UX (or 'absent' if preferred)
      batchStudents.forEach(s => {
        initialStatus[s.id] = 'present';
      });
      setStatusMap(initialStatus);
    }
  }, [date, selectedBatch, attendance, students]);

  // --- Mutation ---

  const saveMutation = useMutation({
    mutationFn: attendanceService.save,
    onSuccess: () => {
      toast.success(isNewRecord ? "Attendance Marked" : "Attendance Updated");
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (err: any) => {
      toast.error("Failed to save attendance");
      console.error(err);
    }
  });

  // --- Handlers ---

  const handleSave = () => {
    // Format payload for Django API
    // Expected: { batch: uuid, date: YYYY-MM-DD, records: [{ student: uuid, status: '...' }] }
    const recordsArray = Object.entries(statusMap).map(([studentId, status]) => ({
      student: studentId,
      status: status
    }));

    saveMutation.mutate({
      batch: selectedBatch,
      date: date,
      records: recordsArray
    });
  };

  const toggleStatus = (studentId: string) => {
    setStatusMap(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
    }));
  };

  // Filter students for the active batch
  const activeStudents = students.filter(s => s.batch === selectedBatch);

  // Stats for the current view
  const presentCount = Object.values(statusMap).filter(s => s === 'present').length;
  const totalCount = activeStudents.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Attendance Manager</h2>
          <p className="text-sm text-gray-500">
            {isNewRecord ? 'Marking New Attendance' : 'Editing Existing Record'}
          </p>
        </div>
      </div>
      
      {/* Controls Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full md:w-auto">
          <label className="block text-sm font-medium mb-1 text-gray-700">Date</label>
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" 
          />
        </div>
        <div className="flex-1 w-full md:w-auto">
          <label className="block text-sm font-medium mb-1 text-gray-700">Batch</label>
          <select 
            value={selectedBatch} 
            onChange={e => setSelectedBatch(e.target.value)} 
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
          >
            <option value="" disabled>Select a batch</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          {/* AI Scan Button (Placeholder for future feature) */}
          <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors flex-1 md:flex-none justify-center">
            <Camera size={18} /> <span className="hidden sm:inline">AI Scan</span>
          </button>
          
          <button 
            onClick={handleSave} 
            disabled={saveMutation.isPending || activeStudents.length === 0}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors flex-1 md:flex-none justify-center disabled:opacity-50 shadow-md hover:shadow-lg"
          >
            {saveMutation.isPending ? <Loader2 className="animate-spin w-4 h-4"/> : <Save size={18} />} 
            Save
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {activeStudents.length > 0 && (
        <div className="flex items-center gap-4 text-sm font-medium bg-indigo-50 text-indigo-800 p-3 rounded-lg border border-indigo-100">
          <span>Total: {totalCount}</span>
          <span className="w-px h-4 bg-indigo-200"></span>
          <span className="text-green-700">Present: {presentCount}</span>
          <span className="w-px h-4 bg-indigo-200"></span>
          <span className="text-red-600">Absent: {totalCount - presentCount}</span>
        </div>
      )}

      {/* Student Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {activeStudents.map(student => {
          const isPresent = statusMap[student.id] === 'present';
          
          return (
            <div 
              key={student.id} 
              onClick={() => toggleStatus(student.id)} 
              className={`
                cursor-pointer p-4 rounded-xl border-2 flex items-center justify-between transition-all select-none
                ${isPresent 
                  ? 'border-green-500 bg-green-50 shadow-sm' 
                  : 'border-red-200 bg-white hover:border-red-300 shadow-sm'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-colors
                  ${isPresent ? 'bg-green-500' : 'bg-slate-300'}
                `}>
                  {student.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 leading-tight">{student.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Roll: {student.roll}</p>
                </div>
              </div>
              
              <div className="pl-2">
                {isPresent ? (
                  <CheckCircle className="w-6 h-6 text-green-600 fill-green-100" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400 fill-red-50" />
                )}
              </div>
            </div>
          );
        })}

        {activeStudents.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
            <p className="text-slate-500 font-medium">No students found in this batch.</p>
            <p className="text-sm text-slate-400 mt-1">Add students from the "Students" tab to start marking attendance.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;