import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEye, FiCheck } from 'react-icons/fi';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const statusColors = {
  open: 'bg-rose-100 text-rose-700',
  in_progress: 'bg-amber-100 text-amber-700',
  closed: 'bg-emerald-100 text-emerald-700'
};
const priorityColors = {
  high: 'bg-rose-100 text-rose-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-sky-100 text-sky-700'
};

const AssignedComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/teacher/complaints', api());
      if (res.data.success) setComplaints(res.data.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/teacher/complaints/${id}/status`, { status }, api());
      if (res.data.success) { fetchComplaints(); setSelected(null); }
    } catch (e) { alert('Failed to update complaint'); }
  };

  const filtered = complaints.filter(c => {
    const matchStatus = filterStatus === '' || c.complaintStatus === filterStatus;
    const matchSearch = c.subject?.toLowerCase().includes(search.toLowerCase()) || c.complaintCode?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.complaintStatus === 'open').length,
    inProgress: complaints.filter(c => c.complaintStatus === 'in_progress').length,
    closed: complaints.filter(c => c.complaintStatus === 'closed').length,
  };

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef7f7_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Assigned Complaints</h1>
          <p className="mt-1 text-sm text-slate-500">Complaints assigned to you for resolution</p>
        </div>

        {/* Stats */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
          {[
            { label: 'Total', value: stats.total, accent: 'bg-cyan-500' },
            { label: 'Open', value: stats.open, accent: 'bg-rose-500' },
            { label: 'In Progress', value: stats.inProgress, accent: 'bg-amber-500' },
            { label: 'Closed', value: stats.closed, accent: 'bg-emerald-500' },
          ].map(c => (
            <div key={c.label} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className={`absolute inset-x-0 top-0 h-1 ${c.accent}`} />
              <p className="text-sm font-medium text-slate-500">{c.label}</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{c.value}</p>
            </div>
          ))}
        </section>

        {/* Filters */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <input type="text" placeholder="Search complaints..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-600 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100">
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex h-32 items-center justify-center text-slate-500">Loading...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Code', 'Subject', 'Priority', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-slate-500">No complaints assigned to you</td></tr>
                ) : filtered.map(c => (
                  <tr key={c._id} className="transition-colors duration-150 hover:bg-slate-50">
                    <td className="p-4 font-medium text-cyan-600">{c.complaintCode}</td>
                    <td className="p-4 text-slate-700">{c.subject}</td>
                    <td className="p-4"><span className={`rounded-full px-3 py-1 text-xs font-medium ${priorityColors[c.priorityLevel]}`}>{c.priorityLevel}</span></td>
                    <td className="p-4"><span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[c.complaintStatus]}`}>{c.complaintStatus}</span></td>
                    <td className="p-4 text-slate-500">{new Date(c.submittedDate).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => setSelected(c)} className="flex h-8 w-8 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-600 transition-all duration-200 hover:bg-sky-100"><FiEye size={15} /></button>
                        {c.complaintStatus !== 'closed' && (
                          <button onClick={() => updateStatus(c._id, 'closed')} className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 transition-all duration-200 hover:bg-emerald-100"><FiCheck size={15} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{selected.subject}</h2>
              <button onClick={() => setSelected(null)} className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100">×</button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Code', value: selected.complaintCode },
                { label: 'Category', value: selected.complaintCategory || '-' },
              ].map(row => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-slate-400">{row.label}:</span>
                  <span className="font-medium text-slate-700">{row.value}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span className="text-slate-400">Priority:</span>
                <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${priorityColors[selected.priorityLevel]}`}>{selected.priorityLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${statusColors[selected.complaintStatus]}`}>{selected.complaintStatus}</span>
              </div>
              <div>
                <p className="mb-2 text-slate-400">Description:</p>
                <p className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-slate-600">{selected.description || 'No description'}</p>
              </div>
            </div>
            {selected.complaintStatus !== 'closed' && (
              <div className="mt-5 flex justify-end gap-3">
                {selected.complaintStatus === 'open' && (
                  <button onClick={() => updateStatus(selected._id, 'in_progress')} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100">Mark In Progress</button>
                )}
                <button onClick={() => updateStatus(selected._id, 'closed')} className="rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-cyan-700">Mark Resolved</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedComplaints;
