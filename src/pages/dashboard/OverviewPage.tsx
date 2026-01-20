import { Users, DollarSign, CheckCircle, FileText, AlertCircle, UserPlus, ScanFace, CreditCard, type LucideIcon } from 'lucide-react';
import type { User } from '../../App';
import type { DashboardData } from '../../hooks/useDashboardData';

interface OverviewPageProps {
  user: User;
  data: DashboardData;
}

const OverviewPage = ({ user, data }: OverviewPageProps) => {
  const { students, batches, tests, attendance } = data;
  
  const totalStudents = students.length;
  const totalBatches = batches.length;
  
  // FIX: Removed unnecessary parseInt/string casting since types are already number
  const totalExpectedFees = students.reduce((acc, curr) => acc + (curr.totalFees || 0), 0);
  const totalCollectedFees = students.reduce((acc, curr) => acc + (curr.feesPaid || 0), 0);
  const pendingFees = totalExpectedFees - totalCollectedFees;

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysAttendance = attendance.filter(a => a.date === todayStr);
  const presentToday = todaysAttendance.reduce((acc, curr) => {
    // Assuming records is an object { studentId: status }
    const presentCount = Object.values(curr.records || {}).filter((status: any) => status === 'present').length;
    return acc + presentCount;
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Welcome back, {user.name}!</h2>
        <p className="text-slate-600 mt-1">Here's what's happening with {user.instituteName} today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={totalStudents} change={`${totalBatches} Batches`} icon={Users} color="bg-blue-500" />
        <StatCard title="Fees Collected" value={`₹${totalCollectedFees.toLocaleString()}`} change={`₹${pendingFees.toLocaleString()} Due`} icon={DollarSign} color="bg-green-500" />
        <StatCard title="Present Today" value={presentToday} change="Across all batches" icon={CheckCircle} color="bg-indigo-500" />
        <StatCard title="Tests Conducted" value={tests.length} change="This month" icon={FileText} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="text-orange-500" size={20} />
            Fee Defaulters
          </h3>
          <div className="overflow-y-auto max-h-64">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="pb-2 text-left">Name</th>
                  <th className="pb-2 text-left">Batch</th>
                  <th className="pb-2 text-right">Due</th>
                </tr>
              </thead>
              <tbody>
                {students.filter(s => ((s.totalFees || 0) - (s.feesPaid || 0)) > 0).map(s => (
                  <tr key={s.id} className="border-b border-slate-50">
                    <td className="py-3 font-medium">{s.name}</td>
                    <td className="py-3 text-slate-500">
                      {batches.find(b => b.id === Number(s.batchId))?.name || 'Unknown'}
                    </td>
                    <td className="py-3 text-right text-red-500 font-medium">
                      ₹{((s.totalFees || 0) - (s.feesPaid || 0)).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {students.every(s => ((s.totalFees || 0) - (s.feesPaid || 0)) <= 0) && (
                  <tr><td colSpan={3} className="py-4 text-center text-slate-400">No dues pending</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <QuickActionBtn icon={ScanFace} text="Mark Attendance" />
            <QuickActionBtn icon={UserPlus} text="Add Student" />
            <QuickActionBtn icon={CreditCard} text="Collect Fee" />
            <QuickActionBtn icon={FileText} text="Generate Report" />
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: LucideIcon;
  color: string;
}

const StatCard = ({ title, value, change, icon: Icon, color }: StatCardProps) => (
  <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <h3 className="text-2xl font-bold text-slate-900 mb-1">{value}</h3>
    <p className="text-sm text-slate-600">{title}</p>
    <p className="text-xs text-slate-400 mt-2">{change}</p>
  </div>
);

interface QuickActionBtnProps {
  icon: LucideIcon;
  text: string;
}

const QuickActionBtn = ({ icon: Icon, text }: QuickActionBtnProps) => (
  <button className="p-4 border-2 border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all flex flex-col items-center gap-2 group">
    <Icon className="w-6 h-6 text-slate-600 group-hover:text-indigo-600" />
    <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">{text}</span>
  </button>
);

export default OverviewPage;