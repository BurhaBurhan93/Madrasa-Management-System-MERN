import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

const AdminComplaintsResolved = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/complaints?status=resolved');
        setComplaints(Array.isArray(data) ? data : data.data || []);
      } catch { setComplaints([]); } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Resolved Complaints</h1><p className="mt-1 text-sm text-slate-500">Successfully resolved complaints</p></div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="px-5 py-3 font-semibold text-slate-600">Subject</th><th className="px-5 py-3 font-semibold text-slate-600">Submitted By</th><th className="px-5 py-3 font-semibold text-slate-600">Resolved Date</th><th className="px-5 py-3 font-semibold text-slate-600">Resolution</th></tr></thead>
          <tbody>
            {complaints.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-400">No resolved complaints</td></tr>}
            {complaints.map(c => (
              <tr key={c._id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{c.subject || c.title || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{c.submittedBy?.name || c.userId?.name || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{c.resolvedAt ? new Date(c.resolvedAt).toLocaleDateString() : c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : '-'}</td>
                <td className="px-5 py-3 text-slate-600">{c.resolution || c.response || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminComplaintsResolved;
