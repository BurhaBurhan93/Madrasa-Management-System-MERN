import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

const AdminFinancialReports = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  useEffect(() => { const t = setTimeout(() => setLoading(false), 500); return () => clearTimeout(t); }, [period]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Financial Reports</h1><p className="mt-1 text-sm text-slate-500">Revenue, expenses, and financial analytics</p></div>
        <div className="flex gap-2">
          <select value={period} onChange={e => setPeriod(e.target.value)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm"><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option></select>
          <button className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">Export PDF</button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-xs font-medium text-emerald-600">Total Revenue</p><p className="mt-1 text-2xl font-bold text-emerald-700">—</p></div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5"><p className="text-xs font-medium text-rose-600">Total Expenses</p><p className="mt-1 text-2xl font-bold text-rose-700">—</p></div>
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5"><p className="text-xs font-medium text-cyan-600">Net Profit</p><p className="mt-1 text-2xl font-bold text-cyan-700">—</p></div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="text-xs font-medium text-amber-600">Collections</p><p className="mt-1 text-2xl font-bold text-amber-700">—</p></div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="mb-4 text-lg font-semibold text-slate-800">Revenue Breakdown</h2><p className="text-slate-400">{loading ? 'Loading...' : 'Revenue breakdown by category will appear here.'}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="mb-4 text-lg font-semibold text-slate-800">Expense Analysis</h2><p className="text-slate-400">{loading ? 'Loading...' : 'Expense analysis by category will appear here.'}</p></div>
      </div>
    </div>
  );
};

export default AdminFinancialReports;
