// pages/students/StudentProfile.tsx  — Complete rewrite with full API data
import { useState, useEffect, useMemo, useRef, type ChangeEvent } from 'react';
import {
  ArrowLeft, Phone, IndianRupee, CalendarDays, FileText,
  Edit2, Save, X, Loader2, CheckCircle, Share2,
  ChevronLeft, ChevronRight, Upload, Camera, AlertCircle,
  Award, BookOpen, Trash2, RefreshCw, TrendingUp,
  GraduationCap, Star,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

const daysInMonth    = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
const firstDayOfWeek = (y: number, m: number) => new Date(y, m, 1).getDay();

const pctColor = (p: number) =>
  p >= 75 ? 'text-green-600' : p >= 50 ? 'text-yellow-600' : 'text-red-500';

const pctBg = (p: number) =>
  p >= 75 ? 'bg-green-500' : p >= 50 ? 'bg-yellow-400' : 'bg-red-400';

const gradeLabel = (p: number) =>
  p >= 90 ? 'A+' : p >= 80 ? 'A' : p >= 70 ? 'B' : p >= 60 ? 'C' : p >= 50 ? 'D' : p >= 33 ? 'E' : 'F';

const gradeColor = (p: number) =>
  p >= 70 ? 'text-green-600 bg-green-50 border-green-200' :
  p >= 50 ? 'text-yellow-700 bg-yellow-50 border-yellow-200' :
  p >= 33 ? 'text-orange-600 bg-orange-50 border-orange-200' :
            'text-red-600 bg-red-50 border-red-200';

const profilePicUrl = (url: string | null) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `https://capi.coachingapp.in${url}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Small shared components
// ─────────────────────────────────────────────────────────────────────────────

function StatPill({ label, value, color, bg }: { label: string; value: string | number; color: string; bg: string }) {
  return (
    <div className={`${bg} border ${color === 'text-green-600' ? 'border-green-200' : color === 'text-red-500' ? 'border-red-200' : color === 'text-yellow-600' ? 'border-yellow-200' : 'border-slate-200'} rounded-2xl p-4 text-center`}>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-1 font-medium">{label}</div>
    </div>
  );
}

function SectionCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function ProgressBar({ value, max, color = 'bg-indigo-500' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
      <div className={`h-2 rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      <p className="text-sm text-slate-500">Loading student data...</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Overview Tab — uses full profile API data
// ─────────────────────────────────────────────────────────────────────────────

function OverviewTab({ profile, student, data, onEditField }: {
  profile: any; student: any; data: DashboardData;
  onEditField: (field: string, val: string) => void;
}) {
  const summary   = profile?.summary   || {};
  const attTotals = profile?.attendance?.totals || {};
  const feeSummary = profile?.fees?.summary || {};
  const tests     = profile?.tests || [];

  const attPct  = attTotals.pct  ?? 0;
  const feePct  = feeSummary.fee_pct ?? 0;
  const avgTest = summary.avg_test_pct ?? null;
  const batch   = data.batches.find((b: any) => b.id === student.batch);

  const handleWhatsApp = () => {
    const text =
      `📚 *Student Report*\n\nName: *${student.name}*\nRoll: ${student.roll || 'N/A'}\n\n` +
      `📅 Attendance: *${attPct}%* (${attTotals.present}/${attTotals.total} days)\n` +
      `💰 Fee Due: *${fmtCurrency(feeSummary.fees_due || 0)}*\n` +
      `🎯 Avg Score: *${avgTest !== null ? avgTest + '%' : 'N/A'}*`;
    window.open(`https://wa.me/${String(student.phone).replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const overallStatus = summary.overall_status;

  return (
    <div className="space-y-4">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 rounded-2xl p-5 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 0%, transparent 50%)' }} />
        <div className="relative flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="text-indigo-300 text-xs font-semibold mb-1 flex items-center gap-1.5">
              <GraduationCap size={12} />
              {batch?.name || 'No Batch'} · Roll {student.roll || 'N/A'}
            </div>
            <h2 className="text-xl font-bold truncate">{student.name}</h2>
            <div className="flex items-center gap-1.5 mt-1 text-indigo-200 text-sm">
              <Phone size={12} />
              <span>{String(student.phone)}</span>
            </div>
            {overallStatus && (
              <span className={`inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full text-xs font-bold ${
                overallStatus === 'excellent' ? 'bg-green-400/20 text-green-200 border border-green-400/30' :
                overallStatus === 'good'      ? 'bg-indigo-400/20 text-indigo-200 border border-indigo-400/30' :
                                               'bg-red-400/20 text-red-200 border border-red-400/30'
              }`}>
                <Star size={10} fill="currentColor" />
                {overallStatus === 'excellent' ? 'Excellent Student' : overallStatus === 'good' ? 'Good Standing' : 'Needs Attention'}
              </span>
            )}
          </div>
          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-1.5 bg-green-500 hover:bg-green-400 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors shadow-lg flex-shrink-0"
          >
            <Share2 size={14} /> WhatsApp
          </button>
        </div>
      </div>

      {/* 4 KPI tiles */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays size={16} className="text-blue-600" />
            <span className="text-xs font-semibold text-blue-700">Attendance</span>
          </div>
          <div className={`text-2xl font-bold ${pctColor(attPct)}`}>{attPct}%</div>
          <div className="text-xs text-slate-500 mt-0.5">{attTotals.present || 0}/{attTotals.total || 0} classes</div>
          <ProgressBar value={attTotals.present || 0} max={attTotals.total || 1} color={pctBg(attPct)} />
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <IndianRupee size={16} className="text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700">Fees Paid</span>
          </div>
          <div className="text-xl font-bold text-emerald-700">{fmtCurrency(feeSummary.fees_paid || 0)}</div>
          <div className="text-xs text-slate-500 mt-0.5">{feePct}% of total</div>
          <ProgressBar value={feeSummary.fees_paid || 0} max={feeSummary.total_fee || 1} color="bg-emerald-500" />
        </div>

        <div className={`${(feeSummary.fees_due || 0) > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} border rounded-2xl p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={16} className={(feeSummary.fees_due || 0) > 0 ? 'text-red-500' : 'text-green-600'} />
            <span className={`text-xs font-semibold ${(feeSummary.fees_due || 0) > 0 ? 'text-red-700' : 'text-green-700'}`}>Fees Due</span>
          </div>
          <div className={`text-xl font-bold ${(feeSummary.fees_due || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {fmtCurrency(feeSummary.fees_due || 0)}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {(feeSummary.fees_due || 0) === 0 ? 'Fully Paid ✓' : 'Pending'}
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award size={16} className="text-purple-600" />
            <span className="text-xs font-semibold text-purple-700">Avg Score</span>
          </div>
          <div className={`text-2xl font-bold ${avgTest !== null ? pctColor(avgTest) : 'text-slate-400'}`}>
            {avgTest !== null ? `${avgTest}%` : 'N/A'}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{tests.length} tests taken</div>
        </div>
      </div>

      {/* Student info */}
      <SectionCard title="Student Information">
        <div className="space-y-2.5">
          {[
            { label: 'Full Name',    value: student.name,              field: 'name' },
            { label: 'Phone',        value: String(student.phone),      field: 'phone' },
            { label: 'Roll Number',  value: student.roll || '—',        field: 'roll' },
            { label: 'Batch',        value: batch?.name || '—',         field: null },
            { label: 'Timing',       value: batch?.timing || '—',       field: null },
            { label: 'Total Fee',    value: fmtCurrency(student.total_fees), field: null },
            { label: 'Joined',       value: student.created_at ? fmtDate(student.created_at) : '—', field: null },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <span className="text-xs text-slate-400 font-medium">{row.label}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-slate-800">{row.value}</span>
                {row.field && (
                  <button
                    onClick={() => onEditField(row.field!, row.value === '—' ? '' : row.value)}
                    className="text-slate-300 hover:text-indigo-500 transition-colors p-0.5"
                  >
                    <Edit2 size={11} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Recent test performance */}
      {tests.length > 0 && (
        <SectionCard title="Recent Tests">
          <div className="space-y-2.5">
            {tests.slice(0, 5).map((t: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold border flex-shrink-0 ${gradeColor(t.pct)}`}>
                  {gradeLabel(t.pct)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-700 truncate">{t.test_name}</div>
                  <ProgressBar value={t.marks_obtained} max={t.total_marks} color={pctBg(t.pct)} />
                </div>
                <span className={`text-sm font-bold w-10 text-right flex-shrink-0 ${pctColor(t.pct)}`}>{t.pct}%</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Attendance Tab — from full profile API
// ─────────────────────────────────────────────────────────────────────────────

function AttendanceTab({ profile }: { profile: any }) {
  const [calYear,  setCalYear]  = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());

  const dateMap: Record<string, AttendanceStatus> = profile?.attendance?.date_map || {};
  const monthly:  Record<string, any>              = profile?.attendance?.monthly  || {};
  const totals    = profile?.attendance?.totals    || {};

  const { total = 0, present = 0, absent = 0, leave = 0, pct = 0 } = totals;

  // Calendar cells
  const calCells = useMemo(() => {
    const cells: { day: number; date: string; status?: AttendanceStatus }[] = [];
    const first = firstDayOfWeek(calYear, calMonth);
    const days  = daysInMonth(calYear, calMonth);
    for (let i = 0; i < first; i++) cells.push({ day: 0, date: '' });
    for (let d = 1; d <= days; d++) {
      const ds = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, date: ds, status: dateMap[ds] });
    }
    return cells;
  }, [calYear, calMonth, dateMap]);

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  if (total === 0) {
    return (
      <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
        <CalendarDays className="mx-auto h-12 w-12 text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium">No attendance records yet</p>
        <p className="text-xs text-slate-400 mt-1">Records will appear once attendance is marked</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatPill label="Total"   value={total}   color="text-slate-700"  bg="bg-slate-50" />
        <StatPill label="Present" value={present} color="text-green-600"  bg="bg-green-50" />
        <StatPill label="Absent"  value={absent}  color="text-red-500"    bg="bg-red-50" />
        <StatPill label="Leave"   value={leave}   color="text-yellow-600" bg="bg-yellow-50" />
      </div>

      {/* Overall % */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-slate-700">Overall Attendance</span>
          <span className={`text-xl font-bold ${pctColor(pct)}`}>{pct}%</span>
        </div>
        <ProgressBar value={present} max={total} color={pctBg(pct)} />
        {pct < 75 && (
          <p className="text-xs text-red-500 mt-2 font-medium flex items-center gap-1">
            <AlertCircle size={12} /> Below 75% — attendance needs improvement
          </p>
        )}
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors touch-manipulation">
            <ChevronLeft size={18} />
          </button>
          <h3 className="text-sm font-bold text-slate-800">{monthLabel(calYear, calMonth)}</h3>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors touch-manipulation">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1.5">
          {['S','M','T','W','T','F','S'].map((d, i) => (
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
                title={cell.status ? `${cell.date}: ${cell.status}` : cell.date}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-semibold ${bg} ${isToday ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}`}
              >
                <span>{cell.day}</span>
                {cell.status && (
                  <span className="text-[7px] leading-none opacity-90">
                    {cell.status === 'present' ? 'P' : cell.status === 'absent' ? 'A' : 'L'}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
          {[['bg-green-500','Present'],['bg-red-400','Absent'],['bg-yellow-400','Leave'],['bg-slate-200','No Class']].map(([c, l]) => (
            <span key={l} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-md ${c} inline-block`} />{l}
            </span>
          ))}
        </div>
      </div>

      {/* Monthly table */}
      {Object.keys(monthly).length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-50">
            <h3 className="text-sm font-bold text-slate-800">Month-by-Month</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase">Month</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-green-600 uppercase">P</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-red-500 uppercase">A</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-yellow-600 uppercase">L</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {Object.entries(monthly)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([month, m]: [string, any]) => (
                    <tr key={month} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-700">
                        {new Date(month + '-01').toLocaleString('default', { month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-green-600">{m.present}</td>
                      <td className="px-4 py-3 text-center font-bold text-red-500">{m.absent}</td>
                      <td className="px-4 py-3 text-center font-bold text-yellow-600">{m.leave}</td>
                      <td className="px-4 py-3 text-center">
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
// Fees Tab
// ─────────────────────────────────────────────────────────────────────────────

function FeesTab({ profile, student, queryClient }: { profile: any; student: any; queryClient: any }) {
  const [amount, setAmount] = useState('');
  const [notes,  setNotes]  = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const feeSummary = profile?.fees?.summary || {};
  const payments   = profile?.fees?.payments || [];

  const total  = Number(feeSummary.total_fee || student.total_fees || 0);
  const paid   = Number(feeSummary.fees_paid || student.fees_paid || 0);
  const due    = Number(feeSummary.fees_due  ?? (total - paid));
  const feePct = total > 0 ? Math.round((paid / total) * 100) : 0;

  const addPaymentMutation = useMutation({
    mutationFn: feeService.create,
    onSuccess: () => {
      toast.success('Payment recorded');
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      setAmount(''); setNotes(''); setScreenshot(null);
    },
    onError: () => toast.error('Failed to record payment'),
  });

  const deletePaymentMutation = useMutation({
    mutationFn: feeService.delete,
    onSuccess: () => {
      toast.success('Transaction deleted');
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['fees'] });
    },
    onError: () => toast.error('Failed to delete'),
  });

  const handlePayment = () => {
    if (!amount || Number(amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    const fd = new FormData();
    fd.append('student', student.id);
    fd.append('amount', amount);
    fd.append('payment_date', new Date().toISOString());
    fd.append('notes', notes || 'Fee payment');
    if (screenshot) fd.append('screenshot', screenshot);
    addPaymentMutation.mutate(fd);
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Fee Summary</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-slate-50 rounded-xl">
            <div className="text-lg font-bold text-slate-800">{fmtCurrency(total)}</div>
            <div className="text-xs text-slate-500 mt-1">Total</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <div className="text-lg font-bold text-green-600">{fmtCurrency(paid)}</div>
            <div className="text-xs text-slate-500 mt-1">Paid</div>
          </div>
          <div className={`text-center p-3 rounded-xl ${due > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
            <div className={`text-lg font-bold ${due > 0 ? 'text-red-500' : 'text-green-600'}`}>{fmtCurrency(due)}</div>
            <div className="text-xs text-slate-500 mt-1">{due > 0 ? 'Due' : 'Paid ✓'}</div>
          </div>
        </div>
        <ProgressBar value={paid} max={total} color="bg-indigo-500" />
        <div className="text-xs text-slate-400 mt-1 text-right">{feePct}% collected</div>
      </div>

      {/* Record payment */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Record Payment</h3>
        <div className="space-y-3">
          {/* Quick amounts */}
          <div className="flex gap-2 flex-wrap">
            {[500, 1000, 2000, 5000].map(amt => (
              <button key={amt} onClick={() => setAmount(String(amt))}
                className="text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 px-3 py-2 rounded-lg transition-colors font-medium border border-slate-200 touch-manipulation"
              >
                ₹{amt.toLocaleString()}
              </button>
            ))}
            {due > 0 && (
              <button onClick={() => setAmount(String(due))}
                className="text-xs bg-red-50 text-red-600 px-3 py-2 rounded-lg font-medium border border-red-200 touch-manipulation"
              >
                Full Due ₹{due.toLocaleString()}
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="₹ Amount"
              className="flex-1 px-4 py-3 text-base font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className={`w-12 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-all touch-manipulation ${screenshot ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-slate-400'}`}
            >
              {screenshot ? <CheckCircle size={18} className="text-green-600" /> : <Camera size={18} className="text-slate-400" />}
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && setScreenshot(e.target.files[0])} />
            </button>
          </div>

          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Note (e.g. UPI, Cash, Month)"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          />

          <button
            onClick={handlePayment}
            disabled={!amount || Number(amount) <= 0 || addPaymentMutation.isPending}
            className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 text-sm touch-manipulation"
          >
            {addPaymentMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <IndianRupee size={16} />}
            Confirm ₹{amount || '0'} Payment
          </button>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Transaction History</h3>
          <span className="text-xs text-slate-400">{payments.length} records</span>
        </div>
        <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
          {payments.map((fee: any) => (
            <div key={fee.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 group">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{fee.notes || 'Payment'}</p>
                <p className="text-xs text-slate-400">{fmtDate(fee.payment_date)}</p>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <span className="text-sm font-bold text-green-600 whitespace-nowrap">
                  +{fmtCurrency(fee.amount)}
                </span>
                <button
                  onClick={() => { if (confirm('Delete this transaction?')) deletePaymentMutation.mutate(fee.id); }}
                  className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 touch-manipulation"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {payments.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">No transactions yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests Tab
// ─────────────────────────────────────────────────────────────────────────────

function TestsTab({ profile }: { profile: any }) {
  const tests: any[] = profile?.tests || [];

  const avgPct    = tests.length > 0 ? Math.round(tests.reduce((s: number, t: any) => s + t.pct, 0) / tests.length) : 0;
  const highest   = tests.length > 0 ? Math.max(...tests.map((t: any) => t.pct)) : 0;
  const passCount = tests.filter((t: any) => t.pct >= 33).length;

  if (tests.length === 0) {
    return (
      <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
        <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium">No test results yet</p>
        <p className="text-xs text-slate-400 mt-1">Results will appear after marks are entered</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatPill label="Tests Taken" value={tests.length}    color="text-indigo-600" bg="bg-indigo-50" />
        <StatPill label="Average"     value={`${avgPct}%`}   color={pctColor(avgPct)} bg="bg-slate-50" />
        <StatPill label="Highest"     value={`${highest}%`}  color="text-green-600"  bg="bg-green-50" />
        <StatPill label="Pass Rate"   value={`${tests.length > 0 ? Math.round((passCount / tests.length) * 100) : 0}%`} color="text-emerald-600" bg="bg-emerald-50" />
      </div>

      {/* Tests list */}
      <div className="space-y-3">
        {tests.map((t: any, i: number) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 border ${gradeColor(t.pct)}`}>
              {gradeLabel(t.pct)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-800 text-sm truncate">{t.test_name}</div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                <span>{fmtDate(t.date)}</span>
                <span>·</span>
                <span className="font-medium text-slate-500">{t.board}</span>
              </div>
              <div className="mt-2">
                <ProgressBar value={t.marks_obtained} max={t.total_marks} color={pctBg(t.pct)} />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className={`text-lg font-bold ${pctColor(t.pct)}`}>{t.pct}%</div>
              <div className="text-xs text-slate-400">{t.marks_obtained}/{t.total_marks}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      {tests.length >= 3 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">Score Trend</h3>
          </div>
          <div className="flex items-end gap-1.5 h-24">
            {[...tests].reverse().slice(-10).map((t: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs bg-slate-800 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {t.pct}%
                </span>
                <div
                  className={`w-full rounded-t-lg transition-all ${pctBg(t.pct)}`}
                  style={{ height: `${t.pct}%` }}
                />
                <span className="text-[9px] text-slate-400 text-center truncate w-full">{t.test_name?.slice(0, 3)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Report Tab — printable
// ─────────────────────────────────────────────────────────────────────────────

function ReportTab({ profile, student, data }: { profile: any; student: any; data: DashboardData }) {
  const attTotals  = profile?.attendance?.totals  || {};
  const feeSummary = profile?.fees?.summary       || {};
  const tests      = profile?.tests               || [];

  const attPct  = attTotals.pct  ?? 0;
  const feePct  = feeSummary.fee_pct ?? 0;
  const due     = feeSummary.fees_due ?? 0;
  const avgTest = tests.length > 0 ? Math.round(tests.reduce((s: number, t: any) => s + t.pct, 0) / tests.length) : null;
  const batch   = data.batches.find((b: any) => b.id === student.batch);

  return (
    <div className="space-y-4">
      <div className="flex justify-end print:hidden">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors touch-manipulation"
        >
          <FileText size={16} /> Print / PDF
        </button>
      </div>

      <div id="print-report" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        {/* Header */}
        <div className="border-b-2 border-slate-800 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-black uppercase tracking-wide">Student Report Card</h2>
              <p className="text-slate-500 text-xs mt-1">Generated: {fmtDate(todayStr())}</p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>Batch: <strong>{batch?.name || '—'}</strong></p>
              <p>Timing: {batch?.timing || '—'}</p>
            </div>
          </div>
        </div>

        {/* Student info grid */}
        <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
          {[
            ['Name',     student.name],
            ['Roll No',  student.roll || '—'],
            ['Phone',    String(student.phone)],
            ['Batch',    batch?.name || '—'],
            ['Joined',   student.created_at ? fmtDate(student.created_at) : '—'],
            ['Status',   attPct >= 75 && feePct >= 50 ? '✓ Good Standing' : '⚠ Needs Attention'],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-xs text-slate-400 uppercase font-semibold">{k}</p>
              <p className="font-bold text-slate-800 mt-0.5 text-sm">{v}</p>
            </div>
          ))}
        </div>

        {/* Metrics */}
        <table className="w-full border-collapse text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-slate-700 border border-slate-200 text-xs">Category</th>
              <th className="px-3 py-2 text-center font-semibold text-slate-700 border border-slate-200 text-xs">Details</th>
              <th className="px-3 py-2 text-center font-semibold text-slate-700 border border-slate-200 text-xs">%</th>
              <th className="px-3 py-2 text-center font-semibold text-slate-700 border border-slate-200 text-xs">Grade</th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                cat: 'Attendance',
                detail: `${attTotals.present || 0}P / ${attTotals.absent || 0}A / ${attTotals.leave || 0}L`,
                pct: attPct,
                grade: attPct >= 90 ? 'A+' : attPct >= 75 ? 'A' : attPct >= 60 ? 'B' : 'F',
                gradeColor: attPct >= 75 ? 'text-green-600' : 'text-red-500',
              },
              {
                cat: 'Fee Collection',
                detail: `${fmtCurrency(feeSummary.fees_paid || 0)} of ${fmtCurrency(feeSummary.total_fee || 0)}`,
                pct: feePct,
                grade: due <= 0 ? '✓ Clear' : `Due: ${fmtCurrency(due)}`,
                gradeColor: due <= 0 ? 'text-green-600' : 'text-red-500',
              },
              {
                cat: 'Academic',
                detail: `${tests.length} test(s) taken`,
                pct: avgTest ?? 0,
                grade: avgTest !== null ? gradeLabel(avgTest) : '—',
                gradeColor: avgTest !== null ? (avgTest >= 60 ? 'text-green-600' : 'text-yellow-600') : 'text-slate-400',
              },
            ].map(row => (
              <tr key={row.cat}>
                <td className="px-3 py-2.5 border border-slate-100 font-medium text-xs">{row.cat}</td>
                <td className="px-3 py-2.5 border border-slate-100 text-center text-xs text-slate-600">{row.detail}</td>
                <td className="px-3 py-2.5 border border-slate-100 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="w-16 bg-slate-200 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${pctBg(row.pct)}`} style={{ width: `${row.pct}%` }} />
                    </div>
                    <span className={`text-xs font-bold ${pctColor(row.pct)}`}>{row.pct}%</span>
                  </div>
                </td>
                <td className={`px-3 py-2.5 border border-slate-100 text-center font-bold text-xs ${row.gradeColor}`}>{row.grade}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Remarks */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-xs font-bold text-slate-600 mb-1 uppercase">Remarks</p>
          <p className="text-sm text-slate-600">
            {attPct >= 75 && (avgTest === null || avgTest >= 60) && due <= 0
              ? `${student.name} is performing excellently across all parameters. Keep it up!`
              : attPct < 75
              ? `${student.name}'s attendance (${attPct}%) is below the 75% requirement.`
              : due > 0
              ? `Fee due of ${fmtCurrency(due)} needs to be cleared at the earliest.`
              : `${student.name} has room to improve academic performance.`}
          </p>
        </div>

        {/* Signatures */}
        <div className="flex justify-between items-end pt-4 border-t border-slate-200 text-xs text-slate-500">
          <div>
            <div className="w-28 border-b border-slate-400 mb-1" />
            <p>Student Signature</p>
          </div>
          <div className="text-right">
            <div className="w-28 border-b border-slate-400 mb-1 ml-auto" />
            <p>Teacher / Authority</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-report, #print-report * { visibility: visible; }
          #print-report { position: absolute; left: 0; top: 0; width: 100%; padding: 24px; }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Edit Field Modal
// ─────────────────────────────────────────────────────────────────────────────

function EditFieldModal({ field, value, onSave, onClose, isPending }: {
  field: string; value: string; onSave: (v: string) => void;
  onClose: () => void; isPending: boolean;
}) {
  const [val, setVal] = useState(value);
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm p-6 animate-in slide-in-from-bottom-4 sm:zoom-in-95">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800 capitalize">Edit {field.replace('_', ' ')}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 touch-manipulation"><X size={18} /></button>
        </div>
        <input
          autoFocus
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-base"
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSave(val)}
        />
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-sm touch-manipulation">
            Cancel
          </button>
          <button
            onClick={() => onSave(val)}
            disabled={isPending}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2 text-sm touch-manipulation"
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
  { key: 'overview',   label: 'Overview',   icon: GraduationCap },
  { key: 'attendance', label: 'Attendance', icon: CalendarDays },
  { key: 'fees',       label: 'Fees',       icon: IndianRupee },
  { key: 'tests',      label: 'Tests',      icon: BookOpen },
  { key: 'reports',    label: 'Report',     icon: FileText },
];

export default function StudentProfile({ studentId, data, onBack }: StudentProfileProps) {
  const [tab, setTab]           = useState<ProfileTab>('overview');
  const [editField, setEditField] = useState<{ field: string; value: string } | null>(null);
  const fileRef                 = useRef<HTMLInputElement>(null);
  const queryClient             = useQueryClient();

  // Fetch full profile from the dedicated API endpoint
  const {
    data: profileResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['student-profile', studentId],
    queryFn:  () => studentService.getFullProfile(studentId),
    staleTime: 30_000,
    retry: 2,
  });

  const profile = profileResponse?.success ? profileResponse : null;

  const student = data.students.find((s: any) => s.id === studentId);
  const effectiveStudent = profile?.student || student;

  // 1. Move the mutations UP here, BEFORE the if (!student) check
  const updateMutation = useMutation({
    mutationFn: (payload: any) => studentService.update(studentId, payload),
    onSuccess: () => {
      toast.success('Updated successfully');
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student-profile', studentId] });
      setEditField(null);
    },
    onError: () => toast.error('Update failed'),
  });

  const picMutation = useMutation({
    mutationFn: (fd: FormData) => studentService.uploadProfilePic(studentId, fd),
    onSuccess: () => {
      toast.success('Photo updated');
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student-profile', studentId] });
    },
    onError: () => toast.error('Photo upload failed'),
  });

  // 2. NOW you can safely do your early return
  if (!student) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p>Student not found.</p>
        <button onClick={onBack} className="mt-4 text-indigo-600 underline text-sm">Go back</button>
      </div>
    );
  }

  // ... rest of your component (handlePicChange, attPct, batch, return statement)


  // Use profile API data first; fall back to local data
  // const effectiveStudent = profile?.student || student;

  // const updateMutation = useMutation({
  //   mutationFn: (payload: any) => studentService.update(studentId, payload),
  //   onSuccess: () => {
  //     toast.success('Updated successfully');
  //     queryClient.invalidateQueries({ queryKey: ['students'] });
  //     queryClient.invalidateQueries({ queryKey: ['student-profile', studentId] });
  //     setEditField(null);
  //   },
  //   onError: () => toast.error('Update failed'),
  // });

  // const picMutation = useMutation({
  //   mutationFn: (fd: FormData) => studentService.uploadProfilePic(studentId, fd),
  //   onSuccess: () => {
  //     toast.success('Photo updated');
  //     queryClient.invalidateQueries({ queryKey: ['students'] });
  //     queryClient.invalidateQueries({ queryKey: ['student-profile', studentId] });
  //   },
  //   onError: () => toast.error('Photo upload failed'),
  // });

  const handlePicChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('profile_pic', file);
    picMutation.mutate(fd);
  };

  // Compute attendance % for the badge — prefer API data
  const attPct = profile?.attendance?.totals?.pct ?? (() => {
    const recs = data.attendance.flatMap((r: any) =>
      r.records.filter((rec: any) => rec.student === studentId)
    );
    return recs.length > 0
      ? Math.round(recs.filter((r: any) => r.status === 'present').length / recs.length * 100)
      : 0;
  })();

  const batch = data.batches.find((b: any) => b.id === effectiveStudent.batch);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-300">
      {/* Edit modal */}
      {editField && (
        <EditFieldModal
          field={editField.field}
          value={editField.value}
          onSave={v => updateMutation.mutate({ [editField.field]: v })}
          onClose={() => setEditField(null)}
          isPending={updateMutation.isPending}
        />
      )}

      {/* Sticky top bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6 py-3 shadow-sm mb-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 flex-shrink-0 touch-manipulation"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Avatar */}
          <div className="relative group cursor-pointer flex-shrink-0" onClick={() => fileRef.current?.click()}>
            {profilePicUrl(effectiveStudent.profile_pic) ? (
              <img
                src={profilePicUrl(effectiveStudent.profile_pic)!}
                alt={effectiveStudent.name}
                className="w-10 h-10 rounded-xl object-cover border-2 border-indigo-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold border-2 border-indigo-200 text-base">
                {effectiveStudent.name.charAt(0)}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {picMutation.isPending ? <Loader2 className="animate-spin w-4 h-4 text-white" /> : <Upload className="w-4 h-4 text-white" />}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePicChange} />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-slate-900 leading-tight truncate">{effectiveStudent.name}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
              <span>{batch?.name || 'No Batch'}</span>
              <span>·</span>
              <span>Roll: {effectiveStudent.roll || 'N/A'}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${
                attPct >= 75 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
              }`}>
                {attPct}% att.
              </span>
            </p>
          </div>

          {/* Refresh button */}
          <button
            onClick={() => refetch()}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors flex-shrink-0 touch-manipulation"
            title="Refresh data"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3 overflow-x-auto scrollbar-hide -mx-1 px-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all touch-manipulation ${
                tab === t.key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="pt-4 pb-6">
        {isLoading && tab !== 'overview' ? (
          <LoadingSpinner />
        ) : isError ? (
          <div className="text-center py-10 bg-red-50 rounded-2xl border border-red-200">
            <AlertCircle className="mx-auto w-8 h-8 text-red-400 mb-2" />
            <p className="text-red-600 font-medium text-sm">Failed to load profile data</p>
            <button
              onClick={() => refetch()}
              className="mt-3 text-sm text-indigo-600 underline touch-manipulation"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {tab === 'overview'   && (
              <OverviewTab
                profile={profile}
                student={effectiveStudent}
                data={data}
                onEditField={(f, v) => setEditField({ field: f, value: v })}
              />
            )}
            {tab === 'attendance' && <AttendanceTab profile={profile} />}
            {tab === 'fees'       && <FeesTab profile={profile} student={effectiveStudent} queryClient={queryClient} />}
            {tab === 'tests'      && <TestsTab profile={profile} />}
            {tab === 'reports'    && <ReportTab profile={profile} student={effectiveStudent} data={data} />}
          </>
        )}
      </div>
    </div>
  );
}