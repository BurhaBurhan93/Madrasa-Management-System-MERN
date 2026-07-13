import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';
import { FiSearch, FiRefreshCw } from 'react-icons/fi';

const PAGE_SIZE = 10;

const BookCategories = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const { t } = useTranslation('admin');

  useEffect(() => {
    const syncLang = () => {
      const lang = readStoredLanguage('adminLang', 'en');
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    };
    syncLang();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try { const { data } = await api.get('/library/categories'); setItems(Array.isArray(data) ? data : data.data || []); }
    catch { setItems([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);
  useEffect(() => { setPage(1); }, [searchTerm]);

  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return items.filter(item =>
      (item.name || '').toLowerCase().includes(s) ||
      (item.description || '').toLowerCase().includes(s)
    );
  }, [items, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { if (editingId) await api.put(`/library/categories/${editingId}`, form); else await api.post('/library/categories', form); setShowForm(false); setEditingId(null); setForm({ name: '', description: '' }); fetchData(); } catch (err) { console.error(err); }
  };
  const handleEdit = (item) => { setForm({ name: item.name || '', description: item.description || '' }); setEditingId(item._id); setShowForm(true); };
  const handleDelete = async (id) => { if (!window.confirm(t('library.deleteBookConfirm'))) return; try { await api.delete(`/library/categories/${id}`); fetchData(); } catch (err) { console.error(err); } };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-3 text-slate-400">
        <FiRefreshCw className="animate-spin h-6 w-6" />
        <span className="text-lg">{t('common.loading')}</span>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">{t('library.bookCategories')}</h1><p className="mt-1 text-sm text-slate-500">{t('library.manageCategories')}</p></div>
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', description: '' }); }} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700">{showForm ? t('common.cancel') : t('common.add')}</button>
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('library.categoryName')}</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('library.categoryDescription')}</label><input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            </div>
            <button type="submit" className="mt-4 rounded-lg bg-cyan-600 px-6 py-2 text-sm font-medium text-white hover:bg-cyan-700">{editingId ? t('common.edit') : t('common.create')}</button>
          </form>
        )}
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t('common.search') + '...'} className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm" />
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="px-5 py-3 font-semibold text-slate-600">{t('library.categoryName')}</th><th className="px-5 py-3 font-semibold text-slate-600">{t('library.categoryDescription')}</th><th className="px-5 py-3 font-semibold text-slate-600">{t('common.actions')}</th></tr></thead>
            <tbody>
              {filtered.length === 0 && !loading && <tr><td colSpan={3} className="px-5 py-10 text-center text-slate-400">{t('common.noRecords')}</td></tr>}
              {paginated.map(item => (
                <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-600 font-medium">{item.name || '-'}</td>
                  <td className="px-5 py-3 text-slate-600">{item.description || '-'}</td>
                  <td className="px-5 py-3"><div className="flex gap-2"><button onClick={() => handleEdit(item)} className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">{t('common.edit')}</button><button onClick={() => handleDelete(item._id)} className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">{t('common.delete')}</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">{t('common.page')} {page} {t('common.of')} {totalPages}</span>
            <div className="flex gap-1.5">
              <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">{t('common.previous')}</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${page === p ? 'bg-slate-800 text-white shadow-md' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{p}</button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">{t('common.next')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookCategories;
