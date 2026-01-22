import React, { useState } from 'react';
import { Plus, Clock, Users, Trash2, BookOpen, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { batchService } from '../../services/api';
import type { DashboardData } from '../../hooks/useDashboardData';
import toast from 'react-hot-toast';

interface BatchesPageProps {
  data: DashboardData;
}

const BatchesPage = ({ data }: BatchesPageProps) => {
  const { batches, students } = data;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', timing: '' });

  const queryClient = useQueryClient();

  // --- Create Mutation ---
  const createMutation = useMutation({
    mutationFn: batchService.create,
    onSuccess: () => {
      toast.success("Batch Created Successfully");
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      setIsModalOpen(false);
      setFormData({ name: '', timing: '' });
    },
    onError: (err: any) => {
      console.error(err);
      toast.error("Failed to create batch");
    }
  });

  // --- Delete Mutation ---
  const deleteMutation = useMutation({
    mutationFn: batchService.delete,
    onSuccess: () => {
      toast.success("Batch Deleted Successfully");
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
    onError: (err: any) => {
      console.error(err);
      toast.error("Failed to delete batch. Ensure it has no students.");
    }
  });

  const handleDelete = (id: string, name: string, studentCount: number) => {
    if (studentCount > 0) {
      toast.error(`Cannot delete "${name}" because it has ${studentCount} students. Please remove them first.`);
      return;
    }
    
    if (confirm(`Are you sure you want to delete batch "${name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.timing) return;
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Batches</h2>
          <p className="text-sm text-gray-500">Manage your classes and timings</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={18} /> Create Batch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.map((batch) => {
          const studentCount = students.filter(s => s.batch === batch.id).length;
          
          return (
            <div key={batch.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                  <BookOpen size={24} />
                </div>
                
                {/* Delete Button */}
                <button 
                  onClick={() => handleDelete(batch.id, batch.name, studentCount)}
                  className={`transition-colors p-1 rounded-md ${studentCount > 0 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`}
                  title={studentCount > 0 ? "Remove students to delete" : "Delete Batch"}
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-1">{batch.name}</h3>
              
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock size={16} className="text-slate-400" />
                  <span>{batch.timing}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users size={16} className="text-slate-400" />
                  <span className={studentCount > 0 ? "text-indigo-600 font-medium" : ""}>{studentCount} Students</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono">
                  ID: {batch.id.slice(0, 8)}...
                </span>
              </div>
            </div>
          );
        })}

        {/* Empty State / Add New Card */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-slate-50 transition-all min-h-[200px] group"
        >
          <div className="p-3 bg-slate-100 rounded-full mb-3 group-hover:bg-indigo-100 transition-colors">
            <Plus size={24} className="group-hover:text-indigo-600" />
          </div>
          <span className="font-medium">Add New Batch</span>
        </button>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95">
            <h3 className="text-xl font-bold mb-4 text-slate-800">Create New Batch</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Batch Name</label>
                <input 
                  autoFocus
                  type="text" 
                  required 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Class 10 - Science" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Timing</label>
                <input 
                  type="text" 
                  required 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. 4:00 PM - 5:00 PM" 
                  value={formData.timing}
                  onChange={e => setFormData({...formData, timing: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                >
                  {createMutation.isPending ? <Loader2 className="animate-spin w-4 h-4"/> : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchesPage;