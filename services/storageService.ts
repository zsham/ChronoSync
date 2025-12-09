import { AttendanceRecord, User } from '../types';

const KEYS = {
  USER: 'chrono_user',
  RECORDS: 'chrono_records',
  SESSION: 'chrono_current_session',
};

export const storageService = {
  getUser: (): User | null => {
    const data = localStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  saveUser: (user: User) => {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  getRecords: (): AttendanceRecord[] => {
    const data = localStorage.getItem(KEYS.RECORDS);
    return data ? JSON.parse(data) : [];
  },

  saveRecord: (record: AttendanceRecord) => {
    const records = storageService.getRecords();
    // Update if exists, else add
    const index = records.findIndex((r) => r.id === record.id);
    if (index >= 0) {
      records[index] = record;
    } else {
      records.push(record);
    }
    localStorage.setItem(KEYS.RECORDS, JSON.stringify(records));
  },

  getCurrentSession: (): string | null => {
    return localStorage.getItem(KEYS.SESSION);
  },

  setCurrentSession: (id: string | null) => {
    if (id) {
      localStorage.setItem(KEYS.SESSION, id);
    } else {
      localStorage.removeItem(KEYS.SESSION);
    }
  },

  // Helper to clear data for testing
  clearAll: () => {
    localStorage.clear();
  }
};