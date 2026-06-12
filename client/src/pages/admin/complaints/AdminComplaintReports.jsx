import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

const AdminComplaintReports = () => {
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0, rejected: 0 });
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/complaints');
        const list = Array.isArray(data) ? data : data.data || [];
        setComplaints(list);
        setStats({
          total: list.length,
          pending: list.filter(c => c.status === 'pending').length,
          inProgress: list.filter(c => c.status === 'in-progress').length,
          resolved: list.filter(c => c.status === 'resolved').length,
          rejected: list.filter(c => c.status === 'rejected').length,
        });
      } catch { } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>;

  const cards = [
    { label: 'Total', value: stats.total, color: 'bg-slate-100 text-slate-700' },
    { label: 'Pending', value: stats.pending, color: 'bg-amber-50 text-amber-700' },
    { label: 'In Progress', value: stats.inProgress, color: 'bg-cyan-50 text-cyan-700' },
    { label: 'Resolved', value: stats.resolved, color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Rejected', value: stats.rejected, color: 'bg-rose-50 text-rose-700' },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Complaint Reports</h1><p className="mt-1 text-sm text-slate-500">Overview and analytics for complaints</p></div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {cards.map(c => (
          <div key={c.label} className={`rounded-2xl p-5 ${c.color}`}>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{c.label}</p>
            <p className="mt-2 text-3xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="px-5 py-3 font-semibold text-slate-600">Subject</th><th className="px-5 py-3 font-semibold text-slate-600">Status</th><th className="px-5 py-3 font-semibold text-slate-600">Priority</th><th className="px-5 py-3 font-semibold text-slate-600">Date</th></tr></thead>
          <tbody>
            {complaints.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-400">No complaints</td></tr>}
            {complaints.slice(0, 20).map(c => (
              <tr key={c._id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{c.subject || c.title || '-'}</td>
                <td className="px-5 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.status === 'resolved' ? 'bg-emerald-50 text-emerald-700' : c.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-cyan-50 text-cyan-700'}`}>{c.status}</span></td>
                <td className="px-5 py-3 text-slate-600">{c.priority || 'normal'}</td>
                <td className="px-5 py-3 text-slate-600">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminComplaintReports;
