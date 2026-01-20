import { BarChart3 } from 'lucide-react';
import { type DashboardData } from '../../hooks/useDashboardData';

interface ReportsPageProps {
  data: DashboardData;
}

const ReportsPage = ({ data }: ReportsPageProps) => {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200">
      <h2 className="text-2xl font-bold mb-6">Reports & Analytics</h2>
      <div className="text-center py-12 text-slate-500">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>Advanced reports and analytics coming soon</p>
        <p className="text-sm mt-2">Currently tracking {data.students.length} students.</p>
      </div>
    </div>
  );
};

export default ReportsPage;