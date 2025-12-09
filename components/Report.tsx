import React, { useEffect, useState } from 'react';
import { AttendanceRecord } from '../types';
import { storageService } from '../services/storageService';
import { analyzeAttendance } from '../services/geminiService';
import { THEME_COLORS } from '../constants';
import { Download, FileText, Search, Sparkles, AlertTriangle, CheckCircle, Clock, CalendarDays } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportProps {
    themeColor: string;
}

export const Report: React.FC<ReportProps> = ({ themeColor }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const allRecords = storageService.getRecords();
    allRecords.sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());
    setRecords(allRecords);
  }, []);

  useEffect(() => {
    const filtered = records.filter(r => r.date.startsWith(filterMonth));
    setFilteredRecords(filtered);
    setAiAnalysis(""); 
  }, [records, filterMonth]);

  const handleAnalysis = async () => {
    setIsAnalyzing(true);
    const analysis = await analyzeAttendance(filteredRecords);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const getStatusBadge = (record: AttendanceRecord) => {
    if (!record.checkOut) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Working
            </span>
        );
    }
    if (record.isLate) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-800">
                <Clock size={12} /> Late
            </span>
        );
    }
    if (record.isEarlyLeave) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-100 dark:border-orange-800">
                <AlertTriangle size={12} /> Early Out
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800">
            <CheckCircle size={12} /> On Time
        </span>
    );
  };

  const getStatusLabel = (record: AttendanceRecord) => {
    if (!record.checkOut) return "Working";
    if (record.isLate) return "Late";
    if (record.isEarlyLeave) return "Early Out";
    return "On Time";
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredRecords.map(r => ({
      Date: r.date,
      CheckIn: new Date(r.checkIn).toLocaleTimeString(),
      CheckOut: r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : 'N/A',
      Duration: (r.workDurationMinutes / 60).toFixed(2) + ' hrs',
      Status: getStatusLabel(r)
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `attendance_${filterMonth}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Attendance Report - ${filterMonth}`, 14, 22);
    
    const tableData = filteredRecords.map(r => [
      r.date,
      new Date(r.checkIn).toLocaleTimeString(),
      r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : 'N/A',
      (r.workDurationMinutes / 60).toFixed(2) + ' hrs',
      getStatusLabel(r)
    ]);

    // Find RGB values for current theme or default to indigo
    const currentTheme = THEME_COLORS.find(c => c.value === themeColor) || THEME_COLORS[0];
    const fillColor = currentTheme.rgb as any;

    autoTable(doc, {
      head: [['Date', 'Check In', 'Check Out', 'Duration', 'Status']],
      body: tableData,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: fillColor }
    });

    doc.save(`attendance_${filterMonth}.pdf`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Analytics & Reports</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Detailed breakdown of attendance metrics.</p>
        </div>
        <div className="flex flex-wrap gap-3">
            <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 transition-all text-sm font-semibold shadow-sm">
                <FileText size={16} className={`text-${themeColor}-600 dark:text-${themeColor}-400`} /> Export Excel
            </button>
            <button onClick={exportToPDF} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 transition-all text-sm font-semibold shadow-sm">
                <Download size={16} className="text-red-600 dark:text-red-400" /> Export PDF
            </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center transition-colors duration-200">
         <div className="flex items-center gap-3 w-full md:w-auto relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                <CalendarDays size={18} />
            </div>
            <input 
              type="month" 
              value={filterMonth} 
              onChange={(e) => setFilterMonth(e.target.value)}
              className={`pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-${themeColor}-500/20 focus:border-${themeColor}-500 outline-none transition-all w-full md:w-64 font-medium`}
            />
         </div>
         <button 
           onClick={handleAnalysis}
           disabled={isAnalyzing}
           className={`flex items-center gap-2 px-5 py-2.5 bg-${themeColor}-50 dark:bg-${themeColor}-900/30 text-${themeColor}-700 dark:text-${themeColor}-300 hover:bg-${themeColor}-100 dark:hover:bg-${themeColor}-900/50 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors w-full md:w-auto justify-center`}
         >
           <Sparkles size={16} />
           {isAnalyzing ? "Analyzing..." : "Generate AI Insights"}
         </button>
      </div>

      {aiAnalysis && (
        <div className={`bg-gradient-to-br from-${themeColor}-50 to-white dark:from-${themeColor}-900/40 dark:to-slate-900 border border-${themeColor}-100 dark:border-${themeColor}-900 p-6 rounded-xl text-${themeColor}-900 dark:text-${themeColor}-200 text-sm flex gap-4 shadow-sm animate-in fade-in slide-in-from-top-2`}>
           <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm h-fit shrink-0 text-indigo-600 dark:text-indigo-400">
             <Sparkles size={20} />
           </div>
           <div>
             <h4 className={`font-bold text-${themeColor}-950 dark:text-${themeColor}-100 mb-1`}>AI Performance Summary</h4>
             <p className={`leading-relaxed text-${themeColor}-800 dark:text-${themeColor}-300`}>{aiAnalysis}</p>
           </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                    <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Date</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Check In</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Check Out</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Work Hours</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRecords.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                            <div className="flex flex-col items-center gap-2">
                                <Search size={32} className="opacity-20" />
                                <p>No attendance records found for this period.</p>
                            </div>
                        </td>
                    </tr>
                ) : (
                    filteredRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                            <td className={`px-6 py-4 font-medium text-slate-800 dark:text-slate-200 group-hover:text-${themeColor}-900 dark:group-hover:text-${themeColor}-300`}>{record.date}</td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-xs">{new Date(record.checkIn).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                            <td className="px-6 py-4 text-slate-500 dark:text-slate-500 font-mono text-xs">
                                {record.checkOut 
                                ? new Date(record.checkOut).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) 
                                : <span className="text-slate-300 dark:text-slate-600">-</span>}
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                                {record.workDurationMinutes > 0 
                                ? <span className="font-semibold">{Math.floor(record.workDurationMinutes / 60)}h {record.workDurationMinutes % 60}m</span> 
                                : '-'}
                            </td>
                            <td className="px-6 py-4">
                                {getStatusBadge(record)}
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};