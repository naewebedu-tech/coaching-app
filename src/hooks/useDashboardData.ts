import { useQuery, useQueryClient } from '@tanstack/react-query';
import { batchService, studentService, feeService, testService, attendanceService } from '../services/api';

// --- Interfaces (Matched to Django Models) ---

export interface Batch {
  id: string; // UUIDs are strings
  name: string;
  timing: string;
  student_count?: number;
}

export interface Student {
  id: string;
  name: string;
  batch: string; // ID reference
  batch_name?: string; // Read-only from serializer
  phone: string;
  roll: string;
  fees_paid: number;
  total_fees: number;
  fees_due?: number;
  profile_pic: string | null;
  address?: string;
}

export interface AttendanceRecord {
  id: string;
  batch: string; // ID
  batch_name?: string;
  date: string;
  records: { id?: string; student: string; student_name?: string; status: 'present' | 'absent' }[];
}

export interface Fee {
  id: string;
  student: string; // ID
  student_name?: string;
  amount: number;
  payment_date: string;
  notes?: string;
  screenshot?: string | null;
  is_verified?: boolean;
}

export interface FeeRecord {
  id: string;
  student: string; // ID
  student_name?: string;
  amount: number;
  payment_date: string;
  notes?: string;
  screenshot?: string | null;
  is_verified?: boolean;
}

export interface Test {
  id: string;
  name: string;
  date: string;
  total_marks: number;
  batch: string; // ID
  batch_name?: string;
  board: string;
  duration: string;
}

export interface Mark {
  id?: string;
  testId?: string;
  student: string; // ID
  student_name?: string;
  marks_obtained: number;
  percentage?: number;
}

// --- Main Hook ---

export interface DashboardData {
  batches: Batch[];
  students: Student[];
  attendance: AttendanceRecord[];
  fees: Fee[];
  tests: Test[];
  // Actions
  refreshData: () => void;
}

const useDashboardData = (): DashboardData => {
  const queryClient = useQueryClient();

  const { data: batches = [] } = useQuery({ queryKey: ['batches'], queryFn: batchService.getAll });
  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: () => studentService.getAll() });
  const { data: attendance = [] } = useQuery({ queryKey: ['attendance'], queryFn: attendanceService.getAll });
  const { data: fees = [] } = useQuery({ queryKey: ['fees'], queryFn: () => feeService.getAll() });
  const { data: tests = [] } = useQuery({ queryKey: ['tests'], queryFn: testService.getAll });

  const refreshData = () => {
    queryClient.invalidateQueries();
  };

  return { 
    batches, 
    students, 
    attendance, 
    fees, 
    tests, 
    refreshData 
  };
};

export default useDashboardData;