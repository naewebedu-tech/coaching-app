import api from '../lib/axios';
import type { Batch, Test } from '../hooks/useDashboardData';

// ─────────────────────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────────────────────

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
   * Step 1 — Request password reset.
   * Sends { phone, institute_name }.
   * Backend verifies institute_name matches account, then emails the token.
   */
  requestPasswordReset: async (data: { phone: string; institute_name: string }) => {
    const response = await api.post('/auth/password-reset/request/', data);
    return response.data;
    // Success: { success: true, message: "...", email: "j***@gmail.com" }
    // Failure: { success: false, message: "Institute name does not match." }
  },

  /**
   * Step 2 — Confirm token and set new password.
   */
  confirmPasswordReset: async (data: {
    phone: string;
    token: string;
    new_password: string;
  }) => {
    const response = await api.post('/auth/password-reset/confirm/', data);
    return response.data;
    // Success: { success: true, message: "Password has been reset successfully." }
    // Failure: { success: false, message: "Invalid phone number or token." }
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Batch
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Student
// ─────────────────────────────────────────────────────────────────────────────

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

  /**
   * Upload / replace a student's profile picture.
   * POST /api/students/<id>/upload-profile-pic/
   * Body: multipart/form-data  key = "profile_pic"
   */
  uploadProfilePic: async (id: string | number, data: FormData) => {
    const response = await api.post(
      `/students/${id}/upload-profile-pic/`,
      data,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },

  /**
   * Fetch the full student profile in one request.
   * GET /api/students/<id>/profile/
   * Returns: student, batch, attendance (date_map + monthly + totals),
   *          fees (summary + payments), tests, summary KPIs.
   */
  getFullProfile: async (id: string | number) => {
    const response = await api.get(`/students/${id}/profile/`);
    return response.data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Attendance
// ─────────────────────────────────────────────────────────────────────────────

export const attendanceService = {
  getAll: async () => {
    const response = await api.get('/attendance/');
    return response.data.attendances;
  },

  save: async (data: any) => {
    const response = await api.post('/attendance/', data);
    return response.data.attendance;
  },

  /**
   * Per-student report: date_map, monthly breakdown, totals.
   * GET /api/attendance/student/<id>/report/
   */
  getStudentReport: async (studentId: string | number, month?: string) => {
    const params = month ? `?month=${month}` : '';
    const response = await api.get(`/attendance/student/${studentId}/report/${params}`);
    return response.data;
  },

  /**
   * Class-wide report for a batch with optional date range.
   * GET /api/attendance/class-report/?batch_id=&start_date=&end_date=
   */
  getClassReport: async (batchId: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams({ batch_id: batchId });
    if (startDate) params.append('start_date', startDate);
    if (endDate)   params.append('end_date',   endDate);
    const response = await api.get(`/attendance/class-report/?${params.toString()}`);
    return response.data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Fee
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Test
// ─────────────────────────────────────────────────────────────────────────────

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

  /**
   * Full test report for a single student across all tests.
   * GET /api/tests/student/<id>/report/
   */
  getStudentReport: async (studentId: string | number) => {
    const response = await api.get(`/tests/student/${studentId}/report/`);
    return response.data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Analytics / Dashboard (optional helpers used by CatalogBoard-equivalent)
// ─────────────────────────────────────────────────────────────────────────────

export const analyticsService = {
  getSummary: async () => {
    const response = await api.get('/dashboard/overview/');
    return response.data.overview;
  },

  getAnalytics: async (period: 'week' | 'month' | 'year' = 'month') => {
    const response = await api.get(`/dashboard/analytics/?period=${period}`);
    return response.data;
  },
};