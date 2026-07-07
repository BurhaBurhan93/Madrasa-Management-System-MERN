import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../lib/api';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import { FiRefreshCw, FiTrendingUp, FiTrendingDown, FiSearch } from 'react-icons/fi';

const PAGE_SIZE = 10;

const AdminTransactions = () => {
  const { t } = useTranslation('admin');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '', search: '' });
  const [page, setPage] = useState(1);

  useEffect(() => { const lang = readStoredLanguage(); if (lang) i18n.changeLanguage(lang); }, []);

  const fetchData = async () => {
    setLoading(true);
    try { const { data } = await api.get('/finance/transactions'); setTransactions(Array.isArray(data) ? data : data.data || []); }
    catch { setTransactions([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);
  useEffect(() => { setPage(1); }, [filter]);

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      if (filter.type && tx.transactionType !== filter.type) return false;
      if (filter.search && !(tx.description || '').toLowerCase().includes(filter.search.toLowerCase())) return false;
      return true;
    });
  }, [transactions, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => ({
    income: filtered.filter(tx => tx.transactionType === 'income').reduce((s, tx) => s + (Number(tx.amount) || 0), 0),
    expense: filtered.filter(tx => tx.transactionType === 'expense').reduce((s, tx) => s + (Number(tx.amount) || 0), 0),
  }), [filtered]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-400">
          <FiRefreshCw className="animate-spin h-6 w-6" />
          <span className="text-lg">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('finance.transactions')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('finance.viewTransactions')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {[
          { label: t('finance.totalIncome'), value: `₨${stats.income.toLocaleString()}`, gradient: 'from-emerald-500 to-teal-600', icon: FiTrendingUp },
          { label: t('finance.totalExpense'), value: `₨${stats.expense.toLocaleString()}`, gradient: 'from-rose-500 to-pink-600', icon: FiTrendingDown },
          { label: t('finance.netBalance'), value: `₨${(stats.income - stats.expense).toLocaleString()}`, gradient: 'from-cyan-500 to-blue-600', icon: FiRefreshCw },
        ].map((stat, i) => (
          <div key={i} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.gradient} p-5 text-white shadow-lg`}>
            <div className="relative z-10">
              <p className="text-sm font-medium text-white/80">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold truncate">{stat.value}</p>
            </div>
            <stat.icon className="absolute right-3 top-3 h-12 w-12 text-white/10" />
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input value={filter.search} onChange={e => setFilter({ ...filter, search: e.target.value })} placeholder={t('finance.searchTransactions')} className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
        </div>
        <select value={filter.type} onChange={e => setFilter({ ...filter, type: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm">
          <option value="">{t('finance.allTypes')}</option>
          <option value="income">{t('finance.income')}</option>
          <option value="expense">{t('finance.expense')}</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('common.date')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('common.description')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('common.category')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('common.type')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('finance.amount')}</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-14 text-center text-slate-400">{t('finance.noTransactions')}</td></tr>
              )}
              {paginated.map(tx => (
                <tr key={tx._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">
                    {tx.transactionDate ? new Date(tx.transactionDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-800">{tx.description || '-'}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{tx.category || '-'}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                      tx.transactionType === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {tx.transactionType === 'income' ? <FiTrendingUp className="h-3 w-3" /> : <FiTrendingDown className="h-3 w-3" />}
                      {t(`finance.${tx.transactionType}`) || tx.transactionType}
                    </span>
                  </td>
                  <td className={`px-5 py-3 font-semibold ${tx.transactionType === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.transactionType === 'income' ? '+' : '-'}₨ {(tx.amount || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
  );
};

export default AdminTransactions;
