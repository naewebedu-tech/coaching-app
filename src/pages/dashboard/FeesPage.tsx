import { useState, type FormEvent } from 'react';
import { ArrowLeft, Share2, Printer, X, CheckCircle } from 'lucide-react';
import type { DashboardData, Student } from '../../hooks/useDashboardData';
import type { User } from '../../App';

interface FeesPageProps {
  data: DashboardData;
  user: User;
}

type ViewMode = 'overview' | 'batch_detail' | 'student_detail' | 'invoice';

const FeesPage = ({ data, user }: FeesPageProps) => {
  const { students, setStudents, batches, fees, setFees } = data;
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [activeBatchId, setActiveBatchId] = useState<number | null>(null);
  const [activeStudentId, setActiveStudentId] = useState<number | null>(null);
  const [amount, setAmount] = useState<string>('');

  const handleAddPayment = (e: FormEvent) => {
    e.preventDefault();
    if(!amount || !activeStudentId) return;
    const student = students.find(s => s.id === activeStudentId);
    if(!student) return;
    
    const updatedStudent = { ...student, feesPaid: Number(student.feesPaid) + parseInt(amount) };
    setStudents(students.map(s => s.id === activeStudentId ? updatedStudent : s));
    setFees([...fees, { id: Date.now(), studentId: activeStudentId, amount: parseInt(amount), date: new Date().toISOString() }]);
    setAmount('');
    alert("Payment Added Successfully");
  };

  const handleShareReminder = (student: Student) => {
    const due = student.totalFees - student.feesPaid;
    const text = `Dear Student/Parent,\n\nThis is a friendly reminder from ${user.instituteName || 'CoachingApp'}.\n\nStudent: ${student.name}\nOutstanding Fee: ₹${due}\n\nPlease clear the dues at your earliest convenience.\n\nThank You.`;
    window.open(`https://wa.me/91${student.phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Overview View
  const Overview = () => {
    const batchStats = batches.map(batch => {
      const batchStudents = students.filter(s => parseInt(s.batchId as string) === batch.id);
      const total = batchStudents.reduce((acc, s) => acc + (s.totalFees || 0), 0);
      const collected = batchStudents.reduce((acc, s) => acc + (s.feesPaid || 0), 0);
      const due = total - collected;
      return { ...batch, total, collected, due, studentCount: batchStudents.length };
    });

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Fee Overview by Class</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batchStats.map(stat => (
            <div 
              key={stat.id} 
              className="bg-white p-5 rounded-xl border border-slate-200 cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-indigo-500"
              onClick={() => { setActiveBatchId(stat.id); setViewMode('batch_detail'); }}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg">{stat.name}</h3>
                <div className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold">
                  {stat.studentCount} Students
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Collected</span>
                  <span className="font-bold text-green-600">₹{stat.collected.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pending</span>
                  <span className="font-bold text-red-500">₹{stat.due.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                    style={{width: `${stat.total > 0 ? (stat.collected/stat.total)*100 : 0}%`}}
                  ></div>
                </div>
                <p className="text-xs text-right text-gray-400 mt-1">
                  {stat.total > 0 ? Math.round((stat.collected/stat.total)*100) : 0}% Recovered
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Batch Detail View
  const BatchDetail = () => {
    const batch = batches.find(b => b.id === activeBatchId);
    const batchStudents = students.filter(s => parseInt(s.batchId as string) === activeBatchId);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setViewMode('overview')} className="p-2 hover:bg-slate-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{batch?.name} - Fee Status</h2>
            <p className="text-sm text-gray-500">Manage fees for individual students in this class.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-sm font-semibold text-gray-600">Student</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Total Fee</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Paid</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Due</th>
                  <th className="p-4 text-sm font-semibold text-gray-600 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {batchStudents.map(s => {
                  const due = s.totalFees - s.feesPaid;
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-gray-500">Roll: {s.roll}</div>
                      </td>
                      <td className="p-4">₹{s.totalFees.toLocaleString()}</td>
                      <td className="p-4 text-green-600 font-medium">₹{s.feesPaid.toLocaleString()}</td>
                      <td className="p-4">
                        {due > 0 ? (
                          <span className="text-red-500 font-bold">₹{due.toLocaleString()}</span>
                        ) : (
                          <span className="text-green-500 flex items-center gap-1">
                            <CheckCircle size={14}/> Paid
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        {due > 0 && (
                          <button 
                            onClick={() => handleShareReminder(s)} 
                            className="text-green-600 hover:text-green-800 p-2 bg-green-50 rounded" 
                            title="Send WhatsApp Reminder"
                          >
                            <Share2 size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => { setActiveStudentId(s.id); setViewMode('student_detail'); }}
                          className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm hover:bg-slate-200"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Student Detail View
  const StudentDetail = () => {
    const student = students.find(s => s.id === activeStudentId);
    const studentFees = fees.filter(f => f.studentId === activeStudentId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const due = student ? student.totalFees - student.feesPaid : 0;
    const batch = batches.find(b => b.id === parseInt(student?.batchId as string));
    
    if(!student) return <div>Student not found</div>;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setViewMode('batch_detail')} className="p-2 hover:bg-slate-100 rounded-lg">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{student.name}</h2>
              <p className="text-sm text-gray-500">Roll: {student.roll} • {batch?.name}</p>
            </div>
          </div>
          <button 
            onClick={() => setViewMode('invoice')} 
            className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-200"
          >
            <Printer size={18} /> Print Bill
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 h-fit">
            <h3 className="font-bold text-lg mb-4">Add Payment</h3>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Total Fee:</span>
                <span className="font-medium">₹{student.totalFees.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Paid:</span>
                <span className="font-medium text-green-600">₹{student.feesPaid.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 my-2 pt-2 flex justify-between">
                <span className="font-bold text-gray-800">Outstanding:</span>
                <span className={`font-bold ${due > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  ₹{due.toLocaleString()}
                </span>
              </div>
            </div>
            <form onSubmit={handleAddPayment} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
              <input 
                type="number" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                required 
                placeholder="Enter amount..." 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none mb-4"
              />
              <button 
                type="submit" 
                disabled={!amount}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
              >
                Record Transaction
              </button>
            </form>
            {due > 0 && (
              <button 
                onClick={() => handleShareReminder(student)}
                className="w-full border border-green-200 text-green-700 py-2 rounded-lg font-semibold hover:bg-green-50 flex items-center justify-center gap-2"
              >
                <Share2 size={18} /> Share Reminder
              </button>
            )}
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="font-bold text-lg mb-4">Transaction History</h3>
            <div className="overflow-y-auto max-h-[400px]">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-3 text-sm text-gray-600">Date</th>
                    <th className="p-3 text-sm text-gray-600">Amount</th>
                    <th className="p-3 text-sm text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {studentFees.map(fee => (
                    <tr key={fee.id}>
                      <td className="p-3 text-sm">{new Date(fee.date).toLocaleDateString()}</td>
                      <td className="p-3 font-bold text-green-600">+₹{fee.amount.toLocaleString()}</td>
                      <td className="p-3 text-xs">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">Success</span>
                      </td>
                    </tr>
                  ))}
                  {studentFees.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-gray-400">No transactions yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Invoice View
  if (viewMode === 'invoice') {
    const student = students.find(s => s.id === activeStudentId);
    if (!student) return null;
    
    const studentFees = fees.filter(f => f.studentId === activeStudentId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const batch = batches.find(b => b.id === parseInt(student?.batchId as string));
    const due = student.totalFees - student.feesPaid;

    return (
      <div className="fixed inset-0 bg-gray-100 z-50 overflow-auto flex justify-center p-8">
        <style>{`@media print { .no-print { display: none !important; } body { background: white; } .paper-container { box-shadow: none; border: none; width: 100%; max-width: none; padding: 0; } }`}</style>
        
        <div className="fixed top-4 right-4 flex gap-2 no-print">
          <button 
            onClick={() => setViewMode('student_detail')}
            className="bg-white px-4 py-2 rounded-lg border border-slate-200 flex items-center gap-2 hover:bg-slate-50"
          >
            <X size={18} /> Close
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
          >
            <Printer size={18} /> Print / Save PDF
          </button>
        </div>

        <div className="paper-container bg-white w-full max-w-[21cm] p-10 shadow-2xl text-gray-800">
          <div className="flex justify-between items-start border-b-2 border-indigo-600 pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-indigo-700 uppercase tracking-wide">
                {user.instituteName || 'CoachingApp'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">Excellence in Education</p>
              <p className="text-sm text-gray-500">123, Education Lane, Knowledge City</p>
              <p className="text-sm text-gray-500">Phone: {user.email || '+91-9876543210'}</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-400 uppercase">Fee Statement</h2>
              <p className="text-sm font-medium mt-1">Date: {new Date().toLocaleDateString()}</p>
              <p className="text-sm text-gray-500">Invoice #: INV-{Date.now().toString().slice(-6)}</p>
            </div>
          </div>

          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Bill To:</p>
            <h3 className="text-xl font-bold text-gray-900">{student.name}</h3>
            <p className="text-sm text-gray-600">Roll No: <span className="font-semibold">{student.roll}</span></p>
            <p className="text-sm text-gray-600">Class: {batch?.name}</p>
            <p className="text-sm text-gray-600">Phone: {student.phone}</p>
          </div>

          <div className="mb-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-indigo-50 text-indigo-800 text-sm uppercase">
                  <th className="p-3 border-b border-indigo-100">Description</th>
                  <th className="p-3 border-b border-indigo-100 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-4 border-b border-gray-100 font-medium">Total Course Fee</td>
                  <td className="p-4 border-b border-gray-100 text-right font-bold">
                    ₹{student.totalFees.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-gray-100 text-gray-600">Total Paid Amount</td>
                  <td className="p-4 border-b border-gray-100 text-right text-green-600 font-medium">
                    - ₹{student.feesPaid.toLocaleString()}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td className="p-4 font-bold text-gray-800 border-t border-gray-200">Balance Due</td>
                  <td className={`p-4 font-bold text-right border-t border-gray-200 text-xl ${
                    due > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    ₹{due.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mb-8">
            <h4 className="font-bold text-sm uppercase text-gray-500 mb-3 border-b pb-1">Payment History</h4>
            {studentFees.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400">
                    <th className="text-left py-1">Date</th>
                    <th className="text-left py-1">Payment ID</th>
                    <th className="text-right py-1">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  {studentFees.map(f => (
                    <tr key={f.id}>
                      <td className="py-1">{new Date(f.date).toLocaleDateString()}</td>
                      <td className="py-1">TXN-{f.id.toString().slice(-6)}</td>
                      <td className="py-1 text-right">₹{f.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm italic text-gray-400">No payment records found.</p>
            )}
          </div>

          <div className="mt-12 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500 mb-1">
              Please make checks payable to "{user.instituteName || 'CoachingApp'}".
            </p>
            <p className="text-xs text-gray-500">Thank you for your business!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {viewMode === 'overview' && <Overview />}
      {viewMode === 'batch_detail' && <BatchDetail />}
      {viewMode === 'student_detail' && <StudentDetail />}
    </>
  );
};

export default FeesPage;