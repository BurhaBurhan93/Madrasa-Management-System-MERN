import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

const AdminComplaintsPending = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/complaints?status=pending');
        setComplaints(Array.isArray(data) ? data : data.data || []);
      } catch { setComplaints([]); } finally { setLoading(false); }
    })();
  }, []);

  const handleStatusChange = async (id, status) => {
    try { await api.put(`/complaints/${id}`, { status }); setComplaints(prev => prev.filter(c => c._id !== id)); }
    catch (err) { console.error(err); }
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Pending Complaints</h1><p className="mt-1 text-sm text-slate-500">Complaints awaiting review</p></div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="px-5 py-3 font-semibold text-slate-600">Subject</th><th className="px-5 py-3 font-semibold text-slate-600">Submitted By</th><th className="px-5 py-3 font-semibold text-slate-600">Date</th><th className="px-5 py-3 font-semibold text-slate-600">Priority</th><th className="px-5 py-3 font-semibold text-slate-600">Actions</th></tr></thead>
          <tbody>
            {complaints.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">No pending complaints</td></tr>}
            {complaints.map(c => (
              <tr key={c._id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{c.subject || c.title || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{c.submittedBy?.name || c.userId?.name || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}</td>
                <td className="px-5 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.priority === 'high' ? 'bg-rose-50 text-rose-700' : c.priority === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{c.priority || 'normal'}</span></td>
                <td className="px-5 py-3"><div className="flex gap-2"><button onClick={() => handleStatusChange(c._id, 'in-progress')} className="rounded-lg bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700 hover:bg-cyan-100">Mark In-Progress</button><button onClick={() => handleStatusChange(c._id, 'resolved')} className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100">Resolve</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminComplaintsPending;
