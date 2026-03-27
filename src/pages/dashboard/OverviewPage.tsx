// pages/dashboard/OverviewPage.tsx
import { Users, DollarSign, CheckCircle, FileText, AlertCircle, ArrowRight, Calendar, Layers, TrendingUp } from 'lucide-react';
import type { User } from '../../App';
import type { DashboardData } from '../../hooks/useDashboardData';

interface OverviewPageProps {
  user: User;
  data: DashboardData;
  setView?: (view: string) => void;
}

const OverviewPage = ({ user, data, setView }: OverviewPageProps) => {
  const { students, batches, fees, tests, attendance } = data;

  const totalStudents    = students.length;
  const totalBatches     = batches.length;
  const totalExpectedFees = students.reduce((acc, s) => acc + Number(s.total_fees || 0), 0);
  const totalCollectedFees = students.reduce((acc, s) => acc + Number(s.fees_paid || 0), 0);
  const pendingFees      = totalExpectedFees - totalCollectedFees;
  const feeCollectionPct = totalExpectedFees > 0 ? Math.round((totalCollectedFees / totalExpectedFees) * 100) : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysAttendance = attendance.filter(a => a.date === todayStr);
  const presentToday = todaysAttendance.reduce((acc, curr) => {
    return acc + (curr.records ? curr.records.filter(r => r.status === 'present').length : 0);
  }, 0);

  const navigate = (view: string) => setView?.(view);

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Welcome back, {user.name.split(' ')[0]}! 👋
        </h2>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">
          Here's what's happening at{' '}
          <span className="font-semibold text-indigo-600">{user.institute_name}</span> today.
        </p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => navigate('students')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left group"
        >
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
            <Users size={20} />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">{totalStudents}</div>
          <div className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Total Students</div>
          <div className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
            <Layers size={10} /> {totalBatches} Batches
            <ArrowRight size={10} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>

        <button
          onClick={() => navigate('fees')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left group"
        >
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
            <DollarSign size={20} />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">₹{totalCollectedFees.toLocaleString()}</div>
          <div className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Collected</div>
          <div className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
            <TrendingUp size={10} /> {feeCollectionPct}% collected
            <ArrowRight size={10} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>

        <button
          onClick={() => navigate('attendance')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left group"
        >
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
            <CheckCircle size={20} />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">{presentToday}</div>
          <div className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Present Today</div>
          <div className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
            <Calendar size={10} /> {todayStr}
            <ArrowRight size={10} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>

        <button
          onClick={() => navigate('exams')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left group"
        >
          <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
            <FileText size={20} />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">{tests.length}</div>
          <div className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Tests</div>
          <div className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
            Total Exams
            <ArrowRight size={10} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>
      </div>

      {/* Fee progress bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-slate-800">Fee Collection Progress</h3>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">{feeCollectionPct}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden mb-3">
          <div
            className="h-3 rounded-full bg-indigo-500 transition-all duration-700"
            style={{ width: `${feeCollectionPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>Collected: <strong className="text-emerald-600">₹{totalCollectedFees.toLocaleString()}</strong></span>
          <span>Pending: <strong className="text-orange-500">₹{pendingFees.toLocaleString()}</strong></span>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Fee defaulters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <AlertCircle size={15} className="text-orange-500" /> Fee Defaulters
            </h3>
            <button
              onClick={() => navigate('fees')}
              className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={11} />
            </button>
          </div>
          <div className="overflow-y-auto max-h-64">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white border-b border-slate-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400">Name</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 hidden sm:table-cell">Batch</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-400">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students
                  .filter(s => Number(s.total_fees) - Number(s.fees_paid) > 0)
                  .sort((a, b) => (Number(b.total_fees) - Number(b.fees_paid)) - (Number(a.total_fees) - Number(a.fees_paid)))
                  .slice(0, 8)
                  .map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-slate-700 text-xs sm:text-sm">{s.name}</td>
                      <td className="px-4 py-2.5 text-slate-400 text-xs hidden sm:table-cell">{s.batch_name || 'N/A'}</td>
                      <td className="px-4 py-2.5 text-right text-red-500 font-bold text-xs">
                        ₹{(Number(s.total_fees) - Number(s.fees_paid)).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                {students.every(s => Number(s.total_fees) - Number(s.fees_paid) <= 0) && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-400 text-sm italic">No dues pending! 🎉</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent transactions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Recent Transactions</h3>
            <button
              onClick={() => navigate('fees')}
              className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={11} />
            </button>
          </div>
          <div className="overflow-y-auto max-h-64 divide-y divide-slate-50">
            {fees.length > 0 ? (
              fees.slice(0, 8).map(fee => (
                <div key={fee.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                    <DollarSign size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">
                      {fee.student_name || 'Unknown'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(fee.payment_date).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <span className="font-bold text-green-600 text-xs whitespace-nowrap">
                    +₹{Number(fee.amount).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                <DollarSign size={28} className="opacity-20" />
                <p className="text-sm">No transactions yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Mark Attendance', icon: Calendar,    view: 'attendance', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' },
            { label: 'Add Student',     icon: Users,       view: 'students',   color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
            { label: 'Record Fee',      icon: DollarSign,  view: 'fees',       color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
            { label: 'Create Test',     icon: FileText,    view: 'exams',      color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
          ].map(({ label, icon: Icon, view, color }) => (
            <button
              key={view}
              onClick={() => navigate(view)}
              className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-xs font-semibold transition-all ${color} touch-manipulation`}
            >
              <Icon size={15} className="flex-shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;