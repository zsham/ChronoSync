import { AttendanceRecord, User } from '../types';

const KEYS = {
  USER: 'chrono_user',
  RECORDS: 'chrono_records',
  SESSION: 'chrono_current_session',
  THEME: 'chrono_theme_pref',
  DARK_MODE: 'chrono_dark_mode',
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

  getTheme: (): string => {
    return localStorage.getItem(KEYS.THEME) || 'indigo';
  },

  saveTheme: (theme: string) => {
    localStorage.setItem(KEYS.THEME, theme);
  },

  getDarkMode: (): boolean => {
    return localStorage.getItem(KEYS.DARK_MODE) === 'true';
  },

  saveDarkMode: (isDark: boolean) => {
    localStorage.setItem(KEYS.DARK_MODE, String(isDark));
  },

  // Helper to clear data for testing
  clearAll: () => {
    localStorage.clear();
  }
};