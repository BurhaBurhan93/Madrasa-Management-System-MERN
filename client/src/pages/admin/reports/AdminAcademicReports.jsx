import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

const AdminAcademicReports = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    const fetch = async () => {
      try { const { data: res } = await api.get(`/academic/classes`); setData(Array.isArray(res) ? res : res.data || []); }
      catch { setData([]); } finally { setLoading(false); }
    };
    fetch();
  }, [period]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Academic Reports</h1><p className="mt-1 text-sm text-slate-500">Academic performance analysis and insights</p></div>
        <select value={period} onChange={e => setPeriod(e.target.value)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm"><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="term">Term</option><option value="yearly">Yearly</option></select>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5"><p className="text-xs font-medium text-cyan-600">Total Students</p><p className="mt-1 text-2xl font-bold text-cyan-700">—</p></div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-xs font-medium text-emerald-600">Avg. Score</p><p className="mt-1 text-2xl font-bold text-emerald-700">—</p></div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="text-xs font-medium text-amber-600">Pass Rate</p><p className="mt-1 text-2xl font-bold text-amber-700">—</p></div>
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5"><p className="text-xs font-medium text-violet-600">Top Performers</p><p className="mt-1 text-2xl font-bold text-violet-700">—</p></div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Class-wise Performance</h2>
          {loading ? <p className="text-slate-400">Loading...</p> : (
            <table className="w-full text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50"><tr><th className="px-4 py-3 font-semibold text-slate-600">Class</th><th className="px-4 py-3 font-semibold text-slate-600">Students</th><th className="px-4 py-3 font-semibold text-slate-600">Avg Score</th><th className="px-4 py-3 font-semibold text-slate-600">Pass %</th></tr></thead>
              <tbody>{data.map((c, i) => (<tr key={c._id || i} className="border-b border-slate-100"><td className="px-4 py-3 font-medium text-slate-800">{c.name}</td><td className="px-4 py-3 text-slate-600">{c.studentCount || '-'}</td><td className="px-4 py-3 text-slate-600">—</td><td className="px-4 py-3 text-slate-600">—</td></tr>))}</tbody>
            </table>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Subject Analysis</h2>
          <p className="text-slate-400">Subject-wise breakdown will appear here when data is available.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminAcademicReports;
