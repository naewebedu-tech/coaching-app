import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, Share2, Printer, CheckCircle, Camera, 
  Trash2, Eye, Edit2, Save, X, IndianRupee, 
  CalendarPlus, AlertCircle,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { feeService, studentService } from '../../services/api'; 
import type { DashboardData, Student, FeeRecord, Batch } from '../../hooks/useDashboardData';
import type { User } from '../../App';
import toast from 'react-hot-toast';

// --- Types ---
interface FeesPageProps {
  data: DashboardData;
  user: User;
}

// --- Helper Functions ---

const generateWhatsAppText = (student: Student, instituteName: string) => {
    const total = Number(student.total_fees);
    const paid = Number(student.fees_paid);
    const due = total - paid;
    const date = new Date().toLocaleDateString();

    return `🧾 *FEE STATEMENT*
--------------------------------
*${instituteName}*
Date: ${date}

Student: *${student.name}*
Roll No: ${student.roll || 'N/A'}

💰 *Course Fee:* ₹${total.toLocaleString()}
✅ *Paid Amount:* ₹${paid.toLocaleString()}
--------------------------------
🚨 *PENDING DUE: ₹${due.toLocaleString()}*
--------------------------------

Please clear the due amount at the earliest.
Thank you!`;
};

// --- Reusable Components ---

