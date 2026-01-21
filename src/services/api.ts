import api from '../lib/axios';
import type { Student, Batch } from '../hooks/useDashboardData';
// import type { User } from '../App';


export const authService = {
  login: async (credentials: any) => {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  },
  register: async (userData: any) => {
    const response = await api.post('/auth/register/', userData);
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
};

export const studentService = {
  getAll: async (batchId?: string, search?: string) => {
    const params = new URLSearchParams();
    if (batchId && batchId !== 'all') params.append('batch_id', batchId);
    if (search) params.append('search', search);
    
    const response = await api.get(`/students/?${params.toString()}`);
    return response.data.students;
  },
  create: async (data: Partial<Student>) => {
    const response = await api.post('/students/', data);
    return response.data.student;
  },
  delete: async (id: string | number) => {
    const response = await api.delete(`/students/${id}/`);
    return response.data;
  },
  uploadProfilePic: async (id: string | number, file: File) => {
    const formData = new FormData();
    formData.append('profile_pic', file);
    const response = await api.post(`/students/${id}/upload-profile-pic/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.student;
  }
};

export const attendanceService = {
  // Logic to fetch attendance for a specific batch and date to populate the grid
  getRecord: async (batchId: string | number, date: string) => {
    const response = await api.get(`/attendance/?batch_id=${batchId}&date=${date}`);
    // Return the first record found or null
    return response.data.attendances.length > 0 ? response.data.attendances[0] : null;
  },
  save: async (data: any) => {
    const response = await api.post('/attendance/', data);
    return response.data.attendance;
  }
};

export const feeService = {
  getAll: async (studentId?: string) => {
    const url = studentId ? `/fees/?student_id=${studentId}` : '/fees/';
    const response = await api.get(url);
    return response.data.payments;
  },
  create: async (data: any) => {
    // Data should be FormData if containing screenshot
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await api.post('/fees/', data, { headers });
    return response.data;
  }
};

export const testService = {
  getAll: async () => {
    const response = await api.get('/tests/');
    return response.data.tests;
  },
  create: async (data: any) => {
    const response = await api.post('/tests/', data);
    return response.data.test;
  },
  saveMarks: async (testId: string | number, marks: any[]) => {
    const response = await api.post(`/tests/${testId}/marks/bulk/`, { marks });
    return response.data;
  },
  getMarks: async (testId: string | number) => {
    const response = await api.get(`/tests/${testId}/marks/`);
    return response.data;
  }
};

export const dashboardService = {
  getOverview: async () => {
    const response = await api.get('/dashboard/overview/');
    return response.data;
  }
};