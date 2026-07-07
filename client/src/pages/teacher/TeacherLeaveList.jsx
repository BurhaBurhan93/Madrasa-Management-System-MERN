import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';
import { PANEL_PAGE_BG } from '../../Constatns/pageStyles';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

const MOCK = [
  { _id: '1', leaveType: { leaveTypeName: 'Annual Leave', leaveCode: 'AL' }, startDate: '2026-07-01', endDate: '2026-07-05', reason: 'Family vacation to visit parents', status: 'approved', leaveDays: 5 },
  { _id: '2', leaveType: { leaveTypeName: 'Sick Leave', leaveCode: 'SL' }, startDate: '2026-06-15', endDate: '2026-06-16', reason: 'Medical appointment and recovery', status: 'approved', leaveDays: 2 },
  { _id: '3', leaveType: { leaveTypeName: 'Personal Leave', leaveCode: 'PL' }, startDate: '2026-06-28', endDate: '2026-06-28', reason: 'Personal errand', status: 'pending', leaveDays: 1 },
  { _id: '4', leaveType: { leaveTypeName: 'Emergency Leave', leaveCode: 'EL' }, startDate: '2026-05-10', endDate: '2026-05-12', reason: 'Family emergency', status: 'rejected', leaveDays: 3 },
  { _id: '5', leaveType: { leaveTypeName: 'Annual Leave', leaveCode: 'AL' }, startDate: '2026-08-15', endDate: '2026-08-20', reason: 'Hajj preparation', status: 'pending', leaveDays: 6 },
];

const TeacherLeaveList = () => {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [detailModal, setDetailModal] = useState(null);

  const fieldCls = 'rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200';

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/teacher/leaves');
      const data = await parseJsonSafe(res);
      if (data.success && data.data?.length > 0) setLeaves(data.data);
      else setLeaves(MOCK);
    } catch (e) {
      console.error(e);
      setLeaves(MOCK);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-GB');
  };

  const getDays = (l) => {
    if (l.leaveDays) return l.leaveDays;
    if (l.startDate && l.endDate) {
      const diff = Math.ceil((new Date(l.endDate) - new Date(l.startDate)) / (1000 * 60 * 60 * 24)) + 1;
      return isNaN(diff) ? '-' : Math.max(1, diff);
    }
    return '-';
  };

  const filtered = leaves.filter((l) => {
    return statusFilter === '' || l.status === statusFilter;
  });

  const stats = {
    total: leaves.length,
    pending: leaves.filter((l) => l.status === 'pending').length,
    approved: leaves.filter((l) => l.status === 'approved').length,
    rejected: leaves.filter((l) => l.status === 'rejected').length,
  };

  const statCards = [
    { label: 'Total', value: stats.total, accent: 'bg-cyan-500' },
    { label: 'Pending', value: stats.pending, accent: 'bg-amber-500' },
    { label: 'Approved', value: stats.approved, accent: 'bg-emerald-500' },
    { label: 'Rejected', value: stats.rejected, accent: 'bg-rose-500' },
  ];

  const renderLoading = () => (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500 dark:border-slate-700 dark:border-t-cyan-400" />
      <span className="ml-3 text-sm text-slate-500 dark:text-slate-400">Loading...</span>
    </div>
  );

  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mb-4 text-5xl">📅</div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No leave applications found</p>
    </div>
  );

  const renderTable = () => (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">Leave Type</th>
              <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">From</th>
              <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">To</th>
              <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">Days</th>
              <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">Reason</th>
              <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
              <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l._id} className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-800/30">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      {l.leaveType?.leaveCode || '?'}
                    </div>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {l.leaveType?.leaveTypeName || '-'}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{formatDate(l.startDate)}</td>
                <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{formatDate(l.endDate)}</td>
                <td className="px-5 py-4 text-center text-slate-600 dark:text-slate-300">{getDays(l)}</td>
                <td className="max-w-xs truncate px-5 py-4 text-slate-600 dark:text-slate-300">{l.reason || l.leaveReason || '-'}</td>
                <td className="px-5 py-4">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusColors[l.status] || ''}`}>
                    {l.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => setDetailModal(l)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDetailModal = () => {
    if (!detailModal) return null;
    const l = detailModal;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDetailModal(null)}>
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-700 dark:bg-slate-800" onClick={(e) => e.stopPropagation()}>
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Leave Details</h3>
            <button onClick={() => setDetailModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-slate-100 pb-3 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Leave Type</span>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{l.leaveType?.leaveTypeName || '-'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-3 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Code</span>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{l.leaveType?.leaveCode || '-'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-3 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">From</span>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{formatDate(l.startDate)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-3 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">To</span>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{formatDate(l.endDate)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-3 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Days</span>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{getDays(l)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-3 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Reason</span>
              <span className="max-w-[60%] text-right text-sm font-medium text-slate-900 dark:text-slate-100">{l.reason || l.leaveReason || '-'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-3 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Status</span>
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusColors[l.status] || ''}`}>{l.status}</span>
            </div>
            {l.rejectionReason && (
              <div className="flex justify-between border-b border-slate-100 pb-3 dark:border-slate-700">
                <span className="text-sm text-slate-500 dark:text-slate-400">Rejection Reason</span>
                <span className="max-w-[60%] text-right text-sm font-medium text-rose-600 dark:text-rose-400">{l.rejectionReason}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Applied On</span>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{formatDate(l.requestDate || l.createdAt)}</span>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setDetailModal(null)}
              className="rounded-2xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={PANEL_PAGE_BG}>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Leave Management</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">View and manage your leave applications</p>
          </div>
          <button
            onClick={() => navigate('/teacher/leaves/apply')}
            className="rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-cyan-700 hover:shadow-md"
          >
            + Apply Leave
          </button>
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((c) => (
            <button key={c.label} onClick={() => setStatusFilter(c.label === 'All' ? '' : c.label.toLowerCase())} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/50">
              <div className={`absolute inset-x-0 top-0 h-1 ${c.accent}`} />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{c.label}</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{c.value}</p>
            </button>
          ))}
        </section>

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <div className="flex items-center gap-4">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={fieldCls}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            {statusFilter && (
              <button onClick={() => setStatusFilter('')} className="text-xs text-slate-500 underline dark:text-slate-400">Clear filter</button>
            )}
          </div>
        </div>

        {loading ? renderLoading() : filtered.length === 0 ? renderEmpty() : renderTable()}
      </div>
      {renderDetailModal()}
    </div>
  );
};

export default TeacherLeaveList;
