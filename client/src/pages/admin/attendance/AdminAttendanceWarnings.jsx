import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

const AdminAttendanceWarnings = () => {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchData = async () => {
    try { const { data } = await api.get('/attendance/warnings'); setWarnings(Array.isArray(data) ? data : data.data || []); }
    catch { setWarnings([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleDismiss = async (id) => {
    try { await api.put(`/attendance/warnings/${id}`, { status: 'dismissed' }); fetchData(); } catch (err) { console.error(err); }
  };

  const handleSendNotice = async (id) => {
    try { await api.post(`/attendance/warnings/${id}/notify`); alert('Warning notice sent'); } catch (err) { console.error(err); }
  };

  const filtered = filter === 'all' ? warnings : warnings.filter(w => w.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Warnings</h1>
          <p className="mt-1 text-sm text-slate-500">Monitor and manage students with low attendance</p>
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'dismissed', 'notified'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-4 py-2 text-xs font-medium capitalize ${filter === f ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="text-xs font-medium text-amber-600">Active Warnings</p><p className="mt-1 text-2xl font-bold text-amber-700">{warnings.filter(w => w.status === 'active').length}</p></div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5"><p className="text-xs font-medium text-blue-600">Notified</p><p className="mt-1 text-2xl font-bold text-blue-700">{warnings.filter(w => w.status === 'notified').length}</p></div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-xs font-medium text-emerald-600">Dismissed</p><p className="mt-1 text-2xl font-bold text-emerald-700">{warnings.filter(w => w.status === 'dismissed').length}</p></div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="px-5 py-3 font-semibold text-slate-600">Student</th><th className="px-5 py-3 font-semibold text-slate-600">Class</th><th className="px-5 py-3 font-semibold text-slate-600">Attendance %</th><th className="px-5 py-3 font-semibold text-slate-600">Absent Days</th><th className="px-5 py-3 font-semibold text-slate-600">Status</th><th className="px-5 py-3 font-semibold text-slate-600">Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">Loading...</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">No warnings found</td></tr>}
            {filtered.map((w, i) => (
              <tr key={w._id || i} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{w.studentName || w.name || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{w.className || '-'}</td>
                <td className="px-5 py-3"><span className={`font-semibold ${w.percentage < 50 ? 'text-rose-600' : w.percentage < 75 ? 'text-amber-600' : 'text-emerald-600'}`}>{w.percentage || 0}%</span></td>
                <td className="px-5 py-3 text-slate-600">{w.absentDays || '-'}</td>
                <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${w.status === 'active' ? 'bg-amber-100 text-amber-700' : w.status === 'notified' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{w.status || 'active'}</span></td>
                <td className="px-5 py-3"><div className="flex gap-2"><button onClick={() => handleSendNotice(w._id)} className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100">Notify</button><button onClick={() => handleDismiss(w._id)} className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200">Dismiss</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAttendanceWarnings;
