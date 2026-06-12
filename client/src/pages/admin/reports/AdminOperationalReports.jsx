import React, { useState } from 'react';

const AdminOperationalReports = () => {
  const [period, setPeriod] = useState('monthly');
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Operational Reports</h1><p className="mt-1 text-sm text-slate-500">Hostel, kitchen, library, and facility operations overview</p></div>
        <select value={period} onChange={e => setPeriod(e.target.value)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm"><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option></select>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5"><p className="text-xs font-medium text-cyan-600">Hostel Occupancy</p><p className="mt-1 text-2xl font-bold text-cyan-700">—</p></div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-xs font-medium text-emerald-600">Library Usage</p><p className="mt-1 text-2xl font-bold text-emerald-700">—</p></div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="text-xs font-medium text-amber-600">Kitchen Cost/Day</p><p className="mt-1 text-2xl font-bold text-amber-700">—</p></div>
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5"><p className="text-xs font-medium text-violet-600">Facility Score</p><p className="mt-1 text-2xl font-bold text-violet-700">—</p></div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="mb-4 text-lg font-semibold text-slate-800">Hostel Operations</h2><p className="text-slate-400">Room utilization, maintenance requests, and resident feedback.</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="mb-4 text-lg font-semibold text-slate-800">Kitchen Operations</h2><p className="text-slate-400">Meals served, waste tracking, and cost analysis.</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="mb-4 text-lg font-semibold text-slate-800">Library Operations</h2><p className="text-slate-400">Book circulation, new acquisitions, and overdue analysis.</p></div>
      </div>
    </div>
  );
};

export default AdminOperationalReports;
