import api from '../lib/axios';
import type { Batch, Test } from '../hooks/useDashboardData';

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

  /**
   * Step 1 of password reset.
   * Sends { phone, institute_name } — backend verifies institute_name matches
   * the account as a security check, then emails the reset token.
   */
  requestPasswordReset: async (data: { phone: string; institute_name: string }) => {
    const response = await api.post('/auth/password-reset/request/', data);
    return response.data;
    // Success: { success: true, message: "...", email: "j***@gmail.com" }
    // Failure: { success: false, message: "Institute name does not match." }
  },

  /**
   * Step 2 (final) — confirm token and set new password.
   */
  confirmPasswordReset: async (data: { phone: string; token: string; new_password: string }) => {
    const response = await api.post('/auth/password-reset/confirm/', data);
    return response.data;
    // Success: { success: true, message: "Password has been reset successfully." }
    // Failure: { success: false, message: "Invalid phone number or token." }
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
  delete: async (id: string) => {
    const response = await api.delete(`/batches/${id}/`);
    return response.data;
  },
};

export const studentService = {
  getAll: async (batchId?: string | number, search?: string) => {
    const params = new URLSearchParams();
    if (batchId && batchId !== 'all') params.append('batch_id', String(batchId));
    if (search) params.append('search', search);
    const response = await api.get(`/students/?${params.toString()}`);
    return response.data.students;
  },
  create: async (data: FormData) => {
    const response = await api.post('/students/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  update: async (id: string | number, data: any) => {
    const response = await api.patch(`/students/${id}/`, data);
    return response.data;
  },
  delete: async (id: string | number) => {
    const response = await api.delete(`/students/${id}/`);
    return response.data;
  },
};

export const attendanceService = {
  getAll: async () => {
    const response = await api.get('/attendance/');
    return response.data.attendances;
  },
  save: async (data: any) => {
    const response = await api.post('/attendance/', data);
    return response.data.attendance;
  },
};

export const feeService = {
  getAll: async (studentId?: string | number) => {
    const url = studentId ? `/fees/?student_id=${studentId}` : '/fees/';
    const response = await api.get(url);
    return response.data.payments;
  },
  create: async (data: FormData) => {
    const response = await api.post('/fees/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  delete: async (id: string | number) => {
    const response = await api.delete(`/fees/${id}/`);
    return response.data;
  },
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
  },
};