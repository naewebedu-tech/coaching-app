import React, { useState, useRef } from 'react';
import { ArrowLeft, Share2, Printer, CheckCircle, Camera, Upload, Trash2, Eye } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { feeService } from '../../services/api';
import type { DashboardData, Student } from '../../hooks/useDashboardData';
import type { User } from '../../App';
import toast from 'react-hot-toast';

interface FeesPageProps {
  data: DashboardData;
  user: User;
}

const FeesPage = ({ data, user }: FeesPageProps) => {
  const { students, batches, fees } = data;
  const [viewMode, setViewMode] = useState<'overview' | 'batch_detail' | 'student_detail' | 'invoice'>('overview');
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  
  // Payment Form State
  const [amount, setAmount] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  // --- Mutations ---

  const addPaymentMutation = useMutation({
    mutationFn: feeService.create,
    onSuccess: () => {
      toast.success("Payment Recorded Successfully");
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['students'] }); // Update student totals
      // Reset Form
      setAmount('');
      setScreenshot(null);
      setNotes('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: (err: any) => {
      toast.error("Failed to record payment");
      console.error(err);
    }
  });

  const deletePaymentMutation = useMutation({
    mutationFn: feeService.delete,
    onSuccess: () => {
      toast.success("Payment Deleted & Reversed");
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: () => toast.error("Failed to delete payment")
  });

  // --- Handlers ---

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !activeStudentId) return;

    // Use FormData for file upload
    const formData = new FormData();
    formData.append('student', activeStudentId);
    formData.append('amount', amount);
    formData.append('payment_date', new Date().toISOString());
    formData.append('notes', notes);
    
    if (screenshot) {
      formData.append('screenshot', screenshot);
    }

    addPaymentMutation.mutate(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  const handleShareReminder = (student: Student) => {
    const due = Number(student.total_fees) - Number(student.fees_paid);
    const text = `Dear Parent, Reminder from ${user.institute_name}. Student: ${student.name}. Fees Due: ₹${due}. Please pay via UPI/Cash.`;
    window.open(`https://wa.me/${student.phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // --- Views ---

  const Overview = () => {
    const batchStats = batches.map(batch => {
      const batchStudents = students.filter(s => s.batch === batch.id);
      const total = batchStudents.reduce((acc, s) => acc + Number(s.total_fees || 0), 0);
      const collected = batchStudents.reduce((acc, s) => acc + Number(s.fees_paid || 0), 0);
      return { 
        ...batch, 
        total, 
        collected, 
        due: total - collected, 
        studentCount: batchStudents.length 
      };
    });

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
        <h2 className="text-2xl font-bold text-gray-800">Fee Overview by Class</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batchStats.map(stat => (
            <div 
              key={stat.id} 
              onClick={() => { setActiveBatchId(stat.id); setViewMode('batch_detail'); }} 
              className="bg-white p-5 rounded-xl border border-slate-200 cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-indigo-500 group"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg group-hover:text-indigo-600 transition-colors">{stat.name}</h3>
                <div className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold">{stat.studentCount} Students</div>
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
                <div className="w-full bg-gray-100 rounded-full h-2 mt-2 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-1000" 
                    style={{width: `${stat.total > 0 ? (stat.collected/stat.total)*100 : 0}%`}}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const BatchDetail = () => {
    const batch = batches.find(b => b.id === activeBatchId);
    const batchStudents = students.filter(s => s.batch === activeBatchId);

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setViewMode('overview')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{batch?.name}</h2>
            <p className="text-sm text-gray-500">Select a student to manage fees</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden overflow-x-auto shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
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
                const total = Number(s.total_fees);
                const paid = Number(s.fees_paid);
                const due = total - paid;
                
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium">
                      {s.name}
                      <div className="text-xs text-slate-400">{s.phone}</div>
                    </td>
                    <td className="p-4 text-slate-600">₹{total.toLocaleString()}</td>
                    <td className="p-4 text-green-600 font-medium">₹{paid.toLocaleString()}</td>
                    <td className="p-4">
                      {due > 0 ? (
                        <span className="text-red-500 font-bold bg-red-50 px-2 py-1 rounded text-xs">₹{due.toLocaleString()}</span>
                      ) : (
                        <span className="text-green-600 flex items-center gap-1 text-sm font-medium"><CheckCircle size={14}/> Paid</span>
                      )}
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      {due > 0 && (
                        <button 
                          onClick={() => handleShareReminder(s)} 
                          className="text-green-600 p-2 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                          title="Share Reminder on WhatsApp"
                        >
                          <Share2 size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => { setActiveStudentId(s.id); setViewMode('student_detail'); }} 
                        className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
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
    );
  };

  const StudentDetail = () => {
    const student = students.find(s => s.id === activeStudentId);
    // Sort fees by date descending
    const studentFees = fees
      .filter(f => f.student === activeStudentId)
      .sort((a,b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());
    
    if(!student) return null;
    
    const total = Number(student.total_fees);
    const paid = Number(student.fees_paid);
    const due = total - paid;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setViewMode('batch_detail')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{student.name}</h2>
              <p className="text-sm text-gray-500">Roll No: {student.roll || 'N/A'}</p>
            </div>
          </div>
          <button 
            onClick={() => setViewMode('invoice')} 
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Printer size={18} /> Print Statement
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Payment Form */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 h-fit shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-slate-800">Record New Payment</h3>
            
            {/* Summary Card */}
            <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-slate-500">Total Fees:</span>
                <span className="font-medium">₹{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-slate-500">Paid So Far:</span>
                <span className="font-medium text-green-600">₹{paid.toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between">
                <span className="font-bold text-slate-700">Remaining Due:</span>
                <span className={`font-bold ${due > 0 ? 'text-red-500' : 'text-green-500'}`}>₹{due.toLocaleString()}</span>
              </div>
            </div>
            
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Amount (₹)</label>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  required 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                  placeholder="e.g. 5000" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Notes (Optional)</label>
                <input 
                  type="text" 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                  placeholder="e.g. Cash / UPI Ref..." 
                />
              </div>
              
              {/* Screenshot / Camera Input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Payment Proof</label>
                <div 
                  onClick={() => fileInputRef.current?.click()} 
                  className={`
                    border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all
                    ${screenshot ? 'border-green-400 bg-green-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}
                  `}
                >
                  {screenshot ? (
                    <div className="text-center">
                      <CheckCircle className="w-8 h-8 text-green-500 mb-2 mx-auto" />
                      <p className="text-sm font-medium text-green-700 truncate max-w-[200px]">{screenshot.name}</p>
                      <p className="text-xs text-green-600 mt-1">Tap to change</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="flex justify-center gap-3 mb-2">
                        <Camera className="w-6 h-6 text-slate-400" />
                        <Upload className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-600 font-medium">Scan Receipt or Upload</p>
                      <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    capture="environment" 
                    className="hidden" 
                    onChange={handleFileChange} 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={addPaymentMutation.isPending || !amount} 
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-md hover:shadow-lg mt-2"
              >
                {addPaymentMutation.isPending ? 'Processing...' : 'Record Payment'}
              </button>
            </form>
          </div>

          {/* Right Column: History */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col">
            <h3 className="font-bold text-lg mb-4 text-slate-800">Transaction History</h3>
            <div className="overflow-y-auto flex-1 max-h-[500px] pr-2 scrollbar-thin scrollbar-thumb-slate-200">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold sticky top-0">
                  <tr>
                    <th className="p-3 rounded-tl-lg">Date</th>
                    <th className="p-3">Details</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Proof</th>
                    <th className="p-3 text-right rounded-tr-lg">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentFees.map(fee => (
                    <tr key={fee.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-3 text-sm text-slate-600">
                        {new Date(fee.payment_date).toLocaleDateString()}
                        <div className="text-xs text-slate-400">{new Date(fee.payment_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      </td>
                      <td className="p-3 text-sm text-slate-600">
                        {fee.notes || <span className="italic text-slate-400">No notes</span>}
                      </td>
                      <td className="p-3 font-bold text-green-600">+₹{Number(fee.amount).toLocaleString()}</td>
                      <td className="p-3">
                        {fee.screenshot ? (
                          <a 
                            href={fee.screenshot} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100 transition-colors"
                          >
                            <Eye size={12} /> View
                          </a>
                        ) : (
                          <span className="text-slate-300 text-xs">-</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button 
                          onClick={() => {
                            if(confirm("Are you sure you want to delete this payment? It will be reversed.")) {
                              deletePaymentMutation.mutate(fee.id);
                            }
                          }}
                          className="text-slate-300 hover:text-red-500 transition-colors p-1"
                          title="Delete Payment"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {studentFees.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 italic">No payment history found.</td>
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

  // Printable Invoice View
  if (viewMode === 'invoice') {
    const student = students.find(s => s.id === activeStudentId);
    if (!student) return null;

    return (
      <div className="fixed inset-0 bg-slate-900/50 z-50 overflow-y-auto flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-2xl min-h-[600px] p-8 shadow-2xl relative rounded-sm">
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-wide">{user.institute_name}</h1>
              <p className="text-slate-500 mt-1">Payment Statement</p>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm text-slate-500">Date: {new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Bill To</h3>
            <div className="text-xl font-bold text-slate-800">{student.name}</div>
            <div className="text-slate-600">Roll No: {student.roll || 'N/A'}</div>
            <div className="text-slate-600">{student.phone}</div>
          </div>

          <table className="w-full mb-8">
            <thead className="bg-slate-100 border-y border-slate-200">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-slate-700">Description</th>
                <th className="py-3 px-4 text-right font-semibold text-slate-700">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-4 px-4 border-b border-slate-100">Total Course Fee</td>
                <td className="py-4 px-4 text-right border-b border-slate-100">₹{Number(student.total_fees).toLocaleString()}</td>
              </tr>
              <tr>
                <td className="py-4 px-4 border-b border-slate-100 font-medium text-green-700">Less: Amount Paid</td>
                <td className="py-4 px-4 text-right border-b border-slate-100 text-green-700">- ₹{Number(student.fees_paid).toLocaleString()}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td className="py-4 px-4 font-bold text-lg text-slate-900">Total Due Amount</td>
                <td className="py-4 px-4 text-right font-bold text-lg text-red-600">₹{(Number(student.total_fees) - Number(student.fees_paid)).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          <div className="mt-12 text-center text-sm text-slate-400">
            <p>Thank you for being part of {user.institute_name}.</p>
            <p className="mt-1">This is a computer-generated receipt.</p>
          </div>

          {/* Print Controls */}
          <div className="absolute top-4 right-4 print:hidden flex gap-2">
            <button 
              onClick={() => window.print()} 
              className="bg-slate-800 text-white px-4 py-2 rounded shadow hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <Printer size={16} /> Print
            </button>
            <button 
              onClick={() => setViewMode('student_detail')} 
              className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded shadow hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default Return
  return (
    <>
      {viewMode === 'overview' && <Overview />}
      {viewMode === 'batch_detail' && <BatchDetail />}
      {viewMode === 'student_detail' && <StudentDetail />}
    </>
  );
};

export default FeesPage;