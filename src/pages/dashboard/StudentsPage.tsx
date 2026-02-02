import { useState, type FormEvent, type ChangeEvent, useRef } from 'react';
import { Search, UserPlus, Trash2, CheckCircle, AlertCircle, Loader2, Upload, FileSpreadsheet, X, Image as ImageIcon, Save, ArrowRight } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../../services/api';
import type { DashboardData } from '../../hooks/useDashboardData';
import toast from 'react-hot-toast';

interface StudentsPageProps {
  data: DashboardData;
}

const StudentsPage = ({ data }: StudentsPageProps) => {
  const { students, batches } = data;
  
  // Local State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<'single' | 'bulk'>('single');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    roll: '',
    batch: '',
    total_fees: '',
    image: null as File | null
  });
  
  // Image Preview State
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // --- Helpers ---

  // Completely close and clean up
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', phone: '', roll: '', batch: '', total_fees: '', image: null });
    setImagePreview(null);
    setUploadMode('single');
  };

  // --- Mutations ---

  // 1. Single Student Creation (Smart Workflow)
  const createMutation = useMutation({
    mutationFn: (data: FormData) => studentService.create(data),
    onSuccess: () => {
      toast.success("Student Saved! Ready for next.");
      queryClient.invalidateQueries({ queryKey: ['students'] });

      // SMART RESET LOGIC:
      // 1. Calculate Next Roll Number
      let nextRoll = '';
      if (formData.roll && !isNaN(Number(formData.roll))) {
        nextRoll = String(Number(formData.roll) + 1);
      }

      // 2. Prepare Form for Next Entry (Keep Batch & Fees, Clear Name/Phone, Increment Roll)
      setFormData(prev => ({
        ...prev,
        name: '',
        phone: '',
        roll: nextRoll,       // Auto-incremented
        image: null,
        batch: prev.batch,    // Keep the same batch
        total_fees: prev.total_fees // Keep the same fees
      }));
      
      setImagePreview(null);
      // We do NOT close the modal here, allowing continuous entry
    },
    onError: (err: any) => {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add student");
    }
  });

  // 2. Bulk Creation
  const bulkCreateMutation = useMutation({
    mutationFn: async (studentsData: any[]) => {
      let successCount = 0;
      let errors = 0;
      for (const student of studentsData) {
        try {
          await studentService.create(student);
          successCount++;
        } catch (err) {
          console.error("Failed to add:", student.name, err);
          errors++;
        }
      }
      return { successCount, errors };
    },
    onSuccess: (data) => {
      if (data.errors > 0) {
        toast(`${data.successCount} added, ${data.errors} failed.`, { icon: '⚠️' });
      } else {
        toast.success(`All ${data.successCount} students added successfully!`);
      }
      handleCloseModal(); // Close modal on bulk finish
    },
    onError: () => toast.error("Bulk upload process failed")
  });

  const deleteMutation = useMutation({
    mutationFn: studentService.delete,
    onSuccess: () => {
      toast.success("Student Deleted");
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: () => toast.error("Failed to delete student")
  });

  // --- Handlers ---

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSingleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.batch) {
      toast.error("Please select a batch");
      return;
    }
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('phone', formData.phone);
    data.append('roll', formData.roll);
    data.append('batch', formData.batch);
    data.append('total_fees', formData.total_fees);
    if (formData.image) {
      data.append('profile_pic', formData.image);
    }

    createMutation.mutate(data);
  };

  const handleBulkUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
      toast.error("Please upload a valid CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = async ({ target }) => {
      const csv = target?.result;
      if (typeof csv === 'string') {
        const lines = csv.split("\n");
        const result: any[] = [];
        const headers = lines[0].split(",").map(h => h.trim().toLowerCase());

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const obj: any = {};
          const currentline = lines[i].split(",");
          for (let j = 0; j < headers.length; j++) {
            const header = headers[j] === 'batch_id' ? 'batch' : headers[j];
            obj[header] = currentline[j]?.trim();
          }
          if (obj.name && obj.phone) result.push(obj);
        }
        
        if (result.length > 0) {
            bulkCreateMutation.mutate(result);
        } else {
            toast.error("CSV file is empty or invalid");
        }
      }
    };
    reader.readAsText(file);
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.phone.includes(searchTerm) || 
                          (s.roll && s.roll.includes(searchTerm));
    const matchesBatch = selectedBatch === 'all' || s.batch === selectedBatch;
    return matchesSearch && matchesBatch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Student Directory</h2>
          <p className="text-sm text-gray-500">{students.length} Total Students</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" /> Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, roll no, or phone..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>
        <select 
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white min-w-[200px]" 
          value={selectedBatch} 
          onChange={e => setSelectedBatch(e.target.value)}
        >
          <option value="all">All Batches</option>
          {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-0 animate-in zoom-in-95 duration-200 overflow-hidden">
            
            {/* Modal Header & Tabs */}
            <div className="bg-slate-50 border-b border-slate-200 p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">Add New Student</h3>
                <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                </button>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setUploadMode('single')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${uploadMode === 'single' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  Single Entry
                </button>
                <button 
                  onClick={() => setUploadMode('bulk')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${uploadMode === 'bulk' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  Bulk Upload (CSV)
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {uploadMode === 'single' ? (
                <form onSubmit={handleSingleSubmit} className="space-y-4">
                  
                  {/* Image Upload Area */}
                  <div className="flex justify-center mb-6">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden ${imagePreview ? 'border-indigo-500' : 'border-slate-300 bg-slate-50'}`}>
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-slate-400" />
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </div>
                    {/* Tiny tip for user */}
                    <div className="absolute right-10 top-40 text-xs text-slate-400 w-24">
                        Click circle to upload photo
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input 
                      required 
                      autoFocus // Auto focus for faster entry
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                      placeholder="e.g. Rahul Kumar"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Roll No (Auto)</label>
                      <input 
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50" 
                        placeholder="e.g. 101"
                        value={formData.roll}
                        onChange={e => setFormData({...formData, roll: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                      <input 
                        type="tel" 
                        required 
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                        placeholder="10 digits"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Assign Batch</label>
                    <select 
                      required 
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                      value={formData.batch}
                      onChange={e => setFormData({...formData, batch: e.target.value})}
                    >
                      <option value="">Select a batch</option>
                      {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Total Course Fee (₹)</label>
                    <input 
                      type="number" 
                      required 
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                      placeholder="e.g. 15000"
                      value={formData.total_fees}
                      onChange={e => setFormData({...formData, total_fees: e.target.value})}
                    />
                  </div>
                  
                  {/* Updated Footer Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button" 
                      onClick={handleCloseModal} 
                      className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      No More
                    </button>
                    <button 
                      type="submit" 
                      disabled={createMutation.isPending}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center justify-center gap-2 shadow-sm"
                    >
                      {createMutation.isPending ? (
                        <Loader2 className="animate-spin w-4 h-4"/>
                      ) : (
                        <>
                          <Save size={18} /> Save & Add Next <ArrowRight size={16} className="opacity-70"/>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                // BULK UPLOAD UI
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                    <FileSpreadsheet size={32} />
                  </div>
                  <h4 className="text-lg font-medium text-slate-900 mb-2">Upload CSV File</h4>
                  <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
                    CSV Columns: <br/>
                    <span className="font-mono text-xs bg-slate-100 p-1 rounded">name, phone, roll, batch_id, total_fees</span>
                  </p>
                  
                  <input 
                    type="file" 
                    accept=".csv"
                    className="hidden" 
                    id="csvUpload"
                    onChange={handleBulkUpload}
                  />
                  <label 
                    htmlFor="csvUpload"
                    className={`inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium cursor-pointer transition-colors ${bulkCreateMutation.isPending ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                     {bulkCreateMutation.isPending ? (
                        <><Loader2 className="animate-spin w-4 h-4"/> Processing...</>
                     ) : (
                        <><Upload size={20} /> Select File</>
                     )}
                  </label>
                  <button 
                    onClick={handleCloseModal}
                    className="block w-full mt-4 text-sm text-slate-400 hover:text-slate-600 underline"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Student List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
            <tr>
              <th className="px-6 py-4">Student Name</th>
              <th className="px-6 py-4">Batch</th>
              <th className="px-6 py-4">Fee Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.map(student => {
              const total = Number(student.total_fees);
              const paid = Number(student.fees_paid);
              const isPaid = paid >= total && total > 0;
              const due = total - paid;

              return (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {student.profile_pic ? (
                         <img 
                           src={`https://capi.coachingapp.in${student.profile_pic}`} 
                           alt={student.name} 
                           className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
                         />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm border border-indigo-200">
                          {student.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900">{student.name}</p>
                        <p className="text-xs text-slate-500">{student.phone} • Roll: {student.roll || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                      {student.batch_name || 'Unassigned'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        <CheckCircle size={12} /> Fully Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                        <AlertCircle size={12} /> Due: ₹{due.toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {
                        if (confirm(`Delete ${student.name}? This cannot be undone.`)) {
                          deleteMutation.mutate(student.id);
                        }
                      }}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Delete Student"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
            
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                      <Search size={24} />
                    </div>
                    <p>No students found matching your criteria.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsPage;