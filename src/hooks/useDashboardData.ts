import { useState, useEffect } from 'react';

// --- Interfaces ---

export interface Batch {
  id: number;
  name: string;
  timing: string;
}

export interface Student {
  id: number;
  name: string;
  batchId: number | string; // keeping flexible as forms might handle strings
  phone: string;
  roll: string;
  feesPaid: number;
  totalFees: number;
  profilePic: string | null;
}

export interface AttendanceRecord {
  id?: number;
  date: string;
  batchId: number;
  // Map of studentId -> status
  records: Record<string | number, 'present' | 'absent'>; 
}

export interface Fee {
  id: number;
  studentId: number;
  amount: number;
  date: string;
}

export interface Test {
  id: number;
  name: string;
  date: string;
  totalMarks: number;
  batchId: number;
  board: string;
  duration: string;
  questions?: any[];
}

export interface Mark {
  testId: number;
  studentId: number;
  marksObtained: number;
}

// Return type for the hook
export interface DashboardData {
  batches: Batch[];
  setBatches: React.Dispatch<React.SetStateAction<Batch[]>>;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  fees: Fee[];
  setFees: React.Dispatch<React.SetStateAction<Fee[]>>;
  tests: Test[];
  setTests: React.Dispatch<React.SetStateAction<Test[]>>;
  marks: Mark[];
  setMarks: React.Dispatch<React.SetStateAction<Mark[]>>;
}

// --- Hook Implementation ---

const useDashboardData = (): DashboardData => {
  // 1. Batches
  const [batches, setBatches] = useState<Batch[]>(() => {
    const saved = localStorage.getItem('cm_batches');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Class 10 - Science', timing: '4:00 PM' },
      { id: 2, name: 'Class 12 - Physics', timing: '6:00 PM' }
    ];
  });

  // 2. Students
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('cm_students');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Rohan Sharma', batchId: 1, phone: '9876543210', roll: '101', feesPaid: 5000, totalFees: 12000, profilePic: null },
      { id: 2, name: 'Priya Verma', batchId: 1, phone: '9876543211', roll: '102', feesPaid: 12000, totalFees: 12000, profilePic: null },
      { id: 3, name: 'Amit Kumar', batchId: 2, phone: '9876543212', roll: '201', feesPaid: 2000, totalFees: 15000, profilePic: null },
    ];
  });

  // 3. Attendance
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('cm_attendance');
    return saved ? JSON.parse(saved) : [];
  });

  // 4. Fees
  const [fees, setFees] = useState<Fee[]>(() => {
    const saved = localStorage.getItem('cm_fees');
    return saved ? JSON.parse(saved) : [];
  });

  // 5. Tests
  const [tests, setTests] = useState<Test[]>(() => {
    const saved = localStorage.getItem('cm_tests');
    return saved ? JSON.parse(saved) : [];
  });

  // 6. Marks
  const [marks, setMarks] = useState<Mark[]>(() => {
    const saved = localStorage.getItem('cm_marks');
    return saved ? JSON.parse(saved) : [];
  });

  // --- Effects to Sync with LocalStorage ---
  useEffect(() => localStorage.setItem('cm_batches', JSON.stringify(batches)), [batches]);
  useEffect(() => localStorage.setItem('cm_students', JSON.stringify(students)), [students]);
  useEffect(() => localStorage.setItem('cm_attendance', JSON.stringify(attendance)), [attendance]);
  useEffect(() => localStorage.setItem('cm_fees', JSON.stringify(fees)), [fees]);
  useEffect(() => localStorage.setItem('cm_tests', JSON.stringify(tests)), [tests]);
  useEffect(() => localStorage.setItem('cm_marks', JSON.stringify(marks)), [marks]);

  return { 
    batches, setBatches, 
    students, setStudents, 
    attendance, setAttendance, 
    fees, setFees, 
    tests, setTests, 
    marks, setMarks 
  };
};

export default useDashboardData;