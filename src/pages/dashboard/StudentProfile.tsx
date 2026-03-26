// pages/students/StudentProfile.tsx
// Complete student profile with all data — attendance, fees, tests, reports

import { useState, useMemo, useRef, type ChangeEvent } from 'react';
import {
  ArrowLeft, Phone, Users, IndianRupee,
  CalendarDays, FileText, Edit2, Save, X, Loader2,
  CheckCircle,
  Share2, ChevronLeft, ChevronRight, Upload, Camera,
  AlertCircle, Award, BookOpen, Trash2,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService, feeService } from '../../services/api';
import type { DashboardData } from '../../hooks/useDashboardData';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface StudentProfileProps {
  studentId: string;
  data: DashboardData;
  onBack: () => void;
}

type ProfileTab = 'overview' | 'attendance' | 'fees' | 'tests' | 'reports';

type AttendanceStatus = 'present' | 'absent' | 'leave';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const todayStr = () => new Date().toISOString().split('T')[0];

const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const fmtCurrency = (n: number | string) =>
  `₹${Number(n).toLocaleString('en-IN')}`;

const monthLabel = (y: number, m: number) =>
  new Date(y, m).toLocaleString('default', { month: 'long', year: 'numeric' });

const daysInMonth  = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
const firstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

const pctColor = (p: number) =>
  p >= 75 ? 'text-green-600' : p >= 50 ? 'text-yellow-600' : 'text-red-500';

const pctBg = (p: number) =>
  p >= 75 ? 'bg-green-500' : p >= 50 ? 'bg-yellow-400' : 'bg-red-400';

// ─────────────────────────────────────────────────────────────────────────────
// Small shared components
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, color, bg,
}: {
  label: string; value: string | number; sub?: string;
  icon: any; color: string; bg: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center mb-3`}>
        <Icon size={20} />
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-sm font-medium text-slate-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  );
}

function SectionHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Overview
// ─────────────────────────────────────────────────────────────────────────────

function OverviewTab({ student, data, onEditField }: {
  student: any; data: DashboardData; onEditField: (field: string, val: string) => void;
}) {
  const { attendance, fees, tests } = data;

  // Attendance summary
  const attRecords = attendance.flatMap((r: any) =>
    r.records.filter((rec: any) => rec.student === student.id)
  );
  const attTotal   = attRecords.length;
  const attPresent = attRecords.filter((r: any) => r.status === 'present').length;
  const attPct     = attTotal > 0 ? Math.round((attPresent / attTotal) * 100) : 0;

  // Fee summary
  const total = Number(student.total_fees);
  const paid  = Number(student.fees_paid);
  const due   = total - paid;
  const feePct = total > 0 ? Math.round((paid / total) * 100) : 0;

  // Test summary
  const studentMarks = tests.flatMap((t: any) =>
    (t.marks || []).filter((m: any) => m.student === student.id).map((m: any) => ({
      ...m, test_name: t.name, total_marks: t.total_marks, date: t.date,
    }))
  );
  const avgPct = studentMarks.length > 0
    ? Math.round(studentMarks.reduce((s: number, m: any) => s + (Number(m.marks_obtained) / m.total_marks) * 100, 0) / studentMarks.length)
    : null;

  // WhatsApp
  const handleWhatsApp = () => {
    const text = `📚 *Student Report*\n\nName: *${student.name}*\nRoll: ${student.roll || 'N/A'}\n\n📅 Attendance: *${attPct}%* (${attPresent}/${attTotal} days)\n💰 Fee Due: *${fmtCurrency(due)}*\n🎯 Avg Score: *${avgPct !== null ? avgPct + '%' : 'N/A'}*`;
    window.open(`https://wa.me/${String(student.phone).replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const batch = data.batches.find((b: any) => b.id === student.batch);

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 0%, transparent 60%)' }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="text-indigo-200 text-sm font-medium mb-1">
              {batch?.name || 'No Batch'} · Roll {student.roll || 'N/A'}
            </div>
            <h2 className="text-2xl font-bold truncate">{student.name}</h2>
            <div className="flex items-center gap-2 mt-2 text-indigo-200 text-sm">
              <Phone size={14} />
              <span>{String(student.phone)}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-lg"
            >
              <Share2 size={16} /> WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* 4 KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Attendance" value={`${attPct}%`} sub={`${attPresent}/${attTotal} classes`}
          icon={CalendarDays} color="text-blue-600" bg="bg-blue-50"
        />
        <StatCard
          label="Fees Paid" value={fmtCurrency(paid)} sub={`${feePct}% of total`}
          icon={IndianRupee} color="text-emerald-600" bg="bg-emerald-50"
        />
        <StatCard
          label="Fees Due" value={fmtCurrency(due)} sub={due === 0 ? 'Fully paid ✓' : 'Pending'}
          icon={AlertCircle} color={due > 0 ? 'text-red-500' : 'text-green-600'} bg={due > 0 ? 'bg-red-50' : 'bg-green-50'}
        />
        <StatCard
          label="Avg Score" value={avgPct !== null ? `${avgPct}%` : 'N/A'} sub={`${studentMarks.length} tests`}
          icon={Award} color="text-purple-600" bg="bg-purple-50"
        />
      </div>

      {/* Quick info + recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <SectionHeader title="Student Information" />
          <div className="space-y-3">
            {[
              { label: 'Full Name',       value: student.name,         field: 'name' },
              { label: 'Phone',           value: String(student.phone), field: 'phone' },
              { label: 'Roll Number',     value: student.roll || '—',  field: 'roll' },
              { label: 'Batch',           value: batch?.name || '—',   field: null },
              { label: 'Batch Timing',    value: batch?.timing || '—', field: null },
              { label: 'Joined',          value: fmtDate(student.created_at), field: null },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-500">{row.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800">{row.value}</span>
                  {row.field && (
                    <button
                      onClick={() => onEditField(row.field!, row.value === '—' ? '' : row.value)}
                      className="text-slate-300 hover:text-indigo-500 transition-colors"
                    >
                      <Edit2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent fee transactions */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <SectionHeader title="Recent Transactions">
            <span className="text-xs text-slate-400">{fees.filter((f: any) => f.student === student.id).length} total</span>
          </SectionHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {fees
              .filter((f: any) => f.student === student.id)
              .slice(0, 8)
              .map((fee: any) => {
                const isDeduction = Number(fee.amount) < 0;
                return (
                  <div key={fee.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{fee.notes || 'Payment'}</p>
                      <p className="text-xs text-slate-400">{fmtDate(fee.payment_date)}</p>
                    </div>
                    <span className={`text-sm font-bold ${isDeduction ? 'text-amber-600' : 'text-green-600'}`}>
                      {isDeduction ? `-${fmtCurrency(Math.abs(Number(fee.amount)))}` : `+${fmtCurrency(Number(fee.amount))}`}
                    </span>
                  </div>
                );
              })}
            {fees.filter((f: any) => f.student === student.id).length === 0 && (
              <p className="text-center text-slate-400 text-sm py-8">No transactions yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Performance bar */}
      {studentMarks.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <SectionHeader title="Test Performance — Recent 5" />
          <div className="space-y-3">
            {studentMarks.slice(-5).reverse().map((m: any, i: number) => {
              const pct = Math.round((Number(m.marks_obtained) / m.total_marks) * 100);
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-32 text-xs text-slate-600 truncate">{m.test_name}</div>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className={`h-2 rounded-full ${pctBg(pct)}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className={`text-xs font-bold w-10 text-right ${pctColor(pct)}`}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Attendance (full calendar view)
// ─────────────────────────────────────────────────────────────────────────────

function AttendanceTab({ student, data }: { student: any; data: DashboardData }) {
  const [calYear,  setCalYear]  = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());

  // Build date → status map
  const attMap = useMemo<Record<string, AttendanceStatus>>(() => {
    const map: Record<string, AttendanceStatus> = {};
    data.attendance.forEach((rec: any) => {
      rec.records.forEach((r: any) => {
        if (r.student === student.id) map[rec.date] = r.status;
      });
    });
    return map;
  }, [student.id, data.attendance]);

  // Stats
  const entries  = Object.values(attMap);
  const total    = entries.length;
  const present  = entries.filter(s => s === 'present').length;
  const absent   = entries.filter(s => s === 'absent').length;
  const leave    = entries.filter(s => s === 'leave').length;
  const pct      = total > 0 ? Math.round((present / total) * 100) : 0;

  // Monthly stats
  const monthlyStats = useMemo(() => {
    const map: Record<string, { present: number; absent: number; leave: number; total: number; pct: number }> = {};
    Object.entries(attMap).forEach(([date, status]) => {
      const key = date.slice(0, 7);
      if (!map[key]) map[key] = { present: 0, absent: 0, leave: 0, total: 0, pct: 0 };
      map[key].total++;
      map[key][status]++;
    });
    Object.values(map).forEach(m => { m.pct = m.total > 0 ? Math.round((m.present / m.total) * 100) : 0; });
    return map;
  }, [attMap]);

  // Calendar grid
  const calCells = useMemo(() => {
    const cells: { day: number; date: string; status?: AttendanceStatus }[] = [];
    const first = firstDayOfMonth(calYear, calMonth);
    const days  = daysInMonth(calYear, calMonth);
    for (let i = 0; i < first; i++) cells.push({ day: 0, date: '' });
    for (let d = 1; d <= days; d++) {
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, date: dateStr, status: attMap[dateStr] });
    }
    return cells;
  }, [calYear, calMonth, attMap]);

  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Classes', value: total,   color: 'text-slate-700',  bg: 'bg-slate-50 border-slate-200' },
          { label: 'Present',       value: present, color: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
          { label: 'Absent',        value: absent,  color: 'text-red-600',    bg: 'bg-red-50 border-red-200' },
          { label: 'Leave',         value: leave,   color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-2xl p-4 text-center`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Overall % */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-slate-700">Overall Attendance</span>
          <span className={`text-xl font-bold ${pctColor(pct)}`}>{pct}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div className={`h-3 rounded-full transition-all duration-700 ${pctBg(pct)}`} style={{ width: `${pct}%` }} />
        </div>
        {pct < 75 && (
          <p className="text-xs text-red-500 mt-2 font-medium flex items-center gap-1">
            <AlertCircle size={12} /> Below 75% threshold — needs attention
          </p>
        )}
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ChevronLeft size={18} /></button>
          <h3 className="text-base font-bold text-slate-800">{monthLabel(calYear, calMonth)}</h3>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ChevronRight size={18} /></button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-xs font-bold text-slate-400 py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calCells.map((cell, i) => {
            if (!cell.day) return <div key={`p-${i}`} />;
            const isToday = cell.date === todayStr();
            const bg =
              cell.status === 'present' ? 'bg-green-500 text-white' :
              cell.status === 'absent'  ? 'bg-red-400 text-white' :
              cell.status === 'leave'   ? 'bg-yellow-400 text-white' :
              'bg-slate-50 text-slate-400';
            return (
              <div
                key={cell.date}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-semibold ${bg} ${isToday ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}`}
                title={cell.status ? `${cell.date}: ${cell.status}` : cell.date}
              >
                <span>{cell.day}</span>
                {cell.status && <span className="text-[8px] leading-none opacity-90">{cell.status === 'present' ? 'P' : cell.status === 'absent' ? 'A' : 'L'}</span>}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
          {[['bg-green-500', 'Present'], ['bg-red-400', 'Absent'], ['bg-yellow-400', 'Leave'], ['bg-slate-200', 'No Class']].map(([c, l]) => (
            <span key={l} className="flex items-center gap-1.5"><span className={`w-3 h-3 rounded-md ${c} inline-block`} />{l}</span>
          ))}
        </div>
      </div>

      {/* Monthly table */}
      {Object.keys(monthlyStats).length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <SectionHeader title="Month-by-Month Breakdown" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Month</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-green-600 uppercase">P</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-red-500 uppercase">A</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-yellow-600 uppercase">L</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-slate-500 uppercase">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {Object.entries(monthlyStats).sort(([a], [b]) => b.localeCompare(a)).map(([month, m]) => (
                  <tr key={month} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-3 font-medium text-slate-700">
                      {new Date(month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-3 py-2 text-center font-bold text-green-600">{m.present}</td>
                    <td className="px-3 py-2 text-center font-bold text-red-500">{m.absent}</td>
                    <td className="px-3 py-2 text-center font-bold text-yellow-600">{m.leave}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`font-bold ${pctColor(m.pct)}`}>{m.pct}%</span>
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

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Fees
// ─────────────────────────────────────────────────────────────────────────────

function FeesTab({ student, data, queryClient }: { student: any; data: DashboardData; queryClient: any }) {
  const [amount,     setAmount]     = useState('');
  const [notes,      setNotes]      = useState('');
  const [isMonthly,  setIsMonthly]  = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const total = Number(student.total_fees);
  const paid  = Number(student.fees_paid);
  const due   = total - paid;
  const feePct = total > 0 ? Math.round((paid / total) * 100) : 0;

  const studentFees = data.fees
    .filter((f: any) => f.student === student.id)
    .sort((a: any, b: any) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());

  const addPaymentMutation = useMutation({
    mutationFn: feeService.create,
    onSuccess: () => {
      toast.success('Payment recorded');
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setAmount(''); setNotes(''); setScreenshot(null);
    },
    onError: () => toast.error('Failed to record payment'),
  });

  const deletePaymentMutation = useMutation({
    mutationFn: feeService.delete,
    onSuccess: () => {
      toast.success('Transaction deleted');
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: () => toast.error('Failed to delete'),
  });

  const handlePayment = () => {
    if (!amount) return;
    const fd = new FormData();
    fd.append('student', student.id);
    fd.append('amount', isMonthly ? `-${amount}` : amount);
    fd.append('payment_date', new Date().toISOString());
    fd.append('notes', notes);
    if (screenshot) fd.append('screenshot', screenshot);
    addPaymentMutation.mutate(fd);
  };

  return (
    <div className="space-y-6">
      {/* Fee summary */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <SectionHeader title="Fee Summary" />
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-slate-50 rounded-xl">
            <div className="text-xl font-bold text-slate-800">{fmtCurrency(total)}</div>
            <div className="text-xs text-slate-500 mt-1">Total Fee</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <div className="text-xl font-bold text-green-600">{fmtCurrency(paid)}</div>
            <div className="text-xs text-slate-500 mt-1">Paid</div>
          </div>
          <div className={`text-center p-3 rounded-xl ${due > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
            <div className={`text-xl font-bold ${due > 0 ? 'text-red-500' : 'text-green-600'}`}>{fmtCurrency(due)}</div>
            <div className="text-xs text-slate-500 mt-1">{due > 0 ? 'Due' : 'Fully Paid ✓'}</div>
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div className="h-3 rounded-full bg-indigo-500 transition-all duration-700" style={{ width: `${feePct}%` }} />
        </div>
        <div className="text-xs text-slate-400 mt-1 text-right">{feePct}% collected</div>
      </div>

      {/* Add payment */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <SectionHeader title="Record Transaction" />

        {/* Toggle */}
        <div className="flex gap-2 mb-4">
          {[false, true].map(monthly => (
            <button
              key={String(monthly)}
              onClick={() => setIsMonthly(monthly)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${isMonthly === monthly ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {monthly ? '+ Add Monthly Fee' : '+ Record Payment'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {/* Quick amounts */}
          <div className="flex gap-2 flex-wrap">
            {[500, 1000, 2000, 5000].map(amt => (
              <button key={amt} onClick={() => setAmount(String(amt))}
                className="text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 px-3 py-1.5 rounded-lg transition-colors font-medium border border-slate-200">
                ₹{amt}
              </button>
            ))}
            {due > 0 && !isMonthly && (
              <button onClick={() => setAmount(String(due))}
                className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-medium border border-indigo-200">
                Full Due
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="₹ Amount"
              className="flex-1 px-4 py-3 text-lg font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <div
              onClick={() => fileRef.current?.click()}
              className={`w-14 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-all ${screenshot ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-slate-400'}`}
            >
              {screenshot ? <CheckCircle size={20} className="text-green-600" /> : <Camera size={20} className="text-slate-400" />}
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && setScreenshot(e.target.files[0])} />
            </div>
          </div>

          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={isMonthly ? 'Month / Description (e.g. October Fee)' : 'Note (e.g. UPI ref, cash)'}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          />

          <button
            onClick={handlePayment}
            disabled={!amount || addPaymentMutation.isPending}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
          >
            {addPaymentMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : null}
            {isMonthly ? `Add ₹${amount || '0'} Fee` : `Confirm ₹${amount || '0'} Payment`}
          </button>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <SectionHeader title="Transaction History">
          <span className="text-xs text-slate-400">{studentFees.length} records</span>
        </SectionHeader>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {studentFees.map((fee: any) => {
            const isDeduction = Number(fee.amount) < 0;
            return (
              <div key={fee.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-sm font-semibold text-slate-800 truncate">{fee.notes || 'Payment'}</p>
                  <p className="text-xs text-slate-400">{fmtDate(fee.payment_date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold whitespace-nowrap ${isDeduction ? 'text-amber-600' : 'text-green-600'}`}>
                    {isDeduction ? `Fee: ₹${Math.abs(Number(fee.amount)).toLocaleString()}` : `+₹${Number(fee.amount).toLocaleString()}`}
                  </span>
                  <button
                    onClick={() => { if (confirm('Delete this transaction?')) deletePaymentMutation.mutate(fee.id); }}
                    className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
          {studentFees.length === 0 && <p className="text-center text-slate-400 text-sm py-8">No transactions yet</p>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Tests
// ─────────────────────────────────────────────────────────────────────────────

function TestsTab({ student, data }: { student: any; data: DashboardData }) {
  const studentMarks = useMemo(() => {
    return data.tests
      .flatMap((t: any) =>
        (t.marks || [])
          .filter((m: any) => m.student === student.id)
          .map((m: any) => ({
            id:           t.id,
            test_name:    t.name,
            date:         t.date,
            board:        t.board,
            batch_name:   data.batches.find((b: any) => b.id === t.batch)?.name || '',
            total_marks:  t.total_marks,
            obtained:     Number(m.marks_obtained),
            pct:          t.total_marks > 0 ? Math.round((Number(m.marks_obtained) / t.total_marks) * 100) : 0,
          }))
      )
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [student.id, data.tests, data.batches]);

  const avgPct    = studentMarks.length > 0 ? Math.round(studentMarks.reduce((s: number, m: any) => s + m.pct, 0) / studentMarks.length) : 0;
  const highest   = studentMarks.length > 0 ? Math.max(...studentMarks.map((m: any) => m.pct)) : 0;
  // const lowest    = studentMarks.length > 0 ? Math.min(...studentMarks.map((m: any) => m.pct)) : 0;
  const passCount = studentMarks.filter((m: any) => m.pct >= 33).length;

  const gradeLabel = (p: number) => p >= 90 ? 'A+' : p >= 80 ? 'A' : p >= 70 ? 'B' : p >= 60 ? 'C' : p >= 50 ? 'D' : p >= 33 ? 'E' : 'F';
  const gradeColor = (p: number) => p >= 70 ? 'text-green-600 bg-green-50' : p >= 50 ? 'text-yellow-700 bg-yellow-50' : p >= 33 ? 'text-orange-600 bg-orange-50' : 'text-red-600 bg-red-50';

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tests Taken',  value: studentMarks.length, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
          { label: 'Average',      value: `${avgPct}%`,        color: pctColor(avgPct),  bg: 'bg-slate-50 border-slate-100' },
          { label: 'Highest',      value: `${highest}%`,       color: 'text-green-600',  bg: 'bg-green-50 border-green-100' },
          { label: 'Pass Rate',    value: `${studentMarks.length > 0 ? Math.round((passCount / studentMarks.length) * 100) : 0}%`, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-2xl p-4 text-center`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tests list */}
      {studentMarks.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
          <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No test results yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {studentMarks.map((m: any) => (
            <div key={`${m.id}-${m.test_name}`} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
              {/* Grade badge */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0 ${gradeColor(m.pct)}`}>
                {gradeLabel(m.pct)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800 truncate">{m.test_name}</div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                  <span>{fmtDate(m.date)}</span>
                  <span>·</span>
                  <span>{m.board}</span>
                  <span>·</span>
                  <span>{m.batch_name}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden max-w-xs">
                    <div className={`h-1.5 rounded-full ${pctBg(m.pct)}`} style={{ width: `${m.pct}%` }} />
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-lg font-bold ${pctColor(m.pct)}`}>{m.pct}%</div>
                <div className="text-xs text-slate-400">{m.obtained}/{m.total_marks}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trend if enough data */}
      {studentMarks.length >= 3 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <SectionHeader title="Score Trend" />
          <div className="flex items-end gap-2 h-28">
            {[...studentMarks].reverse().slice(-10).map((m: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs bg-slate-800 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {m.pct}%
                </span>
                <div
                  className={`w-full rounded-t-lg transition-all ${pctBg(m.pct)}`}
                  style={{ height: `${m.pct}%` }}
                />
                <span className="text-[9px] text-slate-400 text-center truncate w-full">{m.test_name.slice(0, 4)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Full Report
// ─────────────────────────────────────────────────────────────────────────────

function ReportTab({ student, data }: { student: any; data: DashboardData }) {
  // Attendance
  const attRecords = data.attendance.flatMap((r: any) =>
    r.records.filter((rec: any) => rec.student === student.id)
  );
  const attTotal   = attRecords.length;
  const attPresent = attRecords.filter((r: any) => r.status === 'present').length;
  const attAbsent  = attRecords.filter((r: any) => r.status === 'absent').length;
  const attLeave   = attRecords.filter((r: any) => r.status === 'leave').length;
  const attPct     = attTotal > 0 ? Math.round((attPresent / attTotal) * 100) : 0;

  // Fees
  const total = Number(student.total_fees);
  const paid  = Number(student.fees_paid);
  const due   = total - paid;
  const feePct = total > 0 ? Math.round((paid / total) * 100) : 0;

  // Tests
  const studentMarks = data.tests.flatMap((t: any) =>
    (t.marks || [])
      .filter((m: any) => m.student === student.id)
      .map((m: any) => ({ pct: t.total_marks > 0 ? Math.round((Number(m.marks_obtained) / t.total_marks) * 100) : 0 }))
  );
  const avgTestPct = studentMarks.length > 0
    ? Math.round(studentMarks.reduce((s: number, m: any) => s + m.pct, 0) / studentMarks.length)
    : null;

  const batch = data.batches.find((b: any) => b.id === student.batch);

  const printReport = () => window.print();

  return (
    <div className="space-y-6">
      {/* Print button */}
      <div className="flex justify-end print:hidden">
        <button
          onClick={printReport}
          className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors"
        >
          <FileText size={16} /> Print / Export PDF
        </button>
      </div>

      {/* Report card — printable */}
      <div id="student-report-print" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="border-b-2 border-slate-800 pb-4 mb-2">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wide">Student Report Card</h2>
              <p className="text-slate-500 text-sm mt-1">Generated on {fmtDate(todayStr())}</p>
            </div>
            <div className="text-right text-sm text-slate-500">
              <p>Batch: <strong>{batch?.name || '—'}</strong></p>
              <p>Timing: <strong>{batch?.timing || '—'}</strong></p>
            </div>
          </div>
        </div>

        {/* Student info */}
        <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {[
            ['Name',       student.name],
            ['Roll No',    student.roll || '—'],
            ['Phone',      String(student.phone)],
            ['Batch',      batch?.name || '—'],
            ['Joined',     fmtDate(student.created_at)],
            ['Status',     attPct >= 75 && feePct >= 50 ? '✓ Good Standing' : '⚠ Needs Attention'],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-slate-400 text-xs uppercase font-semibold">{k}</p>
              <p className="font-bold text-slate-800 mt-0.5">{v}</p>
            </div>
          ))}
        </div>

        {/* Metrics table */}
        <table className="w-full border-collapse text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-2.5 text-left font-semibold text-slate-700 border border-slate-200">Category</th>
              <th className="px-4 py-2.5 text-center font-semibold text-slate-700 border border-slate-200">Details</th>
              <th className="px-4 py-2.5 text-center font-semibold text-slate-700 border border-slate-200">Score / Status</th>
              <th className="px-4 py-2.5 text-center font-semibold text-slate-700 border border-slate-200">Grade</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-3 border border-slate-100 font-medium">Attendance</td>
              <td className="px-4 py-3 border border-slate-100 text-center text-slate-600">
                {attPresent}P / {attAbsent}A / {attLeave}L (of {attTotal})
              </td>
              <td className="px-4 py-3 border border-slate-100 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-24 bg-slate-200 rounded-full h-2"><div className={`h-2 rounded-full ${pctBg(attPct)}`} style={{ width: `${attPct}%` }} /></div>
                  <span className={`font-bold ${pctColor(attPct)}`}>{attPct}%</span>
                </div>
              </td>
              <td className={`px-4 py-3 border border-slate-100 text-center font-bold ${attPct >= 75 ? 'text-green-600' : 'text-red-500'}`}>
                {attPct >= 90 ? 'A+' : attPct >= 75 ? 'A' : attPct >= 60 ? 'B' : attPct >= 50 ? 'C' : 'F'}
              </td>
            </tr>
            <tr className="bg-slate-50/50">
              <td className="px-4 py-3 border border-slate-100 font-medium">Fee Collection</td>
              <td className="px-4 py-3 border border-slate-100 text-center text-slate-600">
                {fmtCurrency(paid)} paid of {fmtCurrency(total)}
              </td>
              <td className="px-4 py-3 border border-slate-100 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-24 bg-slate-200 rounded-full h-2"><div className="h-2 rounded-full bg-indigo-500" style={{ width: `${feePct}%` }} /></div>
                  <span className="font-bold text-indigo-600">{feePct}%</span>
                </div>
              </td>
              <td className="px-4 py-3 border border-slate-100 text-center font-bold text-indigo-600">
                {due <= 0 ? '✓ Clear' : `Due: ${fmtCurrency(due)}`}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 border border-slate-100 font-medium">Academic Performance</td>
              <td className="px-4 py-3 border border-slate-100 text-center text-slate-600">
                {studentMarks.length} test{studentMarks.length !== 1 ? 's' : ''} taken
              </td>
              <td className="px-4 py-3 border border-slate-100 text-center">
                {avgTestPct !== null ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-24 bg-slate-200 rounded-full h-2"><div className={`h-2 rounded-full ${pctBg(avgTestPct)}`} style={{ width: `${avgTestPct}%` }} /></div>
                    <span className={`font-bold ${pctColor(avgTestPct)}`}>{avgTestPct}%</span>
                  </div>
                ) : <span className="text-slate-400">N/A</span>}
              </td>
              <td className={`px-4 py-3 border border-slate-100 text-center font-bold ${avgTestPct && avgTestPct >= 60 ? 'text-green-600' : avgTestPct ? 'text-yellow-600' : 'text-slate-400'}`}>
                {avgTestPct !== null ? (avgTestPct >= 90 ? 'A+' : avgTestPct >= 80 ? 'A' : avgTestPct >= 70 ? 'B' : avgTestPct >= 60 ? 'C' : avgTestPct >= 50 ? 'D' : 'F') : '—'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Remarks */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-700 mb-1">Remarks</p>
          <p className="text-sm text-slate-600">
            {attPct >= 75 && (avgTestPct === null || avgTestPct >= 60) && due <= 0
              ? `${student.name} is performing well across all parameters. Keep up the excellent work!`
              : attPct < 75
              ? `${student.name}'s attendance (${attPct}%) needs improvement to meet the 75% requirement.`
              : due > 0
              ? `Fee due of ${fmtCurrency(due)} needs to be cleared at the earliest.`
              : `${student.name} has scope to improve academic performance.`}
          </p>
        </div>

        {/* Signature line */}
        <div className="flex justify-between items-end pt-6 border-t border-slate-200 text-sm text-slate-500">
          <div>
            <div className="w-32 border-b border-slate-400 mb-1" />
            <p>Student Signature</p>
          </div>
          <div className="text-right">
            <div className="w-32 border-b border-slate-400 mb-1 ml-auto" />
            <p>Teacher / Authority</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #student-report-print, #student-report-print * { visibility: visible; }
          #student-report-print { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Edit field modal
// ─────────────────────────────────────────────────────────────────────────────

function EditFieldModal({
  field, value, onSave, onClose, isPending,
}: {
  field: string; value: string; onSave: (v: string) => void;
  onClose: () => void; isPending: boolean;
}) {
  const [val, setVal] = useState(value);
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800 capitalize">Edit {field.replace('_', ' ')}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <input
          autoFocus
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSave(val)}
        />
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-medium">Cancel</button>
          <button
            onClick={() => onSave(val)}
            disabled={isPending}
            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={16} />} Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main StudentProfile
// ─────────────────────────────────────────────────────────────────────────────

const TABS: { key: ProfileTab; label: string; icon: any }[] = [
  { key: 'overview',    label: 'Overview',    icon: Users },
  { key: 'attendance',  label: 'Attendance',  icon: CalendarDays },
  { key: 'fees',        label: 'Fees',        icon: IndianRupee },
  { key: 'tests',       label: 'Tests',       icon: BookOpen },
  { key: 'reports',     label: 'Report',      icon: FileText },
];

export default function StudentProfile({ studentId, data, onBack }: StudentProfileProps) {
  const [tab, setTab] = useState<ProfileTab>('overview');
  const [editField, setEditField] = useState<{ field: string; value: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const student = data.students.find((s: any) => s.id === studentId);
  if (!student) return (
    <div className="text-center py-16 text-slate-400">
      <p>Student not found.</p>
      <button onClick={onBack} className="mt-4 text-indigo-600 underline text-sm">Go back</button>
    </div>
  );

  // Update field mutation
  const updateMutation = useMutation({
    mutationFn: (payload: any) => studentService.update(studentId, payload),
    onSuccess: () => {
      toast.success('Updated successfully');
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setEditField(null);
    },
    onError: () => toast.error('Update failed'),
  });

  // Profile pic mutation
  const picMutation = useMutation({
    mutationFn: (fd: FormData) => studentService.uploadProfilePic(studentId, fd),
    onSuccess: () => {
      toast.success('Photo updated');
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: () => toast.error('Photo upload failed'),
  });

  const handlePicChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('profile_pic', file);
    picMutation.mutate(fd);
  };

  const handleEditSave = (value: string) => {
    if (!editField) return;
    updateMutation.mutate({ [editField.field]: value });
  };

  const attRecords = data.attendance.flatMap((r: any) =>
    r.records.filter((rec: any) => rec.student === studentId)
  );
  const attPct = attRecords.length > 0
    ? Math.round(attRecords.filter((r: any) => r.status === 'present').length / attRecords.length * 100)
    : 0;

  const batch = data.batches.find((b: any) => b.id === student.batch);

  return (
    <div className="max-w-5xl mx-auto space-y-0 animate-in fade-in duration-300">
      {/* Edit modal */}
      {editField && (
        <EditFieldModal
          field={editField.field}
          value={editField.value}
          onSave={handleEditSave}
          onClose={() => setEditField(null)}
          isPending={updateMutation.isPending}
        />
      )}

      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 -mx-4 px-4 py-3 md:mx-0 md:px-0 shadow-sm mb-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200">
            <ArrowLeft size={18} />
          </button>

          {/* Avatar */}
          <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
            {student.profile_pic ? (
              <img
                src={student.profile_pic.startsWith('http') ? student.profile_pic : `https://capi.coachingapp.in${student.profile_pic}`}
                alt={student.name}
                className="w-11 h-11 rounded-xl object-cover border-2 border-indigo-200"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg border-2 border-indigo-200">
                {student.name.charAt(0)}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {picMutation.isPending ? <Loader2 className="animate-spin w-4 h-4 text-white" /> : <Upload className="w-4 h-4 text-white" />}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePicChange} />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-slate-900 leading-tight truncate">{student.name}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span>{batch?.name || 'No Batch'}</span>
              <span>·</span>
              <span>Roll: {student.roll || 'N/A'}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${attPct >= 75 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                {attPct}% att.
              </span>
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3 overflow-x-auto scrollbar-hide">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                tab === t.key ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="pt-4 pb-10">
        {tab === 'overview'   && <OverviewTab   student={student} data={data} onEditField={(f, v) => setEditField({ field: f, value: v })} />}
        {tab === 'attendance' && <AttendanceTab student={student} data={data} />}
        {tab === 'fees'       && <FeesTab       student={student} data={data} queryClient={queryClient} />}
        {tab === 'tests'      && <TestsTab      student={student} data={data} />}
        {tab === 'reports'    && <ReportTab     student={student} data={data} />}
      </div>
    </div>
  );
}
