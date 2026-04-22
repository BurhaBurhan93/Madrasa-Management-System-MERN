import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import StaffPageLayout from '../shared/StaffPageLayout';
import StaffPagination from '../shared/StaffPagination';

const statusVariant = (s) => {
  if (s === 'approved') return 'bg-emerald-100 text-emerald-700';
  if (s === 'rejected') return 'bg-rose-100 text-rose-700';
  return 'bg-amber-100 text-amber-700';
};

const EMPTY_FORM = {
  employee: '', leaveType: '', leaveReason: '', leaveDays: '',
  requestDate: new Date().toISOString().split('T')[0],
};

const LeaveManagement = () => {
  const [leaves, setLeaves]         = useState([]);
  const [employees, setEmployees]   = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [limit, setLimit]           = useState(10);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [rejectId, setRejectId]     = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchAll();
  }, [filterStatus]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [lRes, eRes, ltRes] = await Promise.all([
        api.get(filterStatus ? `/hr/leaves?status=${filterStatus}` : '/hr/leaves'),
        api.get('/hr/employees?status=active'),
        api.get('/hr/leave-types'),
      ]);
      if (lRes.data.success)  setLeaves(lRes.data.data);
      if (eRes.data.success)  setEmployees(eRes.data.data);
      if (ltRes.data.success) setLeaveTypes(ltRes.data.data);
    } catch { setError('Failed to load data'); }
    finally  { setLoading(false); }
  };

  const notify = (msg, isError = false) => {
    if (isError) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/hr/leaves', form);
      notify('Leave request submitted successfully');
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchAll();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to submit request', true);
    } finally { setSaving(false); }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/hr/leaves/${id}/approve`, {});
      notify('Leave approved');
      fetchAll();
    } catch { notify('Failed to approve leave', true); }
  };

  const handleReject = async () => {
    try {
      await api.put(`/hr/leaves/${rejectId}/reject`, { rejectionReason: rejectReason });
      notify('Leave rejected');
      setRejectId(null);
      setRejectReason('');
      fetchAll();
    } catch { notify('Failed to reject leave', true); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this leave request?')) return;
    try {
      await api.delete(`/hr/leaves/${id}`);
      notify('Leave request deleted');
      fetchAll();
    } catch { notify('Failed to delete', true); }
  };

  // client-side search + pagination
  const filtered = leaves.filter(l => {
    const q = search.toLowerCase();
    return !q ||
      l.employee?.fullName?.toLowerCase().includes(q) ||
      l.leaveType?.leaveTypeName?.toLowerCase().includes(q) ||
      l.status?.toLowerCase().includes(q);
  });
  const total   = filtered.length;
  const visible = filtered.slice((page - 1) * limit, page * limit);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <StaffPageLayout
      title="Leave Management"
      subtitle="Manage employee leave requests — approve, reject, or create new requests."
      actions={
        <button
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-2 rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700 active:scale-95"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/>
          </svg>
          New Request
        </button>
      }
    >
      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-700">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="8" cy="8" r="7"/><line x1="8" y1="4.5" x2="8" y2="8.5"/><circle cx="8" cy="11" r=".7" fill="currentColor"/></svg>
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-700">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="7"/><polyline points="5 8 7 10 11 6"/></svg>
          {success}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-1 w-full rounded-t-2xl bg-gradient-to-r from-cyan-500 to-sky-500" />
          <div className="p-6">
            <h2 className="mb-5 text-base font-semibold text-slate-900">New Leave Request</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Employee */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Employee <span className="text-rose-500">*</span></label>
                  <select required value={form.employee} onChange={e => set('employee', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100">
                    <option value="">Select Employee</option>
                    {employees.map(e => <option key={e._id} value={e._id}>{e.fullName} ({e.employeeCode})</option>)}
                  </select>
                </div>
                {/* Leave Type */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Leave Type <span className="text-rose-500">*</span></label>
                  <select required value={form.leaveType} onChange={e => set('leaveType', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100">
                    <option value="">Select Leave Type</option>
                    {leaveTypes.map(lt => <option key={lt._id} value={lt._id}>{lt.leaveTypeName} ({lt.leaveCode})</option>)}
                  </select>
                </div>
                {/* Days */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Number of Days <span className="text-rose-500">*</span></label>
                  <input required type="number" min="1" value={form.leaveDays} onChange={e => set('leaveDays', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100" />
                </div>
                {/* Request Date */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Request Date</label>
                  <input type="date" value={form.requestDate} onChange={e => set('requestDate', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100" />
                </div>
                {/* Reason */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Reason</label>
                  <textarea rows={3} value={form.leaveReason} onChange={e => set('leaveReason', e.target.value)} placeholder="Leave reason..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100" />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 rounded-2xl bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700 disabled:opacity-60">
                  {saving && <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="7" cy="7" r="5" strokeOpacity=".25"/><path d="M7 2a5 5 0 0 1 5 5" strokeLinecap="round"/></svg>}
                  {saving ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter + Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="6.5" cy="6.5" r="4.5"/><line x1="10.5" y1="10.5" x2="14" y2="14"/>
              </svg>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by employee, leave type, status..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100" />
            </div>
          </div>
          {/* Status Tabs */}
          <div className="flex gap-2">
            {[['', 'All'], ['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected']].map(([val, label]) => (
              <button key={val} onClick={() => { setFilterStatus(val); setPage(1); }}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${filterStatus === val ? 'bg-cyan-600 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:border-cyan-300 hover:bg-cyan-50'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Leave Requests</h2>
            <p className="mt-0.5 text-xs text-slate-500">{total} total entries</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['#', 'Employee', 'Leave Type', 'Days', 'Request Date', 'Reason', 'Status', 'Actions'].map(h => (
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
                <tr><td colSpan="8" className="px-4 py-12 text-center text-slate-400">No leave requests found</td></tr>
              ) : visible.map((leave, idx) => (
                <tr key={leave._id} className="border-b border-slate-50 transition hover:bg-cyan-50/40">
                  <td className="px-4 py-3 text-xs text-slate-400">{(page - 1) * limit + idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{leave.employee?.fullName || '—'}</td>
                  <td className="px-4 py-3 text-slate-700">{leave.leaveType?.leaveTypeName || '—'}</td>
                  <td className="px-4 py-3 text-slate-700">{leave.leaveDays ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                    {leave.requestDate ? new Date(leave.requestDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-500 max-w-[180px] truncate">{leave.leaveReason || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusVariant(leave.status)}`}>
                      {leave.status?.replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {leave.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(leave._id)} title="Approve"
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 7 5.5 10.5 12 4"/></svg>
                          </button>
                          <button onClick={() => { setRejectId(leave._id); setRejectReason(''); }} title="Reject"
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition hover:bg-rose-100">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="3" x2="11" y2="11"/><line x1="11" y1="3" x2="3" y2="11"/></svg>
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDelete(leave._id)} title="Delete"
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500">
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="1 3 12 3"/><path d="M4 3V2h5v1"/><path d="M2 3l.8 8h6.4L10 3"/></svg>
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

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="h-1 w-full rounded-t-2xl bg-gradient-to-r from-rose-500 to-rose-400" />
            <div className="p-6 space-y-4">
              <h3 className="text-base font-semibold text-slate-900">Rejection Reason</h3>
              <textarea rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Enter reason for rejection..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100" />
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button onClick={() => setRejectId(null)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                  Cancel
                </button>
                <button onClick={handleReject}
                  className="rounded-2xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700">
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </StaffPageLayout>
  );
};

export default LeaveManagement;
