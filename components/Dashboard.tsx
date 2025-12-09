import React, { useState, useEffect, useRef } from 'react';
import { User, AttendanceRecord } from '../types';
import { storageService } from '../services/storageService';
import { getProductivityTip } from '../services/geminiService';
import { WORK_HOURS_REQUIRED, WORK_START_TIME, ALARM_SOUND_URL } from '../constants';
import { Play, Square, Clock, Coffee, AlertCircle, Sparkles, CheckCircle2, Timer } from 'lucide-react';

interface DashboardProps {
  user: User;
  themeColor: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, themeColor }) => {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(storageService.getCurrentSession());
  const [currentRecord, setCurrentRecord] = useState<AttendanceRecord | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tip, setTip] = useState<string>("Loading daily insight...");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [alarmPlayed, setAlarmPlayed] = useState(false);

  // Initialize Audio
  useEffect(() => {
    audioRef.current = new Audio(ALARM_SOUND_URL);
  }, []);

  // AI Tip
  useEffect(() => {
    const hours = new Date().getHours();
    const timeOfDay = hours < 12 ? "morning" : hours < 17 ? "afternoon" : "evening";
    getProductivityTip(user.position, timeOfDay).then(setTip);
  }, [user.position]);

  // Load active session
  useEffect(() => {
    if (currentSessionId) {
      const records = storageService.getRecords();
      const record = records.find(r => r.id === currentSessionId);
      if (record) {
        setCurrentRecord(record);
      } else {
        storageService.setCurrentSession(null);
        setCurrentSessionId(null);
      }
    }
  }, [currentSessionId]);

  // Live Clock
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Timer & Alarm Logic
  useEffect(() => {
    let interval: any;
    if (currentRecord && !currentRecord.checkOut) {
      interval = setInterval(() => {
        const start = new Date(currentRecord.checkIn).getTime();
        const now = new Date().getTime();
        const diff = Math.floor((now - start) / 1000);
        setElapsedSeconds(diff);

        // 8 Hour Alarm
        if (diff >= WORK_HOURS_REQUIRED * 3600 && !alarmPlayed) {
            audioRef.current?.play().catch(e => console.log("Audio play blocked", e));
            setAlarmPlayed(true);
        }
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [currentRecord, alarmPlayed]);

  const handleClockIn = () => {
    const now = new Date();
    const nowTimeStr = now.toTimeString().slice(0, 5);
    const isLate = nowTimeStr > WORK_START_TIME;

    const newRecord: AttendanceRecord = {
      id: crypto.randomUUID(),
      userId: user.id,
      date: now.toISOString().split('T')[0],
      checkIn: now.toISOString(),
      checkOut: null,
      status: 'present',
      isLate: isLate,
      isEarlyLeave: false,
      workDurationMinutes: 0
    };

    storageService.saveRecord(newRecord);
    storageService.setCurrentSession(newRecord.id);
    setCurrentSessionId(newRecord.id);
    setCurrentRecord(newRecord);
    setAlarmPlayed(false);
  };

  const handleClockOut = () => {
    if (!currentRecord) return;

    const now = new Date();
    const start = new Date(currentRecord.checkIn);
    const durationMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
    const isEarlyLeave = durationMinutes < (WORK_HOURS_REQUIRED * 60);

    const updatedRecord: AttendanceRecord = {
      ...currentRecord,
      checkOut: now.toISOString(),
      workDurationMinutes: durationMinutes,
      isEarlyLeave: isEarlyLeave
    };

    storageService.saveRecord(updatedRecord);
    storageService.setCurrentSession(null);
    setCurrentSessionId(null);
    setCurrentRecord(null);
    setElapsedSeconds(0);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 transition-colors duration-200">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Overview</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
             <span>{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
             <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
             <span>{user.department} Department</span>
          </p>
        </div>
        <div className="text-right hidden md:block">
           <div className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Local Time</div>
           <div className="text-2xl font-mono font-semibold text-slate-800 dark:text-slate-200">
             {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
           </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Clock & Actions */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Action Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors duration-200">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 dark:bg-slate-800 rounded-bl-[100px] -z-0 opacity-50 pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                    <div className="relative">
                        {/* Timer Circle */}
                        <div className={`w-48 h-48 rounded-full flex items-center justify-center border-[8px] transition-all duration-500
                            ${currentSessionId ? `border-${themeColor}-100 dark:border-${themeColor}-900` : 'border-slate-100 dark:border-slate-800'}`}>
                             <div className="text-center">
                                 <div className={`text-4xl font-bold font-mono tracking-tight ${currentSessionId ? `text-${themeColor}-600 dark:text-${themeColor}-400` : 'text-slate-400 dark:text-slate-600'}`}>
                                    {currentSessionId ? formatTime(elapsedSeconds) : '00:00:00'}
                                 </div>
                                 <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">
                                    {currentSessionId ? 'Duration' : 'Inactive'}
                                 </div>
                             </div>
                        </div>
                        {currentSessionId && (
                             <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></div>
                        )}
                    </div>

                    <div className="flex-1 w-full max-w-sm text-center md:text-left">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                            {currentSessionId ? 'Work Session Active' : 'Ready to Start?'}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed text-sm">
                            {currentSessionId 
                                ? 'You are currently clocked in. Don’t forget to take regular breaks to maintain high productivity.' 
                                : 'Good morning! Click the button below to start tracking your work hours for today.'}
                        </p>
                        
                        {currentSessionId ? (
                            <button 
                                onClick={handleClockOut}
                                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl font-semibold flex items-center justify-center gap-3 transition-all shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 active:translate-y-0.5"
                            >
                                <Square size={18} fill="currentColor" /> Finish Work Session
                            </button>
                        ) : (
                            <button 
                                onClick={handleClockIn}
                                className={`w-full py-3.5 bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white rounded-xl font-semibold flex items-center justify-center gap-3 transition-all shadow-lg shadow-${themeColor}-600/20 hover:shadow-${themeColor}-600/30 active:translate-y-0.5`}
                            >
                                <Play size={18} fill="currentColor" /> Start Work Session
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Insight */}
            <div className={`bg-gradient-to-r from-${themeColor}-50 to-white dark:from-${themeColor}-950/40 dark:to-slate-900 border border-${themeColor}-100 dark:border-${themeColor}-900 rounded-2xl p-6 flex gap-4 items-start`}>
                <div className={`p-2.5 bg-white dark:bg-slate-800 rounded-lg text-${themeColor}-600 dark:text-${themeColor}-400 shadow-sm shrink-0`}>
                    <Sparkles size={20} />
                </div>
                <div>
                    <h4 className={`font-semibold text-${themeColor}-900 dark:text-${themeColor}-300 mb-1 text-sm uppercase tracking-wide`}>AI Productivity Insight</h4>
                    <p className={`text-${themeColor}-800/80 dark:text-${themeColor}-200/80 leading-relaxed text-sm`}>"{tip}"</p>
                </div>
            </div>
        </div>

        {/* Right Column: Stats & Status */}
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 h-full transition-colors duration-200">
                <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-slate-400" />
                    Session Status
                </h3>
                
                <div className="space-y-6 relative">
                    <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800"></div>

                    {/* Check In Stat */}
                    <div className="relative pl-10">
                        <div className={`absolute left-0 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white dark:bg-slate-900 z-10 
                            ${currentRecord ? 'border-green-500 text-green-500' : 'border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600'}`}>
                            <div className="w-2 h-2 rounded-full bg-current"></div>
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mb-1">Check In</p>
                        <p className="text-lg font-medium text-slate-800 dark:text-slate-200">
                             {currentRecord ? new Date(currentRecord.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Pending'}
                        </p>
                    </div>

                    {/* Target End Stat */}
                    <div className="relative pl-10">
                        <div className="absolute left-0 w-6 h-6 rounded-full border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-900 z-10 text-slate-300 dark:text-slate-600">
                             <Clock size={12} />
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mb-1">Estimated End</p>
                        <p className="text-lg font-medium text-slate-800 dark:text-slate-200">
                            {currentRecord ? new Date(new Date(currentRecord.checkIn).getTime() + WORK_HOURS_REQUIRED * 3600 * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                        </p>
                    </div>

                    {/* Status Alerts */}
                    <div className="relative pl-10 pt-4">
                        {currentRecord?.isLate ? (
                            <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/50">
                                <AlertCircle size={18} className="text-red-500 dark:text-red-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-red-700 dark:text-red-400">Late Arrival</p>
                                    <p className="text-xs text-red-500 dark:text-red-300 mt-0.5">Checked in after {WORK_START_TIME}</p>
                                </div>
                            </div>
                        ) : (
                           <div className="flex items-start gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                                <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">On Track</p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-300 mt-0.5">You are working on schedule.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};