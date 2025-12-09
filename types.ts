export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  avatarUrl?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string; // ISO Date string YYYY-MM-DD
  checkIn: string; // ISO Timestamp
  checkOut: string | null; // ISO Timestamp
  status: 'present' | 'absent' | 'leave';
  isLate: boolean;
  isEarlyLeave: boolean;
  workDurationMinutes: number;
  notes?: string;
}

export interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  currentSessionId: string | null; // ID of the open attendance record
}

export enum Tab {
  DASHBOARD = 'DASHBOARD',
  PROFILE = 'PROFILE',
  REPORT = 'REPORT',
}