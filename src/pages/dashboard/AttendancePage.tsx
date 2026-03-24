import { useState, useMemo } from 'react';
import {
  Save, CheckCircle, XCircle, Loader2, Users, CheckSquare, Square,
  CalendarDays, ChevronLeft, ChevronRight, ArrowLeft, Lock,
  BarChart3, Download, User, Coffee,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '../../services/api';
import type { DashboardData } from '../../hooks/useDashboardData';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

// FIX: 'report' is now part of the union — this was the TypeScript error
type AttendanceView = 'mark' | 'class_history' | 'student_calendar' | 'report';

type AttendanceStatus = 'present' | 'absent' | 'leave';

interface AttendanceRecordItem {
  student: string;
  status: AttendanceStatus;
}

interface AttendancePageProps {
  data: DashboardData;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants / helpers
// ─────────────────────────────────────────────────────────────────────────────

const todayStr = () => new Date().toISOString().split('T')[0];

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const monthLabel = (y: number, m: number) =>
  new Date(y, m).toLocaleString('default', { month: 'long', year: 'numeric' });

const daysInMonth  = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
const firstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

// ─────────────────────────────────────────────────────────────────────────────
// Small reusable pieces
// ─────────────────────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: AttendanceStatus | undefined }) {
  if (status === 'present')
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
        <CheckCircle size={10} /> P
      </span>
    );
  if (status === 'leave')
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
        <Coffee size={10} /> L
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
      <XCircle size={10} /> A
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 1 — Mark Attendance
// ─────────────────────────────────────────────────────────────────────────────

function MarkAttendance({ data }: { data: DashboardData }) {
  const { students, batches, attendance } = data;

  const [selectedBatch, setSelectedBatch] = useState<string>(batches[0]?.id || '');
  const [date, setDate]                   = useState<string>(todayStr());
  const [statusMap, setStatusMap]         = useState<Record<string, AttendanceStatus>>({});
  const [isNewRecord, setIsNewRecord]     = useState(true);

  const queryClient = useQueryClient();
  const isEditable  = date === todayStr();

  // Sync statusMap whenever batch / date / attendance changes
  useMemo(() => {
    if (!selectedBatch) return;
    const existing = attendance.find(
      (r: any) => r.batch === selectedBatch && r.date === date
    );
    if (existing) {
      setIsNewRecord(false);
      const map: Record<string, AttendanceStatus> = {};
      existing.records.forEach((rec: AttendanceRecordItem) => {
        map[rec.student] = rec.status;
      });
      setStatusMap(map);
    } else {
      setIsNewRecord(true);
      const init: Record<string, AttendanceStatus> = {};
      students
        .filter((s: any) => s.batch === selectedBatch)
        .forEach((s: any) => { init[s.id] = 'present'; });
      setStatusMap(init);
    }
  }, [date, selectedBatch, attendance, students]);

  const saveMutation = useMutation({
    mutationFn: attendanceService.save,
    onSuccess: () => {
      toast.success(isNewRecord ? 'Attendance Marked' : 'Attendance Updated');
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: () => toast.error('Failed to save attendance'),
  });

  const handleSave = () => {
    const recordsArray = Object.entries(statusMap).map(([studentId, st]) => ({
      student: studentId,
      status:  st,
    }));
    saveMutation.mutate({ batch: selectedBatch, date, records: recordsArray });
  };

  const cycleStatus = (id: string) => {
    if (!isEditable) return;
    if (navigator.vibrate) navigator.vibrate(30);
    setStatusMap(prev => {
      const cur  = prev[id];
      const next: AttendanceStatus =
        cur === 'present' ? 'absent' : cur === 'absent' ? 'leave' : 'present';
      return { ...prev, [id]: next };
    });
  };

  const markAll = (st: AttendanceStatus) => {
    if (!isEditable) return;
    const m = { ...statusMap };
    activeStudents.forEach((s: any) => { m[s.id] = st; });
    setStatusMap(m);
  };

  const activeStudents  = students.filter((s: any) => s.batch === selectedBatch);
  const presentCount    = Object.values(statusMap).filter(s => s === 'present').length;
  const absentCount     = Object.values(statusMap).filter(s => s === 'absent').length;
  const leaveCount      = Object.values(statusMap).filter(s => s === 'leave').length;

  return (
    <div className="pb-24 md:pb-0">
      {/* Sticky Controls */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm -mx-4 px-4 py-3 md:mx-0 md:px-0 md:py-0 md:static md:shadow-none md:border-none md:bg-transparent mb-4 md:mb-6">
        <div className="hidden md:flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Attendance Manager</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1.5">
              {isNewRecord ? 'Marking New' : 'Editing Record'}
              {!isEditable && (
                <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <Lock size={10} /> Past — Read Only
                </span>
              )}
            </p>
          </div>
          {isEditable && (
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending || activeStudents.length === 0}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-60"
            >
              {saveMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={18} />}
              Save Attendance
            </button>
          )}
        </div>

        {/* Date + Batch row */}
        <div className="flex flex-row gap-3">
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-500 uppercase md:hidden block mb-1">Date</label>
            <input
              type="date"
              value={date}
              max={todayStr()}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            />
          </div>
          <div className="flex-[1.5]">
            <label className="text-xs font-bold text-gray-500 uppercase md:hidden block mb-1">Batch</label>
            <select
              value={selectedBatch}
              onChange={e => setSelectedBatch(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              <option value="" disabled>Select Batch</option>
              {batches.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Read-only banner */}
        {!isEditable && (
          <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-700">
            <Lock size={14} /> Viewing {formatDate(date)} — Read Only
          </div>
        )}

        {/* Mobile quick actions */}
        {isEditable && (
          <div className="flex items-center justify-between mt-3 md:hidden">
            <div className="flex gap-2">
              <button onClick={() => markAll('present')} className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full flex items-center gap-1">
                <CheckSquare size={12} /> All P
              </button>
              <button onClick={() => markAll('absent')} className="text-xs bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-full flex items-center gap-1">
                <Square size={12} /> All A
              </button>
            </div>
            <div className="flex gap-2 text-xs font-bold">
              <span className="text-green-600">{presentCount}P</span>
              <span className="text-red-500">{absentCount}A</span>
              <span className="text-yellow-600">{leaveCount}L</span>
            </div>
          </div>
        )}
      </div>

      {/* Desktop stats row */}
      <div className="hidden md:flex bg-white rounded-xl p-4 border border-slate-200 shadow-sm mb-6 justify-between items-center">
        {isEditable ? (
          <div className="flex gap-4">
            <button onClick={() => markAll('present')} className="text-sm text-green-700 hover:underline flex items-center gap-1"><CheckSquare size={16} /> Mark All Present</button>
            <button onClick={() => markAll('absent')}  className="text-sm text-red-600   hover:underline flex items-center gap-1"><Square size={16} />    Mark All Absent</button>
          </div>
        ) : (
          <div className="text-sm text-amber-700 flex items-center gap-2 font-medium">
            <Lock size={14} /> Past record — cannot edit
          </div>
        )}
        <div className="flex gap-6 text-sm font-medium">
          <span className="text-green-600">Present: {presentCount}</span>
          <span className="text-red-500">Absent: {absentCount}</span>
          <span className="text-yellow-600">Leave: {leaveCount}</span>
        </div>
      </div>

      {/* Student Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {activeStudents.map((student: any) => {
          const st = statusMap[student.id];
          return (
            <div
              key={student.id}
              onClick={() => cycleStatus(student.id)}
              className={`
                p-3 md:p-4 rounded-xl border-2 flex items-center justify-between transition-all select-none shadow-sm
                ${st === 'present' ? 'border-green-500 bg-green-50/50' : st === 'leave' ? 'border-yellow-400 bg-yellow-50/50' : 'border-red-200 bg-white'}
                ${isEditable ? 'cursor-pointer active:scale-[0.98] touch-manipulation' : 'cursor-default'}
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${st === 'present' ? 'bg-green-500' : st === 'leave' ? 'bg-yellow-400' : 'bg-slate-300'}`}>
                  {student.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 leading-tight text-sm">{student.name}</p>
                  <p className="text-xs text-slate-500">Roll: {student.roll || 'N/A'}</p>
                </div>
              </div>
              <div className="pl-2 flex flex-col items-center">
                {st === 'present' ? (
                  <CheckCircle className="w-6 h-6 text-green-600 fill-green-100" />
                ) : st === 'leave' ? (
                  <Coffee className="w-6 h-6 text-yellow-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400 fill-red-50" />
                )}
                {isEditable && <span className="text-[10px] text-slate-400 mt-0.5">tap</span>}
              </div>
            </div>
          );
        })}

        {activeStudents.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
            <Users className="mx-auto h-10 w-10 text-slate-300 mb-2" />
            <p className="text-slate-500 font-medium">No students in this batch.</p>
          </div>
        )}
      </div>

      {/* Mobile sticky save bar */}
      {isEditable && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-30 flex gap-4 items-center">
          <div className="flex flex-col text-xs font-medium text-slate-500">
            <span className="text-green-600">{presentCount} P</span>
            <span className="text-red-500">{absentCount} A</span>
          </div>
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending || activeStudents.length === 0}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform flex justify-center items-center gap-2 disabled:opacity-60"
          >
            {saveMutation.isPending ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Save Attendance
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 2 — Class History
// ─────────────────────────────────────────────────────────────────────────────

function ClassHistory({ data }: { data: DashboardData }) {
  const { students, batches, attendance } = data;
  const [selectedBatch, setSelectedBatch] = useState<string>(batches[0]?.id || '');
  const [expandedDate, setExpandedDate]   = useState<string | null>(null);

  const batchAttendance = useMemo(
    () =>
      [...attendance]
        .filter((r: any) => r.batch === selectedBatch)
        .sort((a: any, b: any) => b.date.localeCompare(a.date)),
    [attendance, selectedBatch]
  );

  const batchStudents = students.filter((s: any) => s.batch === selectedBatch);

  const exportCSV = () => {
    if (!batchAttendance.length) return;
    const headers = ['Date', ...batchStudents.map((s: any) => s.name)];
    const rows = batchAttendance.map((rec: any) => {
      const map: Record<string, string> = {};
      rec.records.forEach((r: AttendanceRecordItem) => {
        map[r.student] = r.status.charAt(0).toUpperCase();
      });
      return [rec.date, ...batchStudents.map((s: any) => map[s.id] || '-')];
    });
    const csv  = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `attendance_${batches.find((b: any) => b.id === selectedBatch)?.name || 'batch'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Class Attendance History</h2>
          <p className="text-sm text-gray-500">Date-wise view — past dates are read only</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={selectedBatch}
            onChange={e => setSelectedBatch(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
          >
            {batches.map((b: any) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg text-sm hover:bg-slate-50 font-medium"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {batchAttendance.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
          <CalendarDays className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No records yet for this batch.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {batchAttendance.map((record: any) => {
            const statusMap: Record<string, AttendanceStatus> = {};
            record.records.forEach((r: AttendanceRecordItem) => {
              statusMap[r.student] = r.status;
            });
            const presentCount = record.records.filter((r: AttendanceRecordItem) => r.status === 'present').length;
            const total        = batchStudents.length;
            const pct          = total > 0 ? Math.round((presentCount / total) * 100) : 0;
            const isOpen       = expandedDate === record.date;
            const isPast       = record.date !== todayStr();

            return (
              <div key={record.date} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedDate(isOpen ? null : record.date)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {isPast && <Lock size={14} className="text-slate-400 flex-shrink-0" />}
                    <div>
                      <div className="font-semibold text-slate-800">{formatDate(record.date)}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{presentCount}/{total} Present</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2">
                      <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold ${pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                        {pct}%
                      </span>
                    </div>
                    <ChevronRight size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {batchStudents.map((student: any) => {
                        const st = statusMap[student.id];
                        return (
                          <div
                            key={student.id}
                            className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium border ${
                              st === 'present' ? 'bg-green-50 border-green-200 text-green-700' :
                              st === 'leave'   ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                                 'bg-red-50 border-red-200 text-red-600'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0 ${st === 'present' ? 'bg-green-500' : st === 'leave' ? 'bg-yellow-400' : 'bg-red-400'}`}>
                              {student.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="truncate">{student.name}</div>
                              <div className="text-[10px] opacity-70 capitalize">{st || 'no record'}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex gap-4 text-xs font-medium text-slate-500">
                      <span className="text-green-600">● Present: {record.records.filter((r: AttendanceRecordItem) => r.status === 'present').length}</span>
                      <span className="text-red-500">● Absent: {record.records.filter((r: AttendanceRecordItem) => r.status === 'absent').length}</span>
                      <span className="text-yellow-600">● Leave: {record.records.filter((r: AttendanceRecordItem) => r.status === 'leave').length}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 3 — Student Calendar
// ─────────────────────────────────────────────────────────────────────────────

function StudentCalendar({ data }: { data: DashboardData }) {
  const { students, batches, attendance } = data;
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [calYear,  setCalYear]  = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [batchFilter, setBatchFilter] = useState('all');

  const filteredStudents = students.filter(
    (s: any) => batchFilter === 'all' || s.batch === batchFilter
  );

  const selectedStudent = students.find((s: any) => s.id === selectedStudentId);

  // date → status map for selected student
  const studentAttMap = useMemo<Record<string, AttendanceStatus>>(() => {
    if (!selectedStudentId) return {};
    const map: Record<string, AttendanceStatus> = {};
    attendance.forEach((rec: any) => {
      rec.records.forEach((r: AttendanceRecordItem) => {
        if (r.student === selectedStudentId) map[rec.date] = r.status;
      });
    });
    return map;
  }, [selectedStudentId, attendance]);

  // Overall + monthly stats
  const stats = useMemo(() => {
    if (!selectedStudentId) return null;
    const entries = Object.values(studentAttMap);
    const total   = entries.length;
    const present = entries.filter(s => s === 'present').length;
    const absent  = entries.filter(s => s === 'absent').length;
    const leave   = entries.filter(s => s === 'leave').length;
    const pct     = total > 0 ? Math.round((present / total) * 100) : 0;

    const months: Record<string, { present: number; absent: number; leave: number; total: number; pct: number }> = {};
    Object.entries(studentAttMap).forEach(([date, status]) => {
      const key = date.slice(0, 7);
      if (!months[key]) months[key] = { present: 0, absent: 0, leave: 0, total: 0, pct: 0 };
      months[key].total++;
      months[key][status]++;
    });
    Object.values(months).forEach(m => {
      m.pct = m.total > 0 ? Math.round((m.present / m.total) * 100) : 0;
    });

    return { total, present, absent, leave, pct, months };
  }, [selectedStudentId, studentAttMap]);

  // Calendar grid cells
  const calendarDays = useMemo(() => {
    const cells: { day: number; date: string; status: AttendanceStatus | undefined }[] = [];
    const firstDay  = firstDayOfMonth(calYear, calMonth);
    const totalDays = daysInMonth(calYear, calMonth);
    // pad prefix
    for (let i = 0; i < firstDay; i++) cells.push({ day: 0, date: '', status: undefined });
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, date: dateStr, status: studentAttMap[dateStr] });
    }
    return cells;
  }, [calYear, calMonth, studentAttMap]);

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  // ── Student detail view ──
  if (selectedStudentId && selectedStudent) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedStudentId(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors border border-slate-200">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg border-2 border-indigo-200">
              {selectedStudent.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{selectedStudent.name}</h2>
              <p className="text-sm text-slate-500">
                Roll: {selectedStudent.roll || 'N/A'} •{' '}
                {batches.find((b: any) => b.id === selectedStudent.batch)?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Classes', value: stats.total,   color: 'text-slate-700',  bg: 'bg-slate-50 border-slate-200' },
              { label: 'Present',       value: stats.present, color: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
              { label: 'Absent',        value: stats.absent,  color: 'text-red-600',    bg: 'bg-red-50 border-red-200' },
              { label: 'Leave',         value: stats.leave,   color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} border rounded-xl p-4 text-center`}>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* % Bar */}
        {stats && (
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-700">Overall Attendance</span>
              <span className={`text-lg font-bold ${stats.pct >= 75 ? 'text-green-600' : stats.pct >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                {stats.pct}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-700 ${stats.pct >= 75 ? 'bg-green-500' : stats.pct >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                style={{ width: `${stats.pct}%` }}
              />
            </div>
            {stats.pct < 75 && (
              <p className="text-xs text-red-500 mt-2 font-medium">⚠ Below 75% attendance threshold</p>
            )}
          </div>
        )}

        {/* Calendar */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-full"><ChevronLeft size={18} /></button>
            <h3 className="text-base font-bold text-slate-800">{monthLabel(calYear, calMonth)}</h3>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-full"><ChevronRight size={18} /></button>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell, i) => {
              if (cell.day === 0) return <div key={`pad-${i}`} />;
              const isToday_ = cell.date === todayStr();
              const bg =
                cell.status === 'present' ? 'bg-green-500 text-white border-green-500' :
                cell.status === 'absent'  ? 'bg-red-400   text-white border-red-400' :
                cell.status === 'leave'   ? 'bg-yellow-400 text-white border-yellow-400' :
                                            'bg-slate-50 text-slate-400 border-slate-200';
              return (
                <div
                  key={cell.date}
                  className={`aspect-square rounded-lg border flex flex-col items-center justify-center text-xs font-semibold ${bg} ${isToday_ ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}`}
                  title={cell.status ? `${cell.date}: ${cell.status}` : cell.date}
                >
                  <span>{cell.day}</span>
                  {cell.status && (
                    <span className="text-[9px] leading-none opacity-80">
                      {cell.status === 'present' ? 'P' : cell.status === 'absent' ? 'A' : 'L'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            {[
              { color: 'bg-green-500',  label: 'Present' },
              { color: 'bg-red-400',    label: 'Absent' },
              { color: 'bg-yellow-400', label: 'Leave' },
              { color: 'bg-slate-200',  label: 'No Class' },
            ].map(l => (
              <span key={l.label} className="flex items-center gap-1">
                <span className={`w-3 h-3 rounded ${l.color} inline-block`} /> {l.label}
              </span>
            ))}
          </div>
        </div>

        {/* Monthly summary table */}
        {stats && Object.keys(stats.months).length > 0 && (
          <div className="bg-white rounded-xl p-4 md:p-6 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BarChart3 size={18} /> Monthly Summary
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left   text-xs font-semibold text-slate-500 uppercase">Month</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-green-600 uppercase">Present</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-red-500   uppercase">Absent</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-yellow-600 uppercase">Leave</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-slate-500 uppercase">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {Object.entries(stats.months)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .map(([month, m]) => (
                      <tr key={month} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-3 font-medium text-slate-700">
                          {new Date(month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-green-600">{m.present}</td>
                        <td className="px-3 py-3 text-center font-bold text-red-500">{m.absent}</td>
                        <td className="px-3 py-3 text-center font-bold text-yellow-600">{m.leave}</td>
                        <td className="px-3 py-3 text-center">
                          <span className={`font-bold ${m.pct >= 75 ? 'text-green-600' : m.pct >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                            {m.pct}%
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Student selection list ──
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Student Attendance</h2>
          <p className="text-sm text-gray-500">Select a student to view calendar & report</p>
        </div>
        <select
          value={batchFilter}
          onChange={e => setBatchFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
        >
          <option value="all">All Batches</option>
          {batches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredStudents.map((student: any) => {
          const entries = attendance.flatMap((rec: any) =>
            rec.records.filter((r: AttendanceRecordItem) => r.student === student.id)
          );
          const total   = entries.length;
          const present = entries.filter((r: AttendanceRecordItem) => r.status === 'present').length;
          const pct     = total > 0 ? Math.round((present / total) * 100) : null;

          return (
            <button
              key={student.id}
              onClick={() => setSelectedStudentId(student.id)}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {student.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate text-sm">{student.name}</p>
                  <p className="text-xs text-slate-500">Roll: {student.roll || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{total} classes</span>
                {pct !== null ? (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pct >= 75 ? 'bg-green-100 text-green-700' : pct >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>
                    {pct}%
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">No data</span>
                )}
              </div>
              {pct !== null && (
                <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}

        {filteredStudents.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
            <User className="mx-auto h-10 w-10 text-slate-300 mb-2" />
            <p className="text-slate-500 font-medium">No students found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 4 — Class Report
// ─────────────────────────────────────────────────────────────────────────────

function ClassReport({ data }: { data: DashboardData }) {
  const { students, batches, attendance } = data;
  const [selectedBatch, setSelectedBatch] = useState<string>(batches[0]?.id || '');
  const [rangeStart, setRangeStart]       = useState('');
  const [rangeEnd,   setRangeEnd]         = useState(todayStr());

  const batchStudents = students.filter((s: any) => s.batch === selectedBatch);

  const reportData = useMemo(() => {
    const batchAtt = attendance.filter((r: any) => {
      if (r.batch !== selectedBatch) return false;
      if (rangeStart && r.date < rangeStart) return false;
      if (rangeEnd   && r.date > rangeEnd)   return false;
      return true;
    });
    const totalClasses = batchAtt.length;
    if (totalClasses === 0) return null;

    const studentStats = batchStudents
      .map((student: any) => {
        let present = 0, absent = 0, leave = 0;
        batchAtt.forEach((rec: any) => {
          const entry = rec.records.find((r: AttendanceRecordItem) => r.student === student.id);
          if      (entry?.status === 'present') present++;
          else if (entry?.status === 'absent')  absent++;
          else if (entry?.status === 'leave')   leave++;
        });
        const pct = totalClasses > 0 ? Math.round((present / totalClasses) * 100) : 0;
        return { ...student, present, absent, leave, pct };
      })
      .sort((a: any, b: any) => b.pct - a.pct);

    const avgPct = studentStats.length > 0
      ? Math.round(studentStats.reduce((s: number, x: any) => s + x.pct, 0) / studentStats.length)
      : 0;
    const belowThreshold = studentStats.filter((s: any) => s.pct < 75);

    return { totalClasses, studentStats, avgPct, belowThreshold };
  }, [attendance, selectedBatch, batchStudents, rangeStart, rangeEnd]);

  const exportCSV = () => {
    if (!reportData) return;
    const headers = ['Name', 'Roll', 'Present', 'Absent', 'Leave', 'Attendance %'];
    const rows = reportData.studentStats.map((s: any) => [
      s.name, s.roll || '', s.present, s.absent, s.leave, `${s.pct}%`,
    ]);
    const csv  = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `report_${batches.find((b: any) => b.id === selectedBatch)?.name || 'batch'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Attendance Report</h2>
          <p className="text-sm text-gray-500">Class-wise & student-wise report with date range</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Batch</label>
          <select
            value={selectedBatch}
            onChange={e => setSelectedBatch(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
          >
            {batches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">From</label>
          <input
            type="date"
            value={rangeStart}
            max={rangeEnd}
            onChange={e => setRangeStart(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">To</label>
          <input
            type="date"
            value={rangeEnd}
            max={todayStr()}
            onChange={e => setRangeEnd(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
          />
        </div>
      </div>

      {!reportData ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
          <BarChart3 className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No attendance data for selected range.</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm text-center">
              <div className="text-2xl font-bold text-slate-800">{reportData.totalClasses}</div>
              <div className="text-xs text-slate-500 mt-1">Total Classes</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
              <div className="text-2xl font-bold text-green-600">{reportData.avgPct}%</div>
              <div className="text-xs text-green-700 mt-1">Avg Attendance</div>
            </div>
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200 text-center">
              <div className="text-2xl font-bold text-indigo-600">{reportData.studentStats.filter((s: any) => s.pct >= 75).length}</div>
              <div className="text-xs text-indigo-700 mt-1">Above 75%</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 border border-red-200 text-center">
              <div className="text-2xl font-bold text-red-500">{reportData.belowThreshold.length}</div>
              <div className="text-xs text-red-600 mt-1">Below 75%</div>
            </div>
          </div>

          {/* Defaulters alert */}
          {reportData.belowThreshold.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h3 className="font-bold text-red-700 mb-2 text-sm">⚠ Students Below 75% Attendance</h3>
              <div className="flex flex-wrap gap-2">
                {reportData.belowThreshold.map((s: any) => (
                  <span key={s.id} className="inline-flex items-center gap-1 bg-white border border-red-200 rounded-full px-3 py-1 text-xs font-medium text-red-600">
                    {s.name} — {s.pct}%
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Student table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Student</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-green-600 uppercase">Present</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-red-500   uppercase">Absent</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-yellow-600 uppercase">Leave</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {reportData.studentStats.map((s: any) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{s.name}</div>
                        <div className="text-xs text-slate-400">Roll: {s.roll || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-green-600">{s.present}</td>
                      <td className="px-4 py-3 text-center font-bold text-red-500">{s.absent}</td>
                      <td className="px-4 py-3 text-center font-bold text-yellow-600">{s.leave}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden min-w-[60px]">
                            <div
                              className={`h-2 rounded-full ${s.pct >= 75 ? 'bg-green-500' : s.pct >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                              style={{ width: `${s.pct}%` }}
                            />
                          </div>
                          <span className={`text-xs font-bold w-10 text-right ${s.pct >= 75 ? 'text-green-600' : s.pct >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                            {s.pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export — tab shell
// ─────────────────────────────────────────────────────────────────────────────

const TABS: { key: AttendanceView; label: string; icon: React.ReactNode }[] = [
  { key: 'mark',             label: 'Mark',         icon: <CheckSquare size={16} /> },
  { key: 'class_history',    label: 'History',      icon: <CalendarDays size={16} /> },
  { key: 'student_calendar', label: 'Per Student',  icon: <User size={16} /> },
  { key: 'report',           label: 'Report',       icon: <BarChart3 size={16} /> },
];

const AttendancePage = ({ data }: AttendancePageProps) => {
  const [view, setView] = useState<AttendanceView>('mark');

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto scrollbar-hide">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-1 justify-center ${
              view === tab.key
                ? 'bg-white shadow text-indigo-600 font-semibold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {view === 'mark'             && <MarkAttendance  data={data} />}
      {view === 'class_history'    && <ClassHistory    data={data} />}
      {view === 'student_calendar' && <StudentCalendar data={data} />}
      {view === 'report'           && <ClassReport     data={data} />}
    </div>
  );
};

export default AttendancePage;