import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';
import CalendarDatePicker from '../../../components/UIHelper/CalendarDatePicker';

const LIMIT = 10;

const LeaveManagement = () => {
  const { t } = useTranslation('admin');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [viewMode, setViewMode] = useState('card');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ employee: '', leaveType: '', requestDate: '', leaveDays: '', leaveReason: '', status: 'pending' });

  useEffect(() => {
    const syncLang = () => {
      const lang = readStoredLanguage('adminLang', 'en');
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    };
    syncLang();
    window.addEventListener('storage', syncLang);
    return () => window.removeEventListener('storage', syncLang);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const fetchOptions = async () => {
    try {
      const [empRes, ltRes] = await Promise.all([
        api.get('/hr/employees', { params: { limit: 200 } }),
        api.get('/hr/leave-types', { params: { limit: 100 } }),
      ]);
      const toArray = (r) => (Array.isArray(r.data) ? r.data : r.data?.data || []);
      setEmployees(toArray(empRes));
      setLeaveTypes(toArray(ltRes));
    } catch {}
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/hr/leaves', { params });
      const result = Array.isArray(data) ? { data, total: data.length, totalPages: 1 } : data;
      setItems(result.data || []);
      setTotalPages(result.totalPages || 1);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchOptions(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, leaveDays: form.leaveDays ? Number(form.leaveDays) : undefined };
    try {
      if (editingId) await api.put(`/hr/leaves/${editingId}`, payload);
      else await api.post('/hr/leaves', payload);
      setShowForm(false);
      setEditingId(null);
      setForm({ employee: '', leaveType: '', requestDate: '', leaveDays: '', leaveReason: '', status: 'pending' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (item) => {
    setForm({
      employee: typeof item.employee === 'object' ? (item.employee?._id || '') : (item.employee || ''),
      leaveType: typeof item.leaveType === 'object' ? (item.leaveType?._id || '') : (item.leaveType || ''),
      requestDate: item.requestDate ? new Date(item.requestDate).toISOString().slice(0, 10) : '',
      leaveDays: item.leaveDays ?? '',
      leaveReason: item.leaveReason || '',
      status: item.status || 'pending',
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try { await api.delete(`/hr/leaves/${deleteTarget}`); setDeleteTarget(null); fetchData(); } catch (err) { console.error(err); }
  };

  const handleApproveReject = async (id, newStatus) => {
    try {
      if (newStatus === 'approved') await api.put(`/hr/leaves/${id}/approve`, {});
      else await api.put(`/hr/leaves/${id}/reject`, {});
      fetchData();
    } catch (err) { console.error(err); }
  };

  const getEmployeeName = (emp) => {
    if (!emp) return '-';
    if (typeof emp === 'object') return emp.fullName || emp.employeeCode || '-';
    const found = employees.find(e => e._id === emp);
    return found ? (found.fullName || found.employeeCode || emp) : emp;
  };

  const getLeaveTypeName = (lt) => {
    if (!lt) return '-';
    if (typeof lt === 'object') return lt.leaveTypeName || lt.leaveCode || lt.name || '-';
    const found = leaveTypes.find(l => l._id === lt);
    return found ? (found.leaveTypeName || found.leaveCode || found.name || lt) : lt;
  };

  const statusColors = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  const pageNumbers = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) pageNumbers.push(i);

  if (loading && items.length === 0) return <div className="flex items-center justify-center py-20 text-slate-500">{t('common.loading')}</div>;

  return (
    <div className="w-full min-h-screen p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('hr.leaveManagement')}</h1>
          <p className="text-slate-500 mt-1">{t('hr.manageLeave')}</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ employee: '', leaveType: '', requestDate: '', leaveDays: '', leaveReason: '', status: 'pending' }); }} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700">{showForm ? t('common.cancel') : '+ ' + t('hr.addNewLeave')}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('common.employee')}</label>
              <select value={form.employee} onChange={e => setForm({ ...form, employee: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required>
                <option value="">{t('common.select')}</option>
                {employees.map(e => <option key={e._id} value={e._id}>{e.fullName || e.employeeCode}</option>)}
              </select>
            </div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('hr.leaveType')}</label>
              <select value={form.leaveType} onChange={e => setForm({ ...form, leaveType: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required>
                <option value="">{t('common.select')}</option>
                {leaveTypes.map(lt => <option key={lt._id} value={lt._id}>{lt.leaveTypeName || lt.leaveCode || lt.name}</option>)}
              </select>
            </div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('hr.requestDate')}</label><CalendarDatePicker value={form.requestDate} onChange={(date) => setForm({ ...form, requestDate: date })} placeholder={t('common.select')} /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('hr.leaveDays')}</label><input type="number" min="1" value={form.leaveDays} onChange={e => setForm({ ...form, leaveDays: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('common.status')}</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="pending">{t('common.pending')}</option>
                <option value="approved">{t('common.approved')}</option>
                <option value="rejected">{t('common.rejected')}</option>
              </select>
            </div>
            <div className="md:col-span-3"><label className="mb-1 block text-sm font-medium text-slate-700">{t('common.reason')}</label><textarea value={form.leaveReason} onChange={e => setForm({ ...form, leaveReason: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" rows={2} /></div>
          </div>
          <button type="submit" className="mt-4 rounded-lg bg-cyan-600 px-6 py-2 text-sm font-medium text-white hover:bg-cyan-700">{editingId ? t('common.update') : t('common.create')}</button>
        </form>
      )}

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative w-full max-w-xs">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('common.search')} className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm placeholder-slate-400 focus:border-cyan-500 focus:outline-none" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">{t('common.allStatus')}</option>
            <option value="pending">{t('common.pending')}</option>
            <option value="approved">{t('common.approved')}</option>
            <option value="rejected">{t('common.rejected')}</option>
          </select>
        </div>
        <div className="flex gap-2 items-center">
          <div className="text-sm text-slate-500">{t('common.showing')} {items.length} {t('common.of')} {totalPages > 0 ? `~${totalPages * LIMIT}` : '0'}</div>
          <div className="flex rounded-lg border border-slate-300 overflow-hidden">
            <button onClick={() => setViewMode('card')} className={`px-3 py-2 text-sm ${viewMode === 'card' ? 'bg-cyan-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </button>
            <button onClick={() => setViewMode('table')} className={`px-3 py-2 text-sm ${viewMode === 'table' ? 'bg-cyan-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item._id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-shadow min-w-0">
              <div className="flex justify-between items-start mb-3 gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900 truncate" title={getEmployeeName(item.employee)}>{getEmployeeName(item.employee)}</h3>
                  <p className="text-xs text-slate-400 truncate">{getLeaveTypeName(item.leaveType)}</p>
                </div>
                <span className={`shrink-0 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[item.status] || 'bg-slate-100 text-slate-600'}`}>{t(`common.${item.status}`) || item.status}</span>
              </div>
              <div className="space-y-1.5 text-sm mb-3">
                <div className="flex justify-between gap-2"><span className="text-slate-500 shrink-0">{t('hr.requestDate')}:</span><span className="font-medium text-slate-900 text-right">{item.requestDate ? new Date(item.requestDate).toLocaleDateString() : '-'}</span></div>
                <div className="flex justify-between gap-2"><span className="text-slate-500 shrink-0">{t('hr.days')}:</span><span className="font-medium text-slate-900 text-right">{item.leaveDays ?? '-'}</span></div>
                {item.leaveReason && <div className="flex justify-between gap-2"><span className="text-slate-500 shrink-0">{t('common.reason')}:</span><span className="font-medium text-slate-900 text-right truncate min-w-0" title={item.leaveReason}>{item.leaveReason}</span></div>}
              </div>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(item)} className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">{t('common.edit')}</button>
                  <button onClick={() => setDeleteTarget(item._id)} className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">{t('common.delete')}</button>
                </div>
                <div className="flex gap-1">
                  {item.status === 'pending' && (
                    <>
                      <button onClick={() => handleApproveReject(item._id, 'approved')} className="rounded-lg bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-100">{t('common.approve')}</button>
                      <button onClick={() => handleApproveReject(item._id, 'rejected')} className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100">{t('common.reject')}</button>
                    </>
                  )}
                  <button onClick={() => window.open(`/admin/hr/employees?search=${encodeURIComponent(getEmployeeName(item.employee))}`, '_self')} className="text-xs text-cyan-600 hover:text-cyan-900 font-medium">{t('hr.viewProfile')}</button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && !loading && <div className="col-span-full text-center py-20 text-slate-400">{t('common.noRecords')}</div>}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50"><tr>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('common.employee')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('common.type')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('hr.requestDate')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('hr.days')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('common.status')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('common.actions')}</th>
              </tr></thead>
              <tbody>
                {items.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">{t('common.noRecords')}</td></tr>}
                {items.map(item => (
                  <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">
                      <div className="truncate max-w-[160px]" title={getEmployeeName(item.employee)}>{getEmployeeName(item.employee)}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-600 truncate max-w-[120px]" title={getLeaveTypeName(item.leaveType)}>{getLeaveTypeName(item.leaveType)}</td>
                    <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{item.requestDate ? new Date(item.requestDate).toLocaleDateString() : '-'}</td>
                    <td className="px-5 py-3 text-slate-600">{item.leaveDays ?? '-'}</td>
                    <td className="px-5 py-3"><span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[item.status] || 'bg-slate-100 text-slate-600'}`}>{t(`common.${item.status}`) || item.status}</span></td>
                    <td className="px-5 py-3"><div className="flex gap-1 flex-wrap">
                      {item.status === 'pending' && <><button onClick={() => handleApproveReject(item._id, 'approved')} className="rounded-lg bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100">{t('common.approve')}</button><button onClick={() => handleApproveReject(item._id, 'rejected')} className="rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100">{t('common.reject')}</button></>}
                      <button onClick={() => handleEdit(item)} className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">{t('common.edit')}</button>
                      <button onClick={() => setDeleteTarget(item._id)} className="rounded-lg bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">{t('common.delete')}</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">{t('common.previous')}</button>
          {pageNumbers.map(p => <button key={p} onClick={() => setPage(p)} className={`min-w-[36px] rounded-lg px-3 py-1.5 text-sm font-medium ${p === page ? 'bg-cyan-600 text-white shadow-sm' : 'border border-slate-300 text-slate-600 hover:bg-slate-100'}`}>{p}</button>)}
          <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">{t('common.next')}</button>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900">{t('common.confirmDelete')}</h3>
            <p className="mt-2 text-sm text-slate-500">{t('hr.deleteRecordConfirm')}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">{t('common.cancel')}</button>
              <button onClick={confirmDelete} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">{t('common.delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
