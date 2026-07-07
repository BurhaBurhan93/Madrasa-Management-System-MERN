import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../lib/api';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';

const LIMIT = 10;

const Designations = () => {
  const { t } = useTranslation('admin');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ designationTitle: '', jobLevel: 'entry', department: '', minQualification: '', salaryRangeMin: '', salaryRangeMax: '', jobDescription: '', responsibilities: '', status: 'active' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get('/hr/departments', { params: { limit: 100 } });
      const result = Array.isArray(data) ? data : data.data || [];
      setDepartments(result);
    } catch { setDepartments([]); }
  };

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
      const { data } = await api.get('/hr/designations', { params: { page, limit: LIMIT, search: debouncedSearch || undefined } });
      const result = Array.isArray(data) ? { data, total: data.length, totalPages: 1 } : data;
      setItems(result.data || []);
      setTotalPages(result.totalPages || 1);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchDepartments(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      salaryRangeMin: form.salaryRangeMin ? Number(form.salaryRangeMin) : undefined,
      salaryRangeMax: form.salaryRangeMax ? Number(form.salaryRangeMax) : undefined,
    };
    try {
      if (editingId) await api.put(`/hr/designations/${editingId}`, payload);
      else await api.post('/hr/designations', payload);
      setShowForm(false);
      setEditingId(null);
      setForm({ designationTitle: '', jobLevel: 'entry', department: '', minQualification: '', salaryRangeMin: '', salaryRangeMax: '', jobDescription: '', responsibilities: '', status: 'active' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (item) => {
    setForm({
      designationTitle: item.designationTitle || '',
      jobLevel: item.jobLevel || 'entry',
      department: typeof item.department === 'object' ? (item.department?._id || '') : (item.department || ''),
      minQualification: item.minQualification || '',
      salaryRangeMin: item.salaryRangeMin ?? '',
      salaryRangeMax: item.salaryRangeMax ?? '',
      jobDescription: item.jobDescription || '',
      responsibilities: item.responsibilities || '',
      status: item.status || 'active',
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try { await api.delete(`/hr/designations/${deleteTarget}`); setDeleteTarget(null); fetchData(); } catch (err) { console.error(err); }
  };

  const getDeptName = (dept) => {
    if (!dept) return '-';
    if (typeof dept === 'object') return dept.departmentName || dept.departmentCode || '-';
    const found = departments.find(d => d._id === dept);
    return found ? (found.departmentName || found.departmentCode || dept) : dept;
  };

  const levelColors = { entry: 'bg-blue-100 text-blue-700', mid: 'bg-green-100 text-green-700', senior: 'bg-purple-100 text-purple-700', manager: 'bg-amber-100 text-amber-700' };

  const pageNumbers = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
    pageNumbers.push(i);
  }

  if (loading && items.length === 0) return <div className="flex items-center justify-center py-20 text-slate-500">{t('common.loading')}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">{t('hr.designations')}</h1><p className="mt-1 text-sm text-slate-500">{t('hr.manageDesignations')}</p></div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ designationTitle: '', jobLevel: 'entry', department: '', minQualification: '', salaryRangeMin: '', salaryRangeMax: '', jobDescription: '', responsibilities: '', status: 'active' }); }} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700">{showForm ? t('common.cancel') : '+ ' + t('hr.addNewDesignation')}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('hr.designationTitle')}</label><input value={form.designationTitle} onChange={e => setForm({ ...form, designationTitle: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('hr.departments')}</label>
              <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required>
                <option value="">{t('common.select')}</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.departmentName || d.departmentCode}</option>)}
              </select>
            </div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('hr.jobLevel')}</label>
              <select value={form.jobLevel} onChange={e => setForm({ ...form, jobLevel: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="entry">{t('hr.entry')}</option>
                <option value="mid">{t('hr.mid')}</option>
                <option value="senior">{t('hr.senior')}</option>
                <option value="manager">{t('hr.manager')}</option>
              </select>
            </div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('hr.minQualification')}</label><input value={form.minQualification} onChange={e => setForm({ ...form, minQualification: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('hr.salaryMin')}</label><input type="number" value={form.salaryRangeMin} onChange={e => setForm({ ...form, salaryRangeMin: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('hr.salaryMax')}</label><input type="number" value={form.salaryRangeMax} onChange={e => setForm({ ...form, salaryRangeMax: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium text-slate-700">{t('hr.jobDescription')}</label><textarea value={form.jobDescription} onChange={e => setForm({ ...form, jobDescription: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" rows={2} /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('common.status')}</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="active">{t('common.active')}</option>
                <option value="inactive">{t('common.inactive')}</option>
              </select>
            </div>
          </div>
          <button type="submit" className="mt-4 rounded-lg bg-cyan-600 px-6 py-2 text-sm font-medium text-white hover:bg-cyan-700">{editingId ? t('common.update') : t('hr.addNewDesignation')}</button>
        </form>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('common.search')} className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm placeholder-slate-400 focus:border-cyan-500 focus:outline-none" />
        </div>
        <div className="text-sm text-slate-500">{t('common.showing')} {items.length} {t('common.of')} {totalPages > 0 ? `~${totalPages * LIMIT}` : '0'}</div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50"><tr>
            <th className="px-5 py-3 font-semibold text-slate-600">{t('hr.designationTitle')}</th>
            <th className="px-5 py-3 font-semibold text-slate-600">{t('hr.departments')}</th>
            <th className="px-5 py-3 font-semibold text-slate-600">{t('hr.jobLevel')}</th>
            <th className="px-5 py-3 font-semibold text-slate-600">{t('hr.salaryRange')}</th>
            <th className="px-5 py-3 font-semibold text-slate-600">{t('common.status')}</th>
            <th className="px-5 py-3 font-semibold text-slate-600">{t('common.actions')}</th>
          </tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">{t('common.noRecords')}</td></tr>}
            {items.map(item => (
              <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{item.designationTitle || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{getDeptName(item.department)}</td>
                <td className="px-5 py-3"><span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${levelColors[item.jobLevel] || 'bg-slate-100 text-slate-600'}`}>{t(`hr.${item.jobLevel}`) || item.jobLevel}</span></td>
                <td className="px-5 py-3 text-slate-600">{item.salaryRangeMin ?? item.salaryRangeMax ? `${item.salaryRangeMin ?? '?'} - ${item.salaryRangeMax ?? '?'}` : '-'}</td>
                <td className="px-5 py-3"><span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{t(`common.${item.status}`) || item.status}</span></td>
                <td className="px-5 py-3"><div className="flex gap-2">
                  <button onClick={() => handleEdit(item)} className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">{t('common.edit')}</button>
                  <button onClick={() => setDeleteTarget(item._id)} className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">{t('common.delete')}</button>
                </div></td>
              </tr>
            ))}
            {loading && items.length > 0 && <tr><td colSpan={6} className="px-5 py-3 text-center text-sm text-slate-400">{t('common.loading')}</td></tr>}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">{t('common.previous')}</button>
          {pageNumbers.map(p => (
            <button key={p} onClick={() => setPage(p)} className={`min-w-[36px] rounded-lg px-3 py-1.5 text-sm font-medium ${p === page ? 'bg-cyan-600 text-white shadow-sm' : 'border border-slate-300 text-slate-600 hover:bg-slate-100'}`}>{p}</button>
          ))}
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

export default Designations;
