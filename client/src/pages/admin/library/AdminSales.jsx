import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';
import { FiSearch, FiRefreshCw } from 'react-icons/fi';

const PAGE_SIZE = 10;

const BookSales = () => {
  const [items, setItems] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ book: '', student: '', quantity: '', unitPrice: '', saleDate: '' });

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
    try {
      const [salesRes, booksRes] = await Promise.all([
        api.get('/library/sales'),
        api.get('/library/books'),
      ]);
      setItems(Array.isArray(salesRes.data) ? salesRes.data : salesRes.data.data || []);
      setBooks(Array.isArray(booksRes.data) ? booksRes.data : booksRes.data.data || []);
    } catch { setItems([]); setBooks([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);
  useEffect(() => { setPage(1); }, [searchTerm]);

  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return items.filter(item =>
      (item.book?.title || '').toLowerCase().includes(s) ||
      String(item.receiptNo || '').toLowerCase().includes(s)
    );
  }, [items, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const qty = Number(form.quantity) || 0;
      const price = Number(form.unitPrice) || 0;
      const studentIsId = /^[0-9a-fA-F]{24}$/.test(form.student);
      await api.post('/library/sales', {
        book: form.book,
        student: studentIsId ? form.student : undefined,
        buyerName: studentIsId ? undefined : (form.student || undefined),
        quantity: qty,
        unitPrice: price,
        totalAmount: qty * price,
        saleDate: form.saleDate || undefined,
        receiptNo: `SL-${Date.now()}`,
      });
      setShowForm(false); setForm({ book: '', student: '', quantity: '', unitPrice: '', saleDate: '' }); fetchData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => { if (!window.confirm(t('library.deleteBookConfirm'))) return; try { await api.delete(`/library/sales/${id}`); fetchData(); } catch (err) { console.error(err); } };

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
          <div><h1 className="text-2xl font-bold text-slate-900">{t('library.bookSales')}</h1><p className="mt-1 text-sm text-slate-500">{t('library.trackSales')}</p></div>
          <button onClick={() => { setShowForm(!showForm); setForm({ book: '', student: '', quantity: '', unitPrice: '', saleDate: '' }); }} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700">{showForm ? t('common.cancel') : t('common.add')}</button>
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('library.bookTitle')}</label>
                <select value={form.book} onChange={e => setForm({ ...form, book: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required>
                  <option value="">{t('common.select')}</option>
                  {books.map(b => <option key={b._id} value={b._id}>{b.title}</option>)}
                </select>
              </div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('library.buyerName')}</label><input value={form.student} onChange={e => setForm({ ...form, student: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('library.quantity')}</label><input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" min="1" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('library.unitPrice')}</label><input type="number" value={form.unitPrice} onChange={e => setForm({ ...form, unitPrice: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" min="0" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('library.saleDate')}</label><input type="date" value={form.saleDate} onChange={e => setForm({ ...form, saleDate: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            </div>
            <button type="submit" className="mt-4 rounded-lg bg-cyan-600 px-6 py-2 text-sm font-medium text-white hover:bg-cyan-700">{t('common.create')}</button>
          </form>
        )}
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t('common.search') + '...'} className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm" />
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="px-5 py-3 font-semibold text-slate-600">{t('library.book')}</th><th className="px-5 py-3 font-semibold text-slate-600">{t('library.buyer')}</th><th className="px-5 py-3 font-semibold text-slate-600">{t('library.qty')}</th><th className="px-5 py-3 font-semibold text-slate-600">{t('library.price')}</th><th className="px-5 py-3 font-semibold text-slate-600">{t('library.saleDate')}</th><th className="px-5 py-3 font-semibold text-slate-600">{t('common.actions')}</th></tr></thead>
            <tbody>
              {filtered.length === 0 && !loading && <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">{t('common.noRecords')}</td></tr>}
              {paginated.map(item => (
                <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-600 font-medium">{item.book?.title || item.book || '-'}</td>
                  <td className="px-5 py-3 text-slate-600">{item.student?.firstName ? `${item.student.firstName} ${item.student.lastName || ''}` : item.buyerName || item.student || '-'}</td>
                  <td className="px-5 py-3 text-slate-600">{item.quantity || '-'}</td>
                  <td className="px-5 py-3 text-slate-600">{item.totalAmount ? `${t('common.currencyRs') || 'Rs.'} ${item.totalAmount}` : '-'}</td>
                  <td className="px-5 py-3 text-slate-600">{item.saleDate ? new Date(item.saleDate).toLocaleDateString() : '-'}</td>
                  <td className="px-5 py-3"><button onClick={() => handleDelete(item._id)} className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">{t('common.delete')}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">{t('common.page')} {page} {t('common.of')} {totalPages}</span>
            <div className="flex gap-1.5">
              <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">{t('common.previous') || 'Prev'}</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${page === p ? 'bg-slate-800 text-white shadow-md' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{p}</button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">{t('common.next') || 'Next'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookSales;
