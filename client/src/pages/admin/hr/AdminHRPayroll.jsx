import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';
import CalendarDatePicker from '../../../components/UIHelper/CalendarDatePicker';

const LIMIT = 10;

const EMPLOYEE_TYPES = ['teacher','admin','finance','registrar','hr','librarian','kitchen','security','support','maintenance'];

const HRPayroll = () => {
  const { t } = useTranslation('admin');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewMode, setViewMode] = useState('card');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({
    employeeType: '',
    basicSalary: '',
    allowanceAmount: '0',
    housingAllowance: '0',
    foodAllowance: '0',
    transportAllowance: '0',
    overtimeRate: '0',
    deductionType: '',
    taxPercentage: '0',
    effectiveFrom: '',
    status: 'active'
  });

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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (debouncedSearch) params.search = debouncedSearch;
      const { data } = await api.get('/payroll/salary-structures', { params });
      const result = Array.isArray(data) ? { data, total: data.length, totalPages: 1 } : data;
      setItems(result.data || []);
      setTotalPages(result.totalPages || Math.ceil((result.total || 1) / LIMIT) || 1);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      employeeType: form.employeeType,
      basicSalary: Number(form.basicSalary),
      allowanceAmount: Number(form.allowanceAmount),
      housingAllowance: Number(form.housingAllowance),
      foodAllowance: Number(form.foodAllowance),
      transportAllowance: Number(form.transportAllowance),
      overtimeRate: Number(form.overtimeRate),
      deductionType: form.deductionType || undefined,
      taxPercentage: Number(form.taxPercentage),
      effectiveFrom: form.effectiveFrom,
      status: form.status
    };
    try {
      if (editingId) await api.put(`/payroll/salary-structures/${editingId}`, payload);
      else await api.post('/payroll/salary-structures', payload);
      setShowForm(false);
      setEditingId(null);
      setForm({ employeeType: '', basicSalary: '', allowanceAmount: '0', housingAllowance: '0', foodAllowance: '0', transportAllowance: '0', overtimeRate: '0', deductionType: '', taxPercentage: '0', effectiveFrom: '', status: 'active' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (item) => {
    setForm({
      employeeType: item.employeeType || '',
      basicSalary: item.basicSalary ?? '',
      allowanceAmount: item.allowanceAmount ?? '0',
      housingAllowance: item.housingAllowance ?? '0',
      foodAllowance: item.foodAllowance ?? '0',
      transportAllowance: item.transportAllowance ?? '0',
      overtimeRate: item.overtimeRate ?? '0',
      deductionType: item.deductionType || '',
      taxPercentage: item.taxPercentage ?? '0',
      effectiveFrom: item.effectiveFrom ? new Date(item.effectiveFrom).toISOString().slice(0, 10) : '',
      status: item.status || 'active'
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try { await api.delete(`/payroll/salary-structures/${deleteTarget}`); setDeleteTarget(null); fetchData(); } catch (err) { console.error(err); }
  };

  const totalActive = items.filter(i => i.status === 'active').length;
  const totalInactive = items.filter(i => i.status === 'inactive').length;

  const pageNumbers = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) pageNumbers.push(i);

  if (loading && items.length === 0) return <div className="flex items-center justify-center py-20 text-slate-500">{t('common.loading')}</div>;

  return (
    <div className="w-full min-h-screen p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('hr.hrPayroll')}</h1>
          <p className="text-slate-500 mt-1">{t('hr.managePayroll')}</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ employeeType: '', basicSalary: '', allowanceAmount: '0', housingAllowance: '0', foodAllowance: '0', transportAllowance: '0', overtimeRate: '0', deductionType: '', taxPercentage: '0', effectiveFrom: '', status: 'active' }); }} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700">{showForm ? t('common.cancel') : '+ ' + t('hr.addNew')}</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('common.total')}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{items.length}</p>
        </div>
        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('common.active')}</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{totalActive}</p>
        </div>
        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('common.inactive')}</p>
          <p className="mt-1 text-2xl font-bold text-slate-500">{totalInactive}</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('hr.employeeType')}</label>
              <select value={form.employeeType} onChange={e => setForm({ ...form, employeeType: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required>
                <option value="">{t('common.select')}</option>
                {EMPLOYEE_TYPES.map(et => <option key={et} value={et}>{et.charAt(0).toUpperCase() + et.slice(1)}</option>)}
              </select>
            </div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('hr.basicSalary')}</label><input type="number" min="0" value={form.basicSalary} onChange={e => setForm({ ...form, basicSalary: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('hr.allowanceAmount')}</label><input type="number" min="0" value={form.allowanceAmount} onChange={e => setForm({ ...form, allowanceAmount: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('hr.housingAllowance')}</label><input type="number" min="0" value={form.housingAllowance} onChange={e => setForm({ ...form, housingAllowance: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('hr.foodAllowance')}</label><input type="number" min="0" value={form.foodAllowance} onChange={e => setForm({ ...form, foodAllowance: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('hr.transportAllowance')}</label><input type="number" min="0" value={form.transportAllowance} onChange={e => setForm({ ...form, transportAllowance: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('hr.overtimeRate')}</label><input type="number" min="0" value={form.overtimeRate} onChange={e => setForm({ ...form, overtimeRate: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('hr.deductionType')}</label><input value={form.deductionType} onChange={e => setForm({ ...form, deductionType: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder={t('common.optional')} /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('hr.taxPercentage')}</label><input type="number" min="0" max="100" value={form.taxPercentage} onChange={e => setForm({ ...form, taxPercentage: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('hr.effectiveFrom')}</label><CalendarDatePicker value={form.effectiveFrom} onChange={(date) => setForm({ ...form, effectiveFrom: date })} placeholder={t('common.select')} required /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('common.status')}</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="active">{t('common.active')}</option>
                <option value="inactive">{t('common.inactive')}</option>
              </select>
            </div>
          </div>
          <button type="submit" className="mt-4 rounded-lg bg-cyan-600 px-6 py-2 text-sm font-medium text-white hover:bg-cyan-700">{editingId ? t('common.update') : t('common.create')}</button>
        </form>
      )}

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-xs">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('common.search')} className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm placeholder-slate-400 focus:border-cyan-500 focus:outline-none" />
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
          {items.map(item => {
            const totalAllowance = (item.allowanceAmount || 0) + (item.housingAllowance || 0) + (item.foodAllowance || 0) + (item.transportAllowance || 0);
            const taxAmount = ((item.taxPercentage || 0) / 100) * ((item.basicSalary || 0) + totalAllowance);
            const netAmount = (item.basicSalary || 0) + totalAllowance - taxAmount;
            return (
              <div key={item._id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-shadow min-w-0">
                <div className="flex justify-between items-start mb-3 gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900">{item.employeeType ? item.employeeType.charAt(0).toUpperCase() + item.employeeType.slice(1) : '-'}</h3>
                    <p className="text-xs text-slate-400">{t('hr.effectiveFrom')}: {item.effectiveFrom ? new Date(item.effectiveFrom).toLocaleDateString() : '-'}</p>
                  </div>
                  <span className={`shrink-0 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{t(`common.${item.status}`)}</span>
                </div>
                <div className="space-y-1.5 text-sm mb-3">
                  <div className="flex justify-between gap-2"><span className="text-slate-500 shrink-0">{t('hr.basicSalary')}:</span><span className="font-medium text-slate-900 text-right">{(item.basicSalary || 0).toLocaleString()} AFN</span></div>
                  <div className="flex justify-between gap-2"><span className="text-slate-500 shrink-0">{t('hr.totalAllowance')}:</span><span className="font-medium text-slate-900 text-right">{totalAllowance.toLocaleString()} AFN</span></div>
                  <div className="flex justify-between gap-2"><span className="text-slate-500 shrink-0">{t('hr.taxPercentage')}:</span><span className="font-medium text-slate-900 text-right">{item.taxPercentage || 0}%</span></div>
                  <div className="border-t border-slate-100 pt-1.5 flex justify-between gap-2"><span className="text-slate-600 shrink-0 font-medium">{t('hr.netAmount')}:</span><span className="font-bold text-slate-900 text-right">{netAmount.toLocaleString()} AFN</span></div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(item)} className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">{t('common.edit')}</button>
                  <button onClick={() => setDeleteTarget(item._id)} className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">{t('common.delete')}</button>
                </div>
              </div>
            );
          })}
          {items.length === 0 && !loading && <div className="col-span-full text-center py-20 text-slate-400">{t('common.noRecords')}</div>}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50"><tr>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('hr.employeeType')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('hr.basicSalary')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('hr.totalAllowance')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('hr.taxPercentage')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('hr.effectiveFrom')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('common.status')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('common.actions')}</th>
              </tr></thead>
              <tbody>
                {items.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400">{t('common.noRecords')}</td></tr>}
                {items.map(item => {
                  const totalAllowance = (item.allowanceAmount || 0) + (item.housingAllowance || 0) + (item.foodAllowance || 0) + (item.transportAllowance || 0);
                  return (
                    <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium text-slate-800">{item.employeeType ? item.employeeType.charAt(0).toUpperCase() + item.employeeType.slice(1) : '-'}</td>
                      <td className="px-5 py-3 text-slate-600">{(item.basicSalary || 0).toLocaleString()}</td>
                      <td className="px-5 py-3 text-slate-600">{totalAllowance.toLocaleString()}</td>
                      <td className="px-5 py-3 text-slate-600">{item.taxPercentage || 0}%</td>
                      <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{item.effectiveFrom ? new Date(item.effectiveFrom).toLocaleDateString() : '-'}</td>
                      <td className="px-5 py-3"><span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{t(`common.${item.status}`)}</span></td>
                      <td className="px-5 py-3"><div className="flex gap-1">
                        <button onClick={() => handleEdit(item)} className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">{t('common.edit')}</button>
                        <button onClick={() => setDeleteTarget(item._id)} className="rounded-lg bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">{t('common.delete')}</button>
                      </div></td>
                    </tr>
                  );
                })}
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

export default HRPayroll;
