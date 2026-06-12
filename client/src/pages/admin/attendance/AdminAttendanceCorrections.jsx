import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

const AdminAttendanceCorrections = () => {
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentName: '', date: '', status: 'present', reason: '' });

  const fetchData = async () => {
    try { const { data } = await api.get('/attendance/corrections'); setCorrections(Array.isArray(data) ? data : data.data || []); }
    catch { setCorrections([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post('/attendance/corrections', form); setShowForm(false); setForm({ studentName: '', date: '', status: 'present', reason: '' }); fetchData(); }
    catch (err) { console.error(err); }
  };

  const handleApprove = async (id) => {
    try { await api.put(`/attendance/corrections/${id}`, { status: 'approved' }); fetchData(); } catch (err) { console.error(err); }
  };
  const handleReject = async (id) => {
    try { await api.put(`/attendance/corrections/${id}`, { status: 'rejected' }); fetchData(); } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Corrections</h1>
          <p className="mt-1 text-sm text-slate-500">Review and manage attendance correction requests</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700">{showForm ? 'Cancel' : '+ New Correction'}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Student Name</label><input value={form.studentName} onChange={e => setForm({ ...form, studentName: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Date</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Corrected Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="present">Present</option><option value="absent">Absent</option><option value="late">Late</option><option value="excused">Excused</option></select></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Reason</label><input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Reason for correction" required /></div>
          </div>
          <button type="submit" className="mt-4 rounded-lg bg-cyan-600 px-6 py-2 text-sm font-medium text-white hover:bg-cyan-700">Submit Correction</button>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="px-5 py-3 font-semibold text-slate-600">Student</th><th className="px-5 py-3 font-semibold text-slate-600">Date</th><th className="px-5 py-3 font-semibold text-slate-600">Correction</th><th className="px-5 py-3 font-semibold text-slate-600">Reason</th><th className="px-5 py-3 font-semibold text-slate-600">Status</th><th className="px-5 py-3 font-semibold text-slate-600">Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">Loading...</td></tr>}
            {!loading && corrections.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">No correction requests</td></tr>}
            {corrections.map((c, i) => (
              <tr key={c._id || i} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{c.studentName || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{c.date ? new Date(c.date).toLocaleDateString() : '-'}</td>
                <td className="px-5 py-3"><span className="rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-medium text-cyan-700 capitalize">{c.correctedStatus || c.status || '-'}</span></td>
                <td className="px-5 py-3 text-slate-500">{c.reason || '-'}</td>
                <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${c.approvalStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' : c.approvalStatus === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{c.approvalStatus || 'pending'}</span></td>
                <td className="px-5 py-3"><div className="flex gap-2"><button onClick={() => handleApprove(c._id)} className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100">Approve</button><button onClick={() => handleReject(c._id)} className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">Reject</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAttendanceCorrections;