const InvoiceTemplate = ({ student, user }: { student: Student, user: User }) => {
    return (
        <div className="bg-white p-8 max-w-2xl mx-auto border border-slate-200 print:border-0 print:p-0 print:max-w-none h-full relative font-sans text-slate-900">
             {/* Header */}
             <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
                <div>
                    <h1 className="text-3xl font-bold uppercase tracking-wide">{user.institute_name}</h1>
                    <p className="text-slate-500 mt-1 font-medium">Fee Statement</p>
                </div>
                <div className="text-right">
                    <div className="font-mono text-sm text-slate-500">Date: {new Date().toLocaleDateString()}</div>
                    <div className="font-mono text-sm text-slate-500 mt-1">Receipt #: {Math.floor(Math.random() * 100000)}</div>
                </div>
            </div>

            {/* Student Info */}
            <div className="mb-8 p-6 bg-slate-50 rounded-lg border border-slate-100 print:bg-transparent print:border-slate-300">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Bill To</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-2xl font-bold text-slate-800">{student.name}</div>
                        <div className="text-slate-600 font-medium mt-1">Roll No: {student.roll || 'N/A'}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-slate-600">{student.phone}</div>
                        <div className="text-slate-500 text-sm mt-1">{student.address || ''}</div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <table className="w-full mb-8 border-collapse">
                <thead className="bg-slate-100 border-y border-slate-200 print:bg-slate-100">
                    <tr>
                        <th className="py-3 px-4 text-left font-bold text-slate-700">Description</th>
                        <th className="py-3 px-4 text-right font-bold text-slate-700">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="py-4 px-4 border-b border-slate-100">Total Course Fee</td>
                        <td className="py-4 px-4 text-right border-b border-slate-100 font-medium">₹{Number(student.total_fees).toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td className="py-4 px-4 border-b border-slate-100 font-medium text-green-700">Less: Amount Paid</td>
                        <td className="py-4 px-4 text-right border-b border-slate-100 text-green-700 font-medium">- ₹{Number(student.fees_paid).toLocaleString()}</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr className="bg-slate-50 print:bg-transparent">
                        <td className="py-4 px-4 font-bold text-xl text-slate-900 border-t border-slate-200">Total Due Amount</td>
                        <td className="py-4 px-4 text-right font-bold text-xl text-red-600 border-t border-slate-200">₹{(Number(student.total_fees) - Number(student.fees_paid)).toLocaleString()}</td>
                    </tr>
                </tfoot>
            </table>

            {/* Footer */}
            <div className="mt-auto pt-8 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500">Thank you for being a part of <span className="font-semibold">{user.institute_name}</span>.</p>
                <p className="text-xs text-slate-400 mt-2">This is a computer-generated invoice and does not require a signature.</p>
            </div>
        </div>
    );
};

// --- Add Fee Modal (Mobile Optimized) ---
const AddFeeModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    isBatch = false,
    count = 1
}: { 
    isOpen: boolean, 
    onClose: () => void, 
    onConfirm: (amount: string, month: string) => void,
    isBatch?: boolean,
    count?: number
}) => {
    const [amount, setAmount] = useState('');
    const [month, setMonth] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(amount, month);
        setAmount('');
        setMonth('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center sm:p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            {/* Modal Content */}
            <div className="bg-white w-full md:w-full max-w-md md:rounded-xl rounded-t-2xl shadow-2xl relative z-10 animate-in slide-in-from-bottom duration-300">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <CalendarPlus className="text-indigo-600" />
                            {isBatch ? `Batch Fee (${count} Students)` : 'Add Monthly Fee'}
                        </h3>
                        <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500"><X size={20} /></button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Fee Amount (₹)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <input 
                                    type="number" 
                                    required
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-medium"
                                    placeholder="500"
                                />
                            </div>
                            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1 bg-amber-50 p-2 rounded-lg">
                                <AlertCircle size={14} /> Amount will be added to pending dues.
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Month / Description</label>
                            <input 
                                type="text" 
                                required
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="e.g. October Fee"
                            />
                        </div>
                        
                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={onClose} className="flex-1 py-3 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                            <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95 transition-transform">
                                {isBatch ? 'Apply All' : 'Add Fee'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};


// --- Views ---

const OverviewView = ({ 
  batches, 
  students, 
  onSelectBatch 
}: { 
  batches: Batch[], 
  students: Student[], 
  onSelectBatch: (id: string) => void 
}) => {
  const batchStats = useMemo(() => batches.map(batch => {
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
  }), [batches, students]);

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      <div className="flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-20 py-3 md:static border-b md:border-none px-4 md:px-0 -mx-4 md:mx-0">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Fee Dashboard</h2>
        <div className="text-xs md:text-sm text-slate-500 font-medium">
          Total: <span className="text-green-600 font-bold">₹{batchStats.reduce((acc, b) => acc + b.collected, 0).toLocaleString()}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4 md:px-0">
        {batchStats.map(stat => (
          <div 
            key={stat.id} 
            onClick={() => onSelectBatch(stat.id)} 
            className="bg-white p-5 rounded-xl border border-slate-200 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all border-l-4 border-l-indigo-500 group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4 relative z-10">
              <h3 className="font-bold text-lg group-hover:text-indigo-600 transition-colors">{stat.name}</h3>
              <div className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold">{stat.studentCount} Students</div>
            </div>
            <div className="space-y-3 relative z-10">
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

const BatchDetailView = ({ 
  batchId, 
  batches, 
  students, 
  onBack, 
  onSelectStudent,
  onPrintBatch,
  queryClient,
  user
}: { 
  batchId: string, 
  batches: Batch[], 
  students: Student[], 
  onBack: () => void, 
  onSelectStudent: (id: string) => void,
  onPrintBatch: () => void,
  queryClient: any,
  user: User
}) => {
  const batch = batches.find(b => b.id === batchId);
  const batchStudents = students.filter(s => s.batch === batchId);
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);

  // Batch Fee Mutation
  const batchFeeMutation = useMutation({
      mutationFn: async ({ amount, note }: { amount: string, note: string }) => {
          const promises = batchStudents.map(student => {
              const formData = new FormData();
              formData.append('student', student.id);
              formData.append('amount', `-${amount}`); 
              formData.append('payment_date', new Date().toISOString());
              formData.append('notes', `Monthly Fee: ${note}`);
              return feeService.create(formData);
          });
          return Promise.all(promises);
      },
      onSuccess: () => {
          toast.success("Fees added to all students!");
          queryClient.invalidateQueries({ queryKey: ['fees'] });
          queryClient.invalidateQueries({ queryKey: ['students'] });
          setIsFeeModalOpen(false);
      },
      onError: () => toast.error("Failed to add batch fees")
  });

  const handleWhatsApp = (student: Student) => {
    const text = generateWhatsAppText(student, user.institute_name);
    window.open(`https://wa.me/${student.phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <>
    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-right-4 pb-20 md:pb-0">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 -mx-4 px-4 py-3 md:static md:border-none md:bg-transparent md:p-0 md:mx-0 shadow-sm md:shadow-none">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors border border-slate-200 md:border-transparent">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-none">{batch?.name}</h2>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">{batchStudents.length} Students</p>
                </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                <button 
                    onClick={() => setIsFeeModalOpen(true)}
                    className="flex-shrink-0 flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-2 rounded-lg text-xs md:text-sm font-bold border border-amber-100 active:scale-95 transition-transform"
                >
                    <CalendarPlus size={16} /> Add Batch Fee
                </button>
                <button 
                    onClick={onPrintBatch}
                    className="flex-shrink-0 flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg text-xs md:text-sm font-bold border border-indigo-100 active:scale-95 transition-transform"
                >
                    <Printer size={16} /> Print All
                </button>
            </div>
          </div>
      </div>
      
      {/* Mobile Card List (Hidden on Desktop) */}
      <div className="md:hidden space-y-3 px-4 md:px-0">
         {batchStudents.map(s => {
             const total = Number(s.total_fees);
             const paid = Number(s.fees_paid);
             const due = total - paid;
             return (
                 <div key={s.id} onClick={() => onSelectStudent(s.id)} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm active:bg-slate-50 transition-colors relative overflow-hidden">
                     <div className="flex justify-between items-start mb-2">
                        <div>
                            <div className="font-bold text-slate-800">{s.name}</div>
                            <div className="text-xs text-slate-500">Roll: {s.roll || 'N/A'} • {s.phone}</div>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleWhatsApp(s); }}
                            className="p-2 bg-green-50 text-green-600 rounded-full"
                        >
                            <Share2 size={18} />
                        </button>
                     </div>
                     <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                        <div className="text-xs font-semibold text-slate-400">DUE AMOUNT</div>
                        <div className={`text-lg font-bold ${due > 0 ? 'text-red-500' : 'text-green-500'}`}>
                             ₹{due.toLocaleString()}
                        </div>
                     </div>
                 </div>
             )
         })}
      </div>

      {/* Desktop Table (Hidden on Mobile) */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-600">Student</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Total Fee</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Paid</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
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
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{s.name}</div>
                      <div className="text-xs text-slate-400">{s.phone}</div>
                    </td>
                    <td className="p-4 text-slate-600">₹{total.toLocaleString()}</td>
                    <td className="p-4 text-green-600 font-medium">₹{paid.toLocaleString()}</td>
                    <td className="p-4">
                      {due > 0 ? (
                        <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold border border-red-100">
                          Due: ₹{due.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-green-600 flex items-center gap-1 text-sm font-medium">
                          <CheckCircle size={14}/> Paid
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                        <button 
                          onClick={() => handleWhatsApp(s)} 
                          className="text-green-600 p-2 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                          title="WhatsApp"
                        >
                          <Share2 size={16} />
                        </button>
                        <button 
                            onClick={() => onSelectStudent(s.id)} 
                            className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors border border-indigo-100"
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
    
    <AddFeeModal 
        isOpen={isFeeModalOpen}
        onClose={() => setIsFeeModalOpen(false)}
        isBatch={true}
        count={batchStudents.length}
        onConfirm={(amount, month) => {
            if(confirm(`Are you sure you want to add ₹${amount} fee to all ${batchStudents.length} students?`)) {
                batchFeeMutation.mutate({ amount, note: month });
            }
        }}
    />
    </>
  );
};

const StudentDetailView = ({ 
  studentId, 
  students, 
  fees, 
  onBack, 
  onPrint,
  queryClient,
  user
}: { 
  studentId: string, 
  students: Student[], 
  fees: FeeRecord[], 
  onBack: () => void, 
  onPrint: () => void,
  queryClient: any,
  user: User
}) => {
  const student = students.find(s => s.id === studentId);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [newTotalFee, setNewTotalFee] = useState('');
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const studentFees = useMemo(() => 
    fees
      .filter(f => f.student === studentId)
      .sort((a,b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()),
  [fees, studentId]);

  if (!student) return null;

  const total = Number(student.total_fees);
  const paid = Number(student.fees_paid);
  const due = total - paid;

  // Mutations
  const addPaymentMutation = useMutation({
    mutationFn: feeService.create,
    onSuccess: () => {
      toast.success("Transaction Recorded");
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setAmount('');
      setScreenshot(null);
      setNotes('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: () => toast.error("Failed to record transaction")
  });

  const deletePaymentMutation = useMutation({
    mutationFn: feeService.delete,
    onSuccess: () => {
      toast.success("Transaction Deleted");
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: () => toast.error("Failed to delete")
  });

  const updateFeeMutation = useMutation({
    mutationFn: async (data: any) => {
        return studentService.update(studentId, data);
    },
    onSuccess: () => {
        toast.success("Total Fee Updated");
        queryClient.invalidateQueries({ queryKey: ['students'] });
        setIsEditingTotal(false);
    },
    onError: () => toast.error("Update failed")
  });

  // Handle Standard Payment
  const handleAddPayment = (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    if (!amount) return;
    const formData = new FormData();
    formData.append('student', studentId);
    formData.append('amount', amount);
    formData.append('payment_date', new Date().toISOString());
    formData.append('notes', notes);
    if (screenshot) formData.append('screenshot', screenshot);
    addPaymentMutation.mutate(formData);
  };

  const handleAddMonthlyFee = (feeAmount: string, feeMonth: string) => {
      const formData = new FormData();
      formData.append('student', studentId);
      formData.append('amount', `-${feeAmount}`); // Negative Value
      formData.append('payment_date', new Date().toISOString());
      formData.append('notes', `Monthly Fee: ${feeMonth}`);
      addPaymentMutation.mutate(formData);
  };

  const handleWhatsApp = () => {
      const text = generateWhatsAppText(student, user.institute_name);
      window.open(`https://wa.me/${student.phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleUpdateTotal = () => {
      if(!newTotalFee) return;
      updateFeeMutation.mutate({ total_fees: newTotalFee });
  }
  
  const setQuickAmount = (val: number) => {
    const finalVal = val === -1 ? due : val;
    setAmount(finalVal > 0 ? finalVal.toString() : '');
  };

  return (
    <>
    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-right-4 pb-24 md:pb-0">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 -mx-4 px-4 py-3 md:static md:border-none md:bg-transparent md:p-0 md:mx-0 shadow-sm md:shadow-none">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors border border-slate-200 md:border-transparent">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-800 leading-none">{student.name}</h2>
                    <p className="text-xs text-slate-500 mt-1">Roll: {student.roll || 'N/A'}</p>
                </div>
                {/* Mobile Quick Actions in Header */}
                <div className="flex md:hidden gap-2">
                    <button onClick={handleWhatsApp} className="p-2 bg-green-50 text-green-600 rounded-full border border-green-100">
                        <Share2 size={18} />
                    </button>
                    <button onClick={onPrint} className="p-2 bg-slate-50 text-slate-600 rounded-full border border-slate-100">
                        <Printer size={18} />
                    </button>
                </div>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden md:flex gap-2 flex-wrap">
                <button 
                    onClick={() => setIsFeeModalOpen(true)}
                    className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-amber-200 transition-colors font-bold text-sm"
                >
                    <CalendarPlus size={16} /> Add Monthly Fee
                </button>
                <button 
                    onClick={handleWhatsApp}
                    className="bg-green-100 text-green-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-200 transition-colors font-medium text-sm"
                >
                    <Share2 size={16} /> WhatsApp
                </button>
                <button 
                    onClick={onPrint} 
                    className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm font-medium text-sm"
                >
                    <Printer size={16} /> Statement
                </button>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 md:px-0">
        
        {/* Left Column: Payment Form */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-slate-200 shadow-sm lg:sticky lg:top-4">
          
          {/* Fee Stats with Edit Capability */}
          <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100 relative">
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-slate-500">Course Fee:</span>
              <div className="flex items-center gap-2">
                 {isEditingTotal ? (
                     <div className="flex items-center gap-1 absolute right-2 bg-white p-1 shadow-lg border rounded z-10">
                         <input 
                            autoFocus
                            type="number" 
                            className="w-24 px-2 py-1 text-right border rounded text-sm outline-none focus:ring-1 ring-indigo-500"
                            value={newTotalFee}
                            onChange={(e) => setNewTotalFee(e.target.value)}
                            placeholder={total.toString()}
                         />
                         <button onClick={handleUpdateTotal} className="text-white bg-green-500 hover:bg-green-600 p-1 rounded"><Save size={16}/></button>
                         <button onClick={() => setIsEditingTotal(false)} className="text-white bg-red-500 hover:bg-red-600 p-1 rounded"><X size={16}/></button>
                     </div>
                 ) : (
                    <>
                        <span className="font-bold text-slate-800">₹{total.toLocaleString()}</span>
                        <button onClick={() => { setNewTotalFee(total.toString()); setIsEditingTotal(true); }} className="text-slate-400 hover:text-indigo-600 p-1"><Edit2 size={12}/></button>
                    </>
                 )}
              </div>
            </div>
            <div className="flex justify-between mb-3 text-sm">
              <span className="text-slate-500">Paid:</span>
              <span className="font-medium text-green-600">₹{paid.toLocaleString()}</span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
              <span className="font-bold text-slate-700">Due:</span>
              <span className={`text-lg font-bold ${due > 0 ? 'text-red-500' : 'text-green-500'}`}>₹{due.toLocaleString()}</span>
            </div>
            
            {/* Mobile Only: Add Monthly Fee Button inside card */}
            <div className="md:hidden mt-4 pt-4 border-t border-dashed border-slate-200">
                <button 
                    onClick={() => setIsFeeModalOpen(true)}
                    className="w-full py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-bold border border-amber-100 flex items-center justify-center gap-2"
                >
                    <CalendarPlus size={14} /> Add Monthly Fee
                </button>
            </div>
          </div>
          
          <h3 className="font-bold text-md mb-4 text-slate-800 flex items-center gap-2">
              <IndianRupee size={18} /> Record Payment
          </h3>
          
          <div className="space-y-4">
             {/* Quick Amounts - Scrollable on mobile */}
             <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                {[500, 1000, 2000].map(amt => (
                    <button 
                        key={amt}
                        type="button" 
                        onClick={() => setQuickAmount(amt)}
                        className="flex-shrink-0 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-lg transition-colors font-medium border border-slate-200"
                    >
                        +{amt}
                    </button>
                ))}
                {due > 0 && (
                    <button 
                        type="button" 
                        onClick={() => setQuickAmount(-1)}
                        className="flex-shrink-0 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-2 rounded-lg transition-colors font-medium border border-indigo-100"
                    >
                        Full Due
                    </button>
                )}
             </div>

            <div className="flex gap-3">
              <div className="flex-1">
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)} 
                    className="w-full px-4 py-3 text-lg font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:font-normal" 
                    placeholder="₹ Amount" 
                  />
              </div>
              <div className="w-1/3">
                 <div 
                  onClick={() => fileInputRef.current?.click()} 
                  className={`h-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${screenshot ? 'border-green-500 bg-green-50' : 'border-slate-300'}`}
                 >
                    {screenshot ? <CheckCircle size={20} className="text-green-600"/> : <Camera size={20} className="text-slate-400"/>}
                    <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setScreenshot(e.target.files[0])} />
                 </div>
              </div>
            </div>

            <div>
              <input 
                type="text" 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" 
                placeholder="Note (e.g. UPI Ref)" 
              />
            </div>

            <button 
              onClick={handleAddPayment}
              disabled={addPaymentMutation.isPending || !amount} 
              className="hidden md:block w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-indigo-200"
            >
              {addPaymentMutation.isPending ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-2 bg-white rounded-xl p-4 md:p-6 border border-slate-200 shadow-sm flex flex-col h-full min-h-[400px]">
          <h3 className="font-bold text-lg mb-4 text-slate-800">History</h3>
          <div className="overflow-y-auto flex-1 pr-0 md:pr-2 scrollbar-thin scrollbar-thumb-slate-200">
            {/* Mobile History: Card View */}
            <div className="md:hidden space-y-3">
                {studentFees.map(fee => {
                    const isFeeAddition = Number(fee.amount) < 0;
                    return (
                        <div key={fee.id} className="border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-bold text-slate-800 text-sm">
                                        {new Date(fee.payment_date).toLocaleDateString()}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        {new Date(fee.payment_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </div>
                                <div className={`font-bold ${isFeeAddition ? 'text-amber-600' : 'text-green-600'}`}>
                                    {isFeeAddition ? '-' : '+'}₹{Math.abs(Number(fee.amount)).toLocaleString()}
                                </div>
                            </div>
                            <div className="mt-2 text-xs text-slate-500 truncate">{fee.notes || 'No notes'}</div>
                            <div className="mt-2 flex justify-end gap-3 pt-2 border-t border-slate-200/50">
                                {fee.screenshot && (
                                    <a href={fee.screenshot} target="_blank" className="text-indigo-600 text-xs font-bold flex items-center gap-1"><Eye size={12}/> View Proof</a>
                                )}
                                <button 
                                    onClick={() => { if(confirm("Delete?")) deletePaymentMutation.mutate(fee.id); }}
                                    className="text-red-500 text-xs font-bold flex items-center gap-1"
                                >
                                    <Trash2 size={12}/> Delete
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Desktop History: Table View */}
            <table className="hidden md:table w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold sticky top-0 z-10">
                <tr>
                  <th className="p-3 rounded-tl-lg">Date</th>
                  <th className="p-3">Note</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-center">Proof</th>
                  <th className="p-3 text-center rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentFees.map(fee => {
                    const isFeeAddition = Number(fee.amount) < 0;
                    return (
                      <tr key={fee.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="p-3 text-sm text-slate-600">
                          <div className="font-medium text-slate-800">{new Date(fee.payment_date).toLocaleDateString()}</div>
                          <div className="text-[10px] text-slate-400">{new Date(fee.payment_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </td>
                        <td className="p-3 text-sm text-slate-600 max-w-[150px] truncate">
                          {fee.notes || '-'}
                        </td>
                        <td className={`p-3 font-bold text-right ${isFeeAddition ? 'text-amber-600' : 'text-green-600'}`}>
                           {isFeeAddition ? `Fee Added: ₹${Math.abs(Number(fee.amount)).toLocaleString()}` : `+₹${Number(fee.amount).toLocaleString()}`}
                        </td>
                        <td className="p-3 text-center">
                          {fee.screenshot ? (
                            <a 
                              href={fee.screenshot} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                            >
                              <Eye size={16} />
                            </a>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <button 
                            onClick={() => {
                              if(confirm("Delete this transaction? It will be removed from totals.")) {
                                deletePaymentMutation.mutate(fee.id);
                              }
                            }}
                            className="text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                })}
              </tbody>
            </table>
            
            {studentFees.length === 0 && (
                 <div className="py-10 text-center text-slate-400 text-sm">No history found</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Sticky Bottom Bar (Confirm Payment) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40">
          <button 
             onClick={handleAddPayment}
             disabled={addPaymentMutation.isPending || !amount} 
             className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-lg active:scale-95 transition-transform flex justify-center items-center gap-2 shadow-lg disabled:opacity-50"
          >
             {addPaymentMutation.isPending ? 'Processing...' : `Confirm ₹${amount || '0'}`}
          </button>
      </div>

    </div>
    
    <AddFeeModal 
        isOpen={isFeeModalOpen}
        onClose={() => setIsFeeModalOpen(false)}
        onConfirm={handleAddMonthlyFee}
    />
    </>
  );
};

const BatchInvoiceView = ({ 
    batchId,
    students,
    user, 
    onClose 
}: { 
    batchId: string,
    students: Student[], 
    user: User, 
    onClose: () => void 
}) => {
    const batchStudents = students.filter(s => s.batch === batchId);

    // Auto-trigger print
    useEffect(() => {
        const timer = setTimeout(() => {
            window.print();
        }, 800); 
        return () => clearTimeout(timer);
    }, []);

    return (
      <div className="fixed inset-0 bg-slate-100 z-[9999] overflow-auto flex flex-col items-center">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="w-full bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md print:hidden">
            <div>
                <h2 className="font-bold text-lg">Batch Print Mode</h2>
                <p className="text-sm text-slate-400">Generated {batchStudents.length} Invoices ready for printing.</p>
            </div>
            <div className="flex gap-3">
                <button onClick={() => window.print()} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                    <Printer size={18} /> Print / Save PDF
                </button>
                <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-bold">
                    Close
                </button>
            </div>
        </div>

        {/* The Printable Content */}
        <div className="w-full print:w-full print:absolute print:top-0 print:left-0">
            {batchStudents.map((student, _index) => (
                <div key={student.id} className="invoice-page bg-white shadow-sm max-w-[210mm] mx-auto my-8 print:my-0 print:shadow-none print:max-w-none print:mx-0">
                    <div className="p-10 min-h-[297mm] print:min-h-[100vh] flex flex-col border border-slate-200 print:border-0">
                        <InvoiceTemplate student={student} user={user} />
                    </div>
                    {/* Visual Divider for Web View */}
                    <div className="h-4 bg-slate-100 border-b border-dashed border-slate-300 print:hidden relative mb-8">
                         <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-100 px-2 text-xs text-slate-400">Next Student</span>
                    </div>
                </div>
            ))}
        </div>

        {/* Global Print Styles */}
        <style>{`
            @media print {
                body * { visibility: hidden; }
                .fixed.inset-0.z-\\[9999\\] { position: absolute; left: 0; top: 0; width: 100%; height: auto; visibility: visible; overflow: visible !important; background: white; }
                .fixed.inset-0.z-\\[9999\\] * { visibility: visible; }
                .invoice-page { 
                    break-after: page; 
                    page-break-after: always; 
                    height: 100vh;
                    width: 100%;
                }
                .print\\:hidden { display: none !important; }
                @page { margin: 0; size: auto; }
            }
        `}</style>
      </div>
    );
};

const InvoiceView = ({ 
    student, 
    user, 
    onClose 
}: { 
    student: Student, 
    user: User, 
    onClose: () => void 
}) => {
    if (!student) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/60 z-[9999] overflow-y-auto flex items-center justify-center p-4 backdrop-blur-sm print:p-0 print:bg-white">
        <div className="bg-white w-full max-w-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 print:shadow-none print:w-full print:max-w-none">
          <div className="p-8 print:p-0">
              <InvoiceTemplate student={student} user={user} />
          </div>

          <div className="absolute top-4 right-4 print:hidden flex gap-2">
            <button 
              onClick={() => window.print()} 
              className="bg-slate-800 text-white px-4 py-2 rounded shadow hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <Printer size={16} /> Print
            </button>
            <button 
              onClick={onClose} 
              className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded shadow hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
};

// --- 4. Main Page Component ---

const FeesPage = ({ data, user }: FeesPageProps) => {
  const { students, batches, fees } = data;
  const [viewMode, setViewMode] = useState<'overview' | 'batch_detail' | 'student_detail' | 'invoice' | 'batch_invoice'>('overview');
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleBatchSelect = (id: string) => {
    setActiveBatchId(id);
    setViewMode('batch_detail');
  };

  const handleStudentSelect = (id: string) => {
    setActiveStudentId(id);
    setViewMode('student_detail');
  };

  return (
    <div className="max-w-7xl mx-auto">
      {viewMode === 'overview' && (
        <OverviewView 
          batches={batches} 
          students={students} 
          onSelectBatch={handleBatchSelect} 
        />
      )}

      {viewMode === 'batch_detail' && activeBatchId && (
        <BatchDetailView 
          batchId={activeBatchId}
          batches={batches}
          students={students}
          user={user}
          onBack={() => setViewMode('overview')}
          onSelectStudent={handleStudentSelect}
          onPrintBatch={() => setViewMode('batch_invoice')}
          queryClient={queryClient}
        />
      )}

      {viewMode === 'student_detail' && activeStudentId && (
        <StudentDetailView 
          studentId={activeStudentId}
          students={students}
          fees={fees}
          onBack={() => setViewMode('batch_detail')}
          onPrint={() => setViewMode('invoice')}
          queryClient={queryClient}
          user={user}
        />
      )}

      {/* Individual Invoice Modal */}
      {viewMode === 'invoice' && activeStudentId && (
        <InvoiceView 
            student={students.find(s => s.id === activeStudentId)!}
            user={user}
            onClose={() => setViewMode('student_detail')}
        />
      )}

      {/* Batch Print View */}
      {viewMode === 'batch_invoice' && activeBatchId && (
        <BatchInvoiceView 
            batchId={activeBatchId}
            students={students}
            user={user}
            onClose={() => setViewMode('batch_detail')}
        />
      )}
    </div>
  );
};

export default FeesPage;