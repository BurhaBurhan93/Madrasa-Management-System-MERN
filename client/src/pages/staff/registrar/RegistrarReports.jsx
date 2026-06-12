import React, { useState } from 'react';
import api from '../../../lib/api';
import StaffPageLayout from '../shared/StaffPageLayout';

const RegistrarReports = () => {
  const [filters, setFilters] = useState({ status: '', startDate: '', endDate: '' });
  const [loading, setLoading] = useState(false);
  const [report, setReport]   = useState(null);
  const [error, setError]     = useState('');

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v)));
      const res = await api.get(`/students/reports?${params}`);
      setReport(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report');
    } finally { setLoading(false); }
  };

  const exportCSV = () => {
    if (!report?.students?.length) return;
    const rows = report.students.map(s => [
      s.studentCode || '', `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.user?.name || '',
      s.fatherName || '', s.currentClass?.className || '', s.status || '',
      s.admissionDate ? new Date(s.admissionDate).toLocaleDateString() : ''
    ]);
    const csv = [['Code', 'Name', 'Father Name', 'Class', 'Status', 'Admission Date'], ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `student_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const set = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const STAT_CARDS = report ? [
    { label: 'Total Students', value: report.stats?.totalStudents || 0, color: 'from-cyan-500 to-sky-500' },
    { label: 'Active', value: report.stats?.activeStudents || 0, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Inactive', value: report.stats?.inactiveStudents || 0, color: 'from-amber-500 to-amber-600' },
    { label: 'Classes', value: Object.keys(report.stats?.byClass || {}).length, color: 'from-violet-500 to-violet-600' },
  ] : [];

  return (
    <StaffPageLayout
      title="Registrar Reports"
      subtitle="Generate and export comprehensive student reports."
      actions={report && (
        <button onClick={exportCSV} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 10V2"/><polyline points="4 7 7.5 10 11 7"/><path d="M2 13h11"/></svg>
          Export CSV
        </button>
      )}
    >
      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-1 w-full rounded-t-2xl bg-gradient-to-r from-cyan-500 to-sky-500" />
        <div className="p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Report Filters</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Status</label>
              <select value={filters.status} onChange={e => set('status', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100">
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Start Date</label>
              <input type="date" value={filters.startDate} onChange={e => set('startDate', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">End Date</label>
              <input type="date" value={filters.endDate} onChange={e => set('endDate', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100" />
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
          <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
            <button onClick={generate} disabled={loading}
              className="flex items-center gap-2 rounded-2xl bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700 disabled:opacity-60">
              {loading && <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="7" cy="7" r="5" strokeOpacity=".25"/><path d="M7 2a5 5 0 0 1 5 5" strokeLinecap="round"/></svg>}
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {report && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {STAT_CARDS.map(({ label, value, color }) => (
              <div key={label} className={`rounded-2xl bg-gradient-to-br ${color} p-5 text-white shadow-sm`}>
                <p className="text-sm font-medium text-white/80">{label}</p>
                <p className="mt-1 text-3xl font-bold">{value}</p>
              </div>
            ))}
          </div>

          {/* Class Distribution */}
          {Object.keys(report.stats?.byClass || {}).length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">Class Distribution</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 lg:grid-cols-4">
                {Object.entries(report.stats.byClass).map(([cls, count]) => (
                  <div key={cls} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <span className="text-sm font-medium text-slate-700">{cls}</span>
                    <span className="rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-semibold text-cyan-700">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Student Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">Student List</h2>
              <p className="mt-0.5 text-xs text-slate-500">{report.students?.length || 0} records</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['#', 'Code', 'Name', 'Father Name', 'Class', 'Status', 'Admission Date'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(report.students || []).map((s, i) => (
                    <tr key={s._id} className="border-b border-slate-50 hover:bg-cyan-50/40">
                      <td className="px-4 py-3 text-xs text-slate-400">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{s.studentCode || '—'}</td>
                      <td className="px-4 py-3 text-slate-700">{`${s.firstName || ''} ${s.lastName || ''}`.trim() || s.user?.name || '—'}</td>
                      <td className="px-4 py-3 text-slate-700">{s.fatherName || '—'}</td>
                      <td className="px-4 py-3 text-slate-700">{s.currentClass?.className || 'Not Assigned'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {s.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{s.admissionDate ? new Date(s.admissionDate).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!report && !loading && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-400 shadow-sm">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="8" y="4" width="24" height="32" rx="3"/><line x1="14" y1="14" x2="26" y2="14"/><line x1="14" y1="20" x2="26" y2="20"/><line x1="14" y1="26" x2="20" y2="26"/></svg>
          <p className="mt-3 text-sm font-medium">No report generated yet</p>
          <p className="mt-1 text-xs">Set your filters and click Generate Report</p>
        </div>
      )}
    </StaffPageLayout>
  );
};

export default RegistrarReports;
