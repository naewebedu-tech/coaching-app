import { useState, useEffect } from 'react';
import { Save, CheckCircle, XCircle, Loader2, Users, CheckSquare, Square } from 'lucide-react';
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

    // 1. Find if attendance exists
    const existingRecord = attendance.find(
      (r) => r.batch === selectedBatch && r.date === date
    );

    if (existingRecord) {
      setIsNewRecord(false);
      const newStatusMap: Record<string, 'present' | 'absent'> = {};
      existingRecord.records.forEach((rec) => {
        newStatusMap[rec.student] = rec.status;
      });
      setStatusMap(newStatusMap);
    } else {
      setIsNewRecord(true);
      const batchStudents = students.filter(s => s.batch === selectedBatch);
      const initialStatus: Record<string, 'present' | 'absent'> = {};
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
    // Haptic feedback for mobile feel
    if (navigator.vibrate) navigator.vibrate(50);

    setStatusMap(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
    }));
  };

  const markAll = (status: 'present' | 'absent') => {
    if (navigator.vibrate) navigator.vibrate(50);
    const newMap = { ...statusMap };
    activeStudents.forEach(s => newMap[s.id] = status);
    setStatusMap(newMap);
  };

  // Filter students for the active batch
  const activeStudents = students.filter(s => s.batch === selectedBatch);

  // Stats
  const presentCount = Object.values(statusMap).filter(s => s === 'present').length;
  const totalCount = activeStudents.length;
  const absentCount = totalCount - presentCount;

  return (
    <div className="pb-24 md:pb-0 animate-in fade-in duration-300"> {/* Added padding bottom for mobile sticky footer */}
      
      {/* 1. Sticky Header Controls (Mobile Optimized) */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm -mx-4 px-4 py-3 md:mx-0 md:px-0 md:py-0 md:static md:shadow-none md:border-none md:bg-transparent md:backdrop-blur-none mb-4 md:mb-6">
        
        {/* Desktop Title (Hidden on Mobile to save space) */}
        <div className="hidden md:flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Attendance Manager</h2>
            <p className="text-sm text-gray-500">{isNewRecord ? 'Marking New' : 'Editing Record'}</p>
          </div>
          {/* Desktop Save Button */}
          <button 
            onClick={handleSave} 
            disabled={saveMutation.isPending || activeStudents.length === 0}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-md"
          >
            {saveMutation.isPending ? <Loader2 className="animate-spin w-4 h-4"/> : <Save size={18} />} 
            Save Attendance
          </button>
        </div>

        {/* Inputs Row */}
        <div className="flex flex-row gap-3">
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-500 uppercase md:hidden block mb-1">Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white" 
            />
          </div>
          <div className="flex-[1.5]">
            <label className="text-xs font-bold text-gray-500 uppercase md:hidden block mb-1">Batch</label>
            <select 
              value={selectedBatch} 
              onChange={e => setSelectedBatch(e.target.value)} 
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-ellipsis"
            >
              <option value="" disabled>Select Batch</option>
              {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        </div>

        {/* Mobile Quick Actions Bar */}
        <div className="flex items-center justify-between mt-3 md:hidden">
            <div className="flex gap-2">
                <button onClick={() => markAll('present')} className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full flex items-center gap-1">
                    <CheckSquare size={12} /> All Present
                </button>
                <button onClick={() => markAll('absent')} className="text-xs bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-full flex items-center gap-1">
                    <Square size={12} /> All Absent
                </button>
            </div>
            <div className="text-xs font-bold text-slate-500">
                {presentCount}/{totalCount} Present
            </div>
        </div>
      </div>
      
      {/* 2. Desktop Stats & Actions (Hidden on Mobile) */}
      <div className="hidden md:flex bg-white rounded-xl p-4 border border-slate-200 shadow-sm mb-6 justify-between items-center">
         <div className="flex gap-4">
             <button onClick={() => markAll('present')} className="text-sm text-green-700 hover:underline flex items-center gap-1"><CheckSquare size={16}/> Mark All Present</button>
             <button onClick={() => markAll('absent')} className="text-sm text-red-600 hover:underline flex items-center gap-1"><Square size={16}/> Mark All Absent</button>
         </div>
         <div className="flex gap-6 text-sm font-medium">
            <span className="text-green-600">Present: {presentCount}</span>
            <span className="text-red-500">Absent: {absentCount}</span>
         </div>
      </div>

      {/* 3. Student Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        {activeStudents.map(student => {
          const isPresent = statusMap[student.id] === 'present';
          
          return (
            <div 
              key={student.id} 
              onClick={() => toggleStatus(student.id)} 
              className={`
                cursor-pointer p-3 md:p-4 rounded-xl border-2 flex items-center justify-between transition-all select-none touch-manipulation active:scale-[0.98]
                ${isPresent 
                  ? 'border-green-500 bg-green-50/50 shadow-sm' 
                  : 'border-red-200 bg-white hover:border-red-300 shadow-sm'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-colors text-sm
                  ${isPresent ? 'bg-green-500' : 'bg-slate-300'}
                `}>
                  {student.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 leading-tight text-sm md:text-base">{student.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Roll: {student.roll || 'N/A'}</p>
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
            <Users className="mx-auto h-10 w-10 text-slate-300 mb-2" />
            <p className="text-slate-500 font-medium">No students found.</p>
            <p className="text-sm text-slate-400 mt-1">Select a different batch.</p>
          </div>
        )}
      </div>

      {/* 4. Mobile Sticky Bottom Bar (Save Button) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-30 flex gap-4 items-center">
         <div className="flex flex-col text-xs font-medium text-slate-500">
             <span>Total: {totalCount}</span>
             <span className="text-red-500">Abs: {absentCount}</span>
         </div>
         <button 
            onClick={handleSave} 
            disabled={saveMutation.isPending || activeStudents.length === 0}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform flex justify-center items-center gap-2"
         >
            {saveMutation.isPending ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Save Attendance
         </button>
      </div>

    </div>
  );
};

export default AttendancePage;