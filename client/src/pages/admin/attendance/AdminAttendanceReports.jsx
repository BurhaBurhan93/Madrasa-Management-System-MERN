import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

const AdminAttendanceReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ classId: '', month: '', type: 'student' });
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState({ totalDays: 0, presentDays: 0, absentDays: 0, rate: 0 });

  const fetchClasses = async () => {
    try { const { data } = await api.get('/academic/classes'); setClasses(Array.isArray(data) ? data : data.data || []); } catch { setClasses([]); }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filter).toString();
      const { data } = await api.get(`/attendance/summary?${params}`);
      const records = Array.isArray(data) ? data : data.data || [];
      setReports(records);
      const total = records.length || 1;
      const present = records.filter(r => r.status === 'present').length;
      setStats({ totalDays: total, presentDays: present, absentDays: total - present, rate: Math.round((present / total) * 100) });
    } catch { setReports([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchClasses(); }, []);
  useEffect(() => { fetchReports(); }, [filter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Attendance Reports</h1>
        <p className="mt-1 text-sm text-slate-500">View and analyze attendance statistics across classes and periods</p>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div><label className="mb-1 block text-xs font-medium text-slate-500">Class</label><select value={filter.classId} onChange={e => setFilter({ ...filter, classId: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="">All Classes</option>{classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
        <div><label className="mb-1 block text-xs font-medium text-slate-500">Month</label><input type="month" value={filter.month} onChange={e => setFilter({ ...filter, month: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
        <div><label className="mb-1 block text-xs font-medium text-slate-500">Type</label><select value={filter.type} onChange={e => setFilter({ ...filter, type: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="student">Students</option><option value="teacher">Teachers</option><option value="staff">Staff</option></select></div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-medium text-slate-500">Total Records</p><p className="mt-1 text-2xl font-bold text-slate-900">{stats.totalDays}</p></div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-xs font-medium text-emerald-600">Present</p><p className="mt-1 text-2xl font-bold text-emerald-700">{stats.presentDays}</p></div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5"><p className="text-xs font-medium text-rose-600">Absent</p><p className="mt-1 text-2xl font-bold text-rose-700">{stats.absentDays}</p></div>
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5"><p className="text-xs font-medium text-cyan-600">Attendance Rate</p><p className="mt-1 text-2xl font-bold text-cyan-700">{stats.rate}%</p></div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="px-5 py-3 font-semibold text-slate-600">Name</th><th className="px-5 py-3 font-semibold text-slate-600">Class/Dept</th><th className="px-5 py-3 font-semibold text-slate-600">Date</th><th className="px-5 py-3 font-semibold text-slate-600">Status</th><th className="px-5 py-3 font-semibold text-slate-600">Remarks</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">Loading...</td></tr>}
            {!loading && reports.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">No attendance records found</td></tr>}
            {reports.map((r, i) => (
              <tr key={r._id || i} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{r.name || r.studentName || r.employeeName || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{r.className || r.department || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{r.date ? new Date(r.date).toLocaleDateString() : '-'}</td>
                <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${r.status === 'present' ? 'bg-emerald-100 text-emerald-700' : r.status === 'late' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>{r.status || '-'}</span></td>
                <td className="px-5 py-3 text-slate-500">{r.remarks || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAttendanceReports;
