import React, { useState } from 'react';

const AdminAttendanceReportsPage = () => {
  const [period, setPeriod] = useState('monthly');
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Attendance Reports</h1><p className="mt-1 text-sm text-slate-500">Attendance analytics across all departments</p></div>
        <select value={period} onChange={e => setPeriod(e.target.value)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm"><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-xs font-medium text-emerald-600">Overall Rate</p><p className="mt-1 text-2xl font-bold text-emerald-700">—</p></div>
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5"><p className="text-xs font-medium text-cyan-600">Students Present</p><p className="mt-1 text-2xl font-bold text-cyan-700">—</p></div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="text-xs font-medium text-amber-600">Late Arrivals</p><p className="mt-1 text-2xl font-bold text-amber-700">—</p></div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5"><p className="text-xs font-medium text-rose-600">Absences</p><p className="mt-1 text-2xl font-bold text-rose-700">—</p></div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="mb-4 text-lg font-semibold text-slate-800">Student Attendance</h2><p className="text-slate-400">Class-wise student attendance breakdown will appear here.</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="mb-4 text-lg font-semibold text-slate-800">Staff Attendance</h2><p className="text-slate-400">Department-wise staff attendance breakdown will appear here.</p></div>
      </div>
    </div>
  );
};

export default AdminAttendanceReportsPage;
