import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';
import StaffPageLayout from '../shared/StaffPageLayout';
import StaffPagination from '../shared/StaffPagination';

const ClassAssignment = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [limit, setLimit]       = useState(10);
  const [modal, setModal]       = useState(null); // { type: 'transfer'|'promote', student }
  const [newClass, setNewClass] = useState('');
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState({ text: '', error: false });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sRes, cRes] = await Promise.all([
        api.get('/students/all'),
        api.get('/academic/classes'),
      ]);
      setStudents(sRes.data.data || []);
      setClasses(cRes.data.data || cRes.data || []);
    } catch { notify('Failed to load data', true); }
    finally { setLoading(false); }
  };

  const notify = (text, error = false) => {
    setMsg({ text, error });
    setTimeout(() => setMsg({ text: '', error: false }), 3000);
  };

  const handleAction = async () => {
    if (!newClass) return;
    setSaving(true);
    try {
      const url = modal.type === 'transfer'
        ? `/students/${modal.student._id}/transfer`
        : `/students/${modal.student._id}/promote`;
      const method = modal.type === 'transfer' ? 'put' : 'post';
      await api[method](url, { newClass });
      notify(`Student ${modal.type === 'transfer' ? 'transferred' : 'promoted'} successfully`);
      setModal(null);
      setNewClass('');
      fetchAll();
    } catch (err) {
      notify(err.response?.data?.message || `Failed to ${modal.type}`, true);
    } finally { setSaving(false); }
  };

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    return !q || `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase().includes(q) ||
      s.studentCode?.toLowerCase().includes(q) ||
      s.currentClass?.className?.toLowerCase().includes(q);
  });
  const total   = filtered.length;
  const visible = filtered.slice((page - 1) * limit, page * limit);

  return (
    <StaffPageLayout title="Class Assignment & Transfer" subtitle="Assign students to classes, manage transfers and promotions.">
      {msg.text && (
        <div className={`flex items-center gap-3 rounded-2xl border px-5 py-3 text-sm ${msg.error ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          {msg.text}
        </div>
      )}

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="6.5" cy="6.5" r="4.5"/><line x1="10.5" y1="10.5" x2="14" y2="14"/></svg>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name, code, or class..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">Students</h2>
          <p className="mt-0.5 text-xs text-slate-500">{total} total entries</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['#', 'Student Code', 'Name', 'Father Name', 'Current Class', 'Level', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="px-4 py-12 text-center">
                  <div className="flex items-center justify-center gap-3 text-slate-400">
                    <svg className="animate-spin" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="10" cy="10" r="8" strokeOpacity=".25"/><path d="M10 2a8 8 0 0 1 8 8" strokeLinecap="round"/></svg>
                    Loading...
                  </div>
                </td></tr>
              ) : visible.length === 0 ? (
                <tr><td colSpan="8" className="px-4 py-12 text-center text-slate-400">No students found</td></tr>
              ) : visible.map((s, i) => (
                <tr key={s._id} className="border-b border-slate-50 transition hover:bg-cyan-50/40">
                  <td className="px-4 py-3 text-xs text-slate-400">{(page - 1) * limit + i + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{s.studentCode || '—'}</td>
                  <td className="px-4 py-3 text-slate-700">{`${s.firstName || ''} ${s.lastName || ''}`.trim() || s.user?.name || '—'}</td>
                  <td className="px-4 py-3 text-slate-700">{s.fatherName || '—'}</td>
                  <td className="px-4 py-3 text-slate-700">{s.currentClass?.className || 'Not Assigned'}</td>
                  <td className="px-4 py-3 text-slate-700">{s.currentLevel || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {s.status || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => { setModal({ type: 'transfer', student: s }); setNewClass(''); }}
                        className="rounded-xl bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-600 transition hover:bg-sky-100">
                        Transfer
                      </button>
                      <button onClick={() => { setModal({ type: 'promote', student: s }); setNewClass(''); }}
                        className="rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-100">
                        Promote
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <StaffPagination page={page} limit={limit} total={total} onPageChange={setPage} onPageSizeChange={v => { setLimit(v); setPage(1); }} />

      {/* Transfer/Promote Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="h-1 w-full rounded-t-2xl bg-gradient-to-r from-cyan-500 to-sky-500" />
            <div className="p-6 space-y-4">
              <h3 className="text-base font-semibold text-slate-900 capitalize">{modal.type} Student</h3>
              <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                <p className="font-medium">{`${modal.student.firstName || ''} ${modal.student.lastName || ''}`.trim() || modal.student.user?.name}</p>
                <p className="text-slate-500 mt-0.5">Current Class: {modal.student.currentClass?.className || 'Not Assigned'}</p>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {modal.type === 'transfer' ? 'Transfer to Class' : 'Promote to Class'} <span className="text-rose-500">*</span>
                </label>
                <select value={newClass} onChange={e => setNewClass(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100">
                  <option value="">Select Class</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.className || c.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button onClick={() => setModal(null)} className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button onClick={handleAction} disabled={saving || !newClass}
                  className="rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700 disabled:opacity-60 capitalize">
                  {saving ? 'Processing...' : modal.type}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </StaffPageLayout>
  );
};

export default ClassAssignment;
