import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

const KitchenReports = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    const fetch = async () => {
      try { const { data: res } = await api.get('/reports?type=kitchen-reports&period=' + period); setData(Array.isArray(res) ? res : res.data || []); }
      catch { setData([]); } finally { setLoading(false); }
    };
    fetch();
  }, [period]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Kitchen Reports</h1><p className="mt-1 text-sm text-slate-500">Kitchen operations analytics and reporting</p></div>
        <select value={period} onChange={e => setPeriod(e.target.value)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm"><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="text-xs font-medium text-slate-600">Daily Meals</p><p className="mt-1 text-2xl font-bold text-slate-700">—</p></div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-xs font-medium text-emerald-600">Monthly Cost</p><p className="mt-1 text-2xl font-bold text-emerald-700">—</p></div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="text-xs font-medium text-amber-600">Waste %</p><p className="mt-1 text-2xl font-bold text-amber-700">—</p></div>
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5"><p className="text-xs font-medium text-cyan-600">Supplier Count</p><p className="mt-1 text-2xl font-bold text-cyan-700">—</p></div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Report Data</h2>
        {loading ? <p className="text-slate-400">Loading...</p> : data.length === 0 ? <p className="text-slate-400">No data available for the selected period.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="px-4 py-3 font-semibold text-slate-600">#</th><th className="px-4 py-3 font-semibold text-slate-600">Item</th><th className="px-4 py-3 font-semibold text-slate-600">Value</th><th className="px-4 py-3 font-semibold text-slate-600">Change</th></tr></thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50"><td className="px-4 py-3 text-slate-600">{i+1}</td><td className="px-4 py-3 font-medium text-slate-800">{row.name || row.label || '-'}</td><td className="px-4 py-3 text-slate-600">{row.value || '-'}</td><td className="px-4 py-3 text-slate-500">{row.change || '-'}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default KitchenReports;
