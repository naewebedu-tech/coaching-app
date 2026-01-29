import api from '../lib/axios';
import type { Batch, Test } from '../hooks/useDashboardData';
// import type { LucideIcon } from 'lucide-react';
// import type { User } from '../App';

export const authService = {
  register: async (userData: any) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },
  login: async (credentials: any) => {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },
};

export const batchService = {
  getAll: async () => {
    const response = await api.get('/batches/');
    return response.data.batches;
  },
  create: async (data: Partial<Batch>) => {
    const response = await api.post('/batches/', data);
    return response.data.batch;
  },
  // --- NEW: Delete Batch Functionality ---
  delete: async (id: string) => {
    const response = await api.delete(`/batches/${id}/`);
    return response.data;
  }
};

export const studentService = {
  getAll: async (batchId?: string | number, search?: string) => {
    const params = new URLSearchParams();
    if (batchId && batchId !== 'all') params.append('batch_id', String(batchId));
    if (search) params.append('search', search);
    
    const response = await api.get(`/students/?${params.toString()}`);
    return response.data.students;
  },
  // create: async (data: any) => {
  //   const response = await api.post('/students/', data);
  //   return response.data.student;
  // },
  // ✅ CORRECT - Need to specify headers for FormData
  create: async (data: FormData) => {
    const response = await api.post('/students/', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  // --- FIX 1: Add the update method here ---
  update: async (id: string | number, data: any) => {
    // We use PATCH for partial updates (like just updating total_fees)
    const response = await api.patch(`/students/${id}/`, data);
    return response.data;
  },
  // --- NEW: Delete Student Functionality ---
  delete: async (id: string | number) => {
    const response = await api.delete(`/students/${id}/`);
    return response.data;
  },
};

export const attendanceService = {
  // Fetch existing records for a specific context
  getAll: async () => {
      const response = await api.get('/attendance/');
      return response.data.attendances;
  },
  save: async (data: any) => {
    const response = await api.post('/attendance/', data);
    return response.data.attendance;
  }
};

export const feeService = {
  getAll: async (studentId?: string | number) => {
    const url = studentId ? `/fees/?student_id=${studentId}` : '/fees/';
    const response = await api.get(url);
    return response.data.payments;
  },
  create: async (data: FormData) => {
    // Note: Content-Type is 'multipart/form-data' which axios sets automatically when passed FormData
    const response = await api.post('/fees/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  delete: async (id: string | number) => {
      const response = await api.delete(`/fees/${id}/`);
      return response.data;
  }
};

export const testService = {
  getAll: async () => {
    const response = await api.get('/tests/');
    return response.data.tests;
  },
  create: async (data: Partial<Test>) => {
    const response = await api.post('/tests/', data);
    return response.data.test;
  },
  getAllMarks: async (testId: string | number) => {
      const response = await api.get(`/tests/${testId}/marks/`);
      return response.data.marks;
  },
  saveMarksBulk: async (testId: string | number, marks: any[]) => {
    const response = await api.post(`/tests/${testId}/marks/bulk/`, { marks });
    return response.data;
  }
};