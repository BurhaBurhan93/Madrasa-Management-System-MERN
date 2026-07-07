import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';

const LIMIT = 10;

const AdminKitchenSuppliers = () => {
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
  const [viewMode, setViewMode] = useState('card');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '', itemsSupplied: '', notes: '', status: 'active' });

  useEffect(() => {
    const syncLang = () => { const lang = readStoredLanguage('adminLang', 'en'); if (i18n.language !== lang) i18n.changeLanguage(lang); };
    syncLang();
    window.addEventListener('storage', syncLang);
    return () => window.removeEventListener('storage', syncLang);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/kitchen/suppliers', { params });
      const result = Array.isArray(data) ? { data, total: data.length, totalPages: 1 } : data;
      setItems(result.data || []);
      setTotalPages(result.totalPages || Math.ceil((result.total || 1) / LIMIT) || 1);
    } catch { setItems([]); } finally { setLoading(false); }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      phone: form.phone || undefined,
      address: form.address || undefined,
      itemsSupplied: form.itemsSupplied ? form.itemsSupplied.split(',').map(s => s.trim()).filter(Boolean) : [],
      notes: form.notes || undefined,
      status: form.status,
    };
    try {
      if (editingId) await api.put(`/kitchen/suppliers/${editingId}`, payload);
      else await api.post('/kitchen/suppliers', payload);
      setShowForm(false); setEditingId(null);
      setForm({ name: '', phone: '', address: '', itemsSupplied: '', notes: '', status: 'active' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name || '',
      phone: item.phone || '',
      address: item.address || '',
      itemsSupplied: Array.isArray(item.itemsSupplied) ? item.itemsSupplied.join(', ') : (item.itemsSupplied || ''),
      notes: item.notes || '',
      status: item.status || 'active',
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try { await api.delete(`/kitchen/suppliers/${deleteTarget}`); setDeleteTarget(null); fetchData(); } catch (err) { console.error(err); }
  };

  const activeCount = items.filter(i => i.status === 'active').length;

  const pageNumbers = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) pageNumbers.push(i);

  if (loading && items.length === 0) return <div className="flex items-center justify-center py-20 text-slate-500">{t('common.loading')}</div>;

  return (
    <div className="w-full min-h-screen p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('kitchen.suppliers')}</h1>
          <p className="text-slate-500 mt-1">{t('kitchen.manageSuppliers')}</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', phone: '', address: '', itemsSupplied: '', notes: '', status: 'active' }); }} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700">{showForm ? t('common.cancel') : '+ ' + t('kitchen.addNew')}</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('common.total')}</p><p className="mt-1 text-2xl font-bold text-slate-900">{items.length}</p></div>
        <div className="rounded-xl bg-white border border-green-200 p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-green-600">{t('common.active')}</p><p className="mt-1 text-2xl font-bold text-green-700">{activeCount}</p></div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('common.name')}</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('common.phone')}</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('common.address')}</label><input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('kitchen.itemsSupplied')}</label><input value={form.itemsSupplied} onChange={e => setForm({ ...form, itemsSupplied: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder={t('kitchen.itemsHint')} /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('kitchen.notes')}</label><input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('common.status')}</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="active">{t('common.active')}</option><option value="inactive">{t('common.inactive')}</option></select></div>
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
            <option value="active">{t('common.active')}</option>
            <option value="inactive">{t('common.inactive')}</option>
          </select>
        </div>
        <div className="flex gap-2 items-center">
          <div className="text-sm text-slate-500">{t('common.showing')} {items.length} {t('common.of')} {totalPages > 0 ? `~${totalPages * LIMIT}` : '0'}</div>
          <div className="flex rounded-lg border border-slate-300 overflow-hidden">
            <button onClick={() => setViewMode('card')} className={`px-3 py-2 text-sm ${viewMode === 'card' ? 'bg-cyan-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg></button>
            <button onClick={() => setViewMode('table')} className={`px-3 py-2 text-sm ${viewMode === 'table' ? 'bg-cyan-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
          </div>
        </div>
      </div>

      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item._id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-shadow min-w-0">
              <div className="flex justify-between items-start mb-3 gap-2">
                <div className="min-w-0 flex-1"><h3 className="font-semibold text-slate-900 truncate">{item.name}</h3></div>
                <span className={`shrink-0 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{t(`common.${item.status}`)}</span>
              </div>
              {item.phone && <p className="text-sm text-slate-500 mb-1"><span className="font-medium text-slate-600">{t('common.phone')}:</span> {item.phone}</p>}
              {item.address && <p className="text-sm text-slate-500 mb-1"><span className="font-medium text-slate-600">{t('common.address')}:</span> {item.address}</p>}
              {Array.isArray(item.itemsSupplied) && item.itemsSupplied.length > 0 && <div className="flex flex-wrap gap-1 mt-2 mb-3">{item.itemsSupplied.map((is, i) => <span key={i} className="rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-700">{is}</span>)}</div>}
              <div className="flex items-center gap-2 mt-3">
                <button onClick={() => handleEdit(item)} className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">{t('common.edit')}</button>
                <button onClick={() => setDeleteTarget(item._id)} className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">{t('common.delete')}</button>
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
                <th className="px-5 py-3 font-semibold text-slate-600">{t('common.name')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('common.phone')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('kitchen.itemsSupplied')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('common.status')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('common.actions')}</th>
              </tr></thead>
              <tbody>
                {items.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">{t('common.noRecords')}</td></tr>}
                {items.map(item => (
                  <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800 truncate max-w-[160px]" title={item.name}>{item.name}</td>
                    <td className="px-5 py-3 text-slate-600">{item.phone || '-'}</td>
                    <td className="px-5 py-3 text-slate-600 truncate max-w-[160px]" title={Array.isArray(item.itemsSupplied) ? item.itemsSupplied.join(', ') : item.itemsSupplied}>{Array.isArray(item.itemsSupplied) ? item.itemsSupplied.join(', ') : item.itemsSupplied || '-'}</td>
                    <td className="px-5 py-3"><span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{t(`common.${item.status}`)}</span></td>
                    <td className="px-5 py-3"><div className="flex gap-1">
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
          <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40">{t('common.previous')}</button>
          {pageNumbers.map(p => <button key={p} onClick={() => setPage(p)} className={`min-w-[36px] rounded-lg px-3 py-1.5 text-sm font-medium ${p === page ? 'bg-cyan-600 text-white shadow-sm' : 'border border-slate-300 text-slate-600 hover:bg-slate-100'}`}>{p}</button>)}
          <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40">{t('common.next')}</button>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900">{t('common.confirmDelete')}</h3>
            <p className="mt-2 text-sm text-slate-500">{t('kitchen.deleteItemConfirm')}</p>
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

export default AdminKitchenSuppliers;
