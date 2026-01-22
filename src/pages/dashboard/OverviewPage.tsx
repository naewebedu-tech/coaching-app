import React from 'react';
import { Users, DollarSign, CheckCircle, FileText, AlertCircle } from 'lucide-react';
import type { User } from '../../App';
import type { DashboardData } from '../../hooks/useDashboardData';

interface OverviewPageProps {
  user: User;
  data: DashboardData;
}

const OverviewPage = ({ user, data }: OverviewPageProps) => {
  const { students, batches, fees, tests, attendance } = data;
  
  // --- Real-time Calculations ---

  const totalStudents = students.length;
  const totalBatches = batches.length;
  
  // Calculate Fee Stats
  // Note: Django DecimalFields often return as strings, so we wrap in Number()
  const totalExpectedFees = students.reduce((acc, curr) => acc + Number(curr.total_fees || 0), 0);
  const totalCollectedFees = students.reduce((acc, curr) => acc + Number(curr.fees_paid || 0), 0);
  const pendingFees = totalExpectedFees - totalCollectedFees;

  // Calculate Today's Attendance
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysAttendance = attendance.filter(a => a.date === todayStr);
  
  // Count total 'present' status across all batches for today
  const presentToday = todaysAttendance.reduce((acc, curr) => {
    const count = curr.records ? curr.records.filter(r => r.status === 'present').length : 0;
    return acc + count;
  }, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Welcome back, {user.name}!</h2>
        <p className="text-slate-600 mt-1">Here's what's happening at <span className="font-semibold text-indigo-600">{user.institute_name}</span> today.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Students" 
          value={totalStudents} 
          change={`${totalBatches} Active Batches`} 
          icon={Users} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Fees Collected" 
          value={`₹${totalCollectedFees.toLocaleString()}`} 
          change={`₹${pendingFees.toLocaleString()} Pending`} 
          icon={DollarSign} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Present Today" 
          value={presentToday} 
          change={todayStr === new Date().toISOString().split('T')[0] ? "Marked for Today" : "Data from latest entry"} 
          icon={CheckCircle} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="Tests Conducted" 
          value={tests.length} 
          change="Total Exams" 
          icon={FileText} 
          color="bg-purple-500" 
        />
      </div>

      {/* Charts & Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Fee Defaulters List */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col h-96">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
            <AlertCircle className="text-orange-500" size={20} /> 
            Fee Defaulters <span className="text-xs font-normal text-slate-400 ml-auto">Top 10</span>
          </h3>
          
          <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 pr-2">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white border-b border-slate-100">
                <tr>
                  <th className="pb-3 text-left font-semibold text-slate-500">Name</th>
                  <th className="pb-3 text-left font-semibold text-slate-500">Batch</th>
                  <th className="pb-3 text-right font-semibold text-slate-500">Due Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students
                  .filter(s => (Number(s.total_fees) - Number(s.fees_paid)) > 0)
                  .sort((a, b) => (Number(b.total_fees) - Number(b.fees_paid)) - (Number(a.total_fees) - Number(a.fees_paid))) // Sort by highest due
                  .slice(0, 10)
                  .map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-medium text-slate-700">{s.name}</td>
                      <td className="py-3 text-slate-500 text-xs">{s.batch_name || 'N/A'}</td>
                      <td className="py-3 text-right text-red-500 font-bold">
                        ₹{(Number(s.total_fees) - Number(s.fees_paid)).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                
                {students.length > 0 && students.every(s => (Number(s.total_fees) - Number(s.fees_paid)) <= 0) && (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-400 italic">
                      No dues pending! Great job.
                    </td>
                  </tr>
                )}
                
                {students.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-400">
                      No students found. Add students to see data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Feed (Using Payments) */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm h-96 flex flex-col">
          <h3 className="text-lg font-bold mb-4 text-slate-800">Recent Transactions</h3>
          <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 pr-2">
            {fees.length > 0 ? (
              <div className="space-y-4">
                {fees.slice(0, 10).map((fee) => (
                  <div key={fee.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <DollarSign size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{fee.student_name || "Unknown Student"}</p>
                        <p className="text-xs text-slate-400">{new Date(fee.payment_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="font-bold text-green-600 text-sm">+₹{Number(fee.amount).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <DollarSign size={32} className="mb-2 opacity-20" />
                <p>No recent transactions.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// --- Helper Component ---

interface StatCardProps {
  title: string;
  value: number | string;
  change: string;
  icon: any;
  color: string;
}

const StatCard = ({ title, value, change, icon: Icon, color }: StatCardProps) => (
  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <h3 className="text-2xl font-bold text-slate-900 mb-1">{value}</h3>
    <p className="text-sm font-medium text-slate-600">{title}</p>
    <div className="mt-3 flex items-center text-xs text-slate-400">
      <span className="bg-slate-100 px-2 py-1 rounded text-slate-600 font-medium">{change}</span>
    </div>
  </div>
);

export default OverviewPage;