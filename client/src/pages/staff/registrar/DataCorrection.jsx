import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';
import StaffPageLayout from '../shared/StaffPageLayout';

const DataCorrection = () => {
  const [students, setStudents]   = useState([]);
  const [selected, setSelected]   = useState(null);
  const [logs, setLogs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [correction, setCorrection] = useState(null);
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState({ text: '', error: false });

  useEffect(() => { fetchStudents(); }, []);
  useEffect(() => { if (selected) fetchLogs(selected._id); }, [selected]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students/all');
      setStudents(res.data.data || []);
    } catch { setMsg({ text: 'Failed to load students', error: true }); }
    finally { setLoading(false); }
  };

  const fetchLogs = async (id) => {
    try {
      const res = await api.get(`/students/Student/${id}/audit-logs`);
      setLogs(res.data.data || []);
    } catch { setLogs([]); }
  };

  const notify = (text, error = false) => {
    setMsg({ text, error });
    setTimeout(() => setMsg({ text: '', error: false }), 3000);
  };

  const openCorrection = (field, value) =>
    setCorrection({ field, oldValue: value, newValue: value, reason: '' });

  const submitCorrection = async () => {
    if (!correction.newValue || !correction.reason) return;
    setSaving(true);
    try {
      await api.post(`/students/${selected._id}/correct-data`, correction);
      notify('Data corrected successfully');
      setCorrection(null);
      fetchStudents();
      fetchLogs(selected._id);
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to submit correction', true);
    } finally { setSaving(false); }
  };

  const FIELDS = [
    ['First Name', 'firstName'], ['Last Name', 'lastName'],
    ['Father Name', 'fatherName'], ['Grandfather Name', 'grandfatherName'],
    ['Phone', 'phone'], ['Email', 'email'],
    ['Student Code', 'studentCode'], ['Current Level', 'currentLevel'], ['Status', 'status'],
  ];

  return (
    <StaffPageLayout title="Data Correction & Audit Trail" subtitle="Correct student data with full audit trail and change history.">
      {msg.text && (
        <div className={`flex items-center gap-3 rounded-2xl border px-5 py-3 text-sm ${msg.error ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          {msg.text}
        </div>
      )}

      {/* Students Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">Students</h2>
          <p className="mt-0.5 text-xs text-slate-500">Select a student to view and correct their data</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['#', 'Student Code', 'Name', 'Father Name', 'Class', 'Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="px-4 py-12 text-center">
                  <div className="flex items-center justify-center gap-3 text-slate-400">
                    <svg className="animate-spin" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="10" cy="10" r="8" strokeOpacity=".25"/><path d="M10 2a8 8 0 0 1 8 8" strokeLinecap="round"/></svg>
                    Loading...
                  </div>
                </td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan="6" className="px-4 py-12 text-center text-slate-400">No students found</td></tr>
              ) : students.map((s, i) => (
                <tr key={s._id} className={`border-b border-slate-50 transition hover:bg-cyan-50/40 ${selected?._id === s._id ? 'bg-cyan-50' : ''}`}>
                  <td className="px-4 py-3 text-xs text-slate-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{s.studentCode || '—'}</td>
                  <td className="px-4 py-3 text-slate-700">{`${s.firstName || ''} ${s.lastName || ''}`.trim() || s.user?.name || '—'}</td>
                  <td className="px-4 py-3 text-slate-700">{s.fatherName || '—'}</td>
                  <td className="px-4 py-3 text-slate-700">{s.currentClass?.className || 'Not Assigned'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(s === selected ? null : s)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${selected?._id === s._id ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-cyan-100 hover:text-cyan-700'}`}>
                      {selected?._id === s._id ? 'Close' : 'View & Correct'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Correction Panel */}
      {selected && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-1 w-full rounded-t-2xl bg-gradient-to-r from-cyan-500 to-sky-500" />
          <div className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                Editing: {`${selected.firstName || ''} ${selected.lastName || ''}`.trim() || selected.user?.name}
              </h2>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {FIELDS.map(([label, key]) => (
                <div key={key} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                    <p className="mt-1 text-sm font-medium text-slate-800">{selected[key] || '—'}</p>
                  </div>
                  <button onClick={() => openCorrection(key, selected[key] || '')}
                    className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 transition hover:bg-cyan-100">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2l2 2-7 7H2v-2l7-7z"/></svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Audit Logs */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">Change History</h3>
              {logs.length === 0 ? (
                <p className="text-sm text-slate-400">No change history found</p>
              ) : (
                <div className="space-y-2">
                  {logs.map((log, i) => (
                    <div key={i} className="rounded-xl border-l-4 border-cyan-400 bg-slate-50 px-4 py-2.5">
                      <p className="text-sm text-slate-700">
                        <span className="font-medium">{log.changedBy?.name || 'Unknown'}</span> changed{' '}
                        <span className="font-medium text-slate-900">{log.field}</span> from{' '}
                        <span className="text-rose-600">{String(log.oldValue)}</span> to{' '}
                        <span className="text-emerald-600">{String(log.newValue)}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {log.reason} · {new Date(log.timestamp || log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Correction Modal */}
      {correction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="h-1 w-full rounded-t-2xl bg-gradient-to-r from-cyan-500 to-sky-500" />
            <div className="p-6 space-y-4">
              <h3 className="text-base font-semibold text-slate-900">Correct: {correction.field}</h3>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Current Value</label>
                <input disabled value={correction.oldValue} className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-500" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">New Value <span className="text-rose-500">*</span></label>
                <input value={correction.newValue} onChange={e => setCorrection(c => ({ ...c, newValue: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Reason <span className="text-rose-500">*</span></label>
                <textarea rows={3} value={correction.reason} onChange={e => setCorrection(c => ({ ...c, reason: e.target.value }))} placeholder="Explain why this correction is needed..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100" />
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button onClick={() => setCorrection(null)} className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button onClick={submitCorrection} disabled={saving || !correction.newValue || !correction.reason}
                  className="rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700 disabled:opacity-60">
                  {saving ? 'Saving...' : 'Submit Correction'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </StaffPageLayout>
  );
};

export default DataCorrection;
