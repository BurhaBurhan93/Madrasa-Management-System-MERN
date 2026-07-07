import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';
import { FiSearch, FiRefreshCw } from 'react-icons/fi';

const PAGE_SIZE = 10;

const BorrowedBooks = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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
    try { const { data } = await api.get('/library/borrowed'); setItems(Array.isArray(data) ? data : data.data || []); }
    catch { setItems([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);
  useEffect(() => { setPage(1); }, [searchTerm, statusFilter]);

  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return items.filter(item => {
      const matches = !s || (item.book?.title || '').toLowerCase().includes(s) || `${item.borrower?.firstName || ''} ${item.borrower?.lastName || ''}`.toLowerCase().includes(s);
      if (!matches) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      return true;
    });
  }, [items, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getStatusBadge = (status) => {
    if (status === 'returned') return 'bg-emerald-100 text-emerald-700';
    if (status === 'borrowed') return 'bg-amber-100 text-amber-700';
    return 'bg-slate-100 text-slate-700';
  };

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
          <div><h1 className="text-2xl font-bold text-slate-900">{t('library.borrowedBooks')}</h1><p className="mt-1 text-sm text-slate-500">{t('library.trackBorrowed')}</p></div>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t('common.search') + '...'} className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm">
            <option value="all">{t('common.all')}</option>
            <option value="borrowed">{t('library.borrowed')}</option>
            <option value="returned">{t('common.returned')}</option>
          </select>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="px-5 py-3 font-semibold text-slate-600">{t('library.book')}</th><th className="px-5 py-3 font-semibold text-slate-600">{t('library.borrowerName')}</th><th className="px-5 py-3 font-semibold text-slate-600">{t('library.borrowDate')}</th><th className="px-5 py-3 font-semibold text-slate-600">{t('library.dueDate')}</th><th className="px-5 py-3 font-semibold text-slate-600">{t('common.status')}</th></tr></thead>
            <tbody>
              {filtered.length === 0 && !loading && <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">{t('common.noRecords')}</td></tr>}
              {paginated.map(item => (
                <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-600 font-medium">{item.book?.title || '-'}</td>
                  <td className="px-5 py-3 text-slate-600">{item.borrower ? `${item.borrower.firstName || ''} ${item.borrower.lastName || ''}`.trim() || item.borrower._id : '-'}</td>
                  <td className="px-5 py-3 text-slate-600">{item.borrowedAt ? new Date(item.borrowedAt).toLocaleDateString() : '-'}</td>
                  <td className="px-5 py-3 text-slate-600">{item.returnDate ? new Date(item.returnDate).toLocaleDateString() : '-'}</td>
                  <td className="px-5 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(item.status)}`}>{item.status || '-'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">{t('common.page')} {page} {t('common.of')} {totalPages}</span>
            <div className="flex gap-1.5">
              <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${page === p ? 'bg-slate-800 text-white shadow-md' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{p}</button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BorrowedBooks;
