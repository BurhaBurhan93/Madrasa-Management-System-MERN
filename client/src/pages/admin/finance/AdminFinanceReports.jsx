import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../lib/api';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import { FiRefreshCw, FiTrendingUp, FiTrendingDown, FiDollarSign, FiPercent } from 'react-icons/fi';

const PAGE_SIZE = 10;

const FinancialReports = () => {
  const { t } = useTranslation('admin');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try { const { data: res } = await api.get('/finance/reports?type=financial-reports&period=' + period); setData(Array.isArray(res) ? res : res.data || []); }
      catch { setData([]); } finally { setLoading(false); }
    };
    fetch();
  }, [period]);
  useEffect(() => { const lang = readStoredLanguage(); if (lang) i18n.changeLanguage(lang); }, []);
  useEffect(() => { setPage(1); }, [period]);

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const paginated = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => ({
    totalIncome: data.reduce((s, r) => s + (Number(r.totalIncome) || 0), 0),
    totalExpense: data.reduce((s, r) => s + (Number(r.totalExpense) || 0), 0),
    netBalance: data.reduce((s, r) => s + (Number(r.netBalance) || 0), 0),
    count: data.length,
  }), [data]);

  const collectionRate = stats.totalIncome > 0 ? ((stats.totalIncome - stats.totalExpense) / stats.totalIncome * 100).toFixed(1) : 0;

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('finance.financialReports')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('finance.comprehensiveFinancial')}</p>
        </div>
        <select value={period} onChange={e => setPeriod(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm">
          <option value="daily">{t('attendance.daily')}</option>
          <option value="weekly">{t('attendance.weekly')}</option>
          <option value="monthly">{t('attendance.monthly')}</option>
          <option value="yearly">{t('common.yearly')}</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: t('finance.totalIncome'), value: `₨${stats.totalIncome.toLocaleString()}`, gradient: 'from-emerald-500 to-teal-600', icon: FiTrendingUp },
          { label: t('finance.totalExpenses'), value: `₨${stats.totalExpense.toLocaleString()}`, gradient: 'from-rose-500 to-pink-600', icon: FiTrendingDown },
          { label: t('finance.netProfit'), value: `₨${stats.netBalance.toLocaleString()}`, gradient: stats.netBalance >= 0 ? 'from-blue-500 to-indigo-600' : 'from-red-500 to-rose-600', icon: FiDollarSign },
          { label: t('finance.collectionsRate'), value: `${collectionRate}%`, gradient: 'from-cyan-500 to-teal-600', icon: FiPercent },
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

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600">#</th>
                <th className="px-4 py-3 font-semibold text-slate-600">{t('finance.reportType')}</th>
                <th className="px-4 py-3 font-semibold text-slate-600">{t('attendance.period')}</th>
                <th className="px-4 py-3 font-semibold text-slate-600">{t('finance.totalIncome')}</th>
                <th className="px-4 py-3 font-semibold text-slate-600">{t('finance.totalExpenses')}</th>
                <th className="px-4 py-3 font-semibold text-slate-600">{t('finance.netBalance')}</th>
                <th className="px-4 py-3 font-semibold text-slate-600">{t('common.status')}</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-14 text-center text-slate-400">{t('finance.noData')}</td></tr>
              )}
              {paginated.map((row, i) => (
                <tr key={row._id || i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-500">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{row.reportType || '-'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{row.reportPeriod || '-'}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-600">₨{(row.totalIncome || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 font-semibold text-rose-600">₨{(row.totalExpense || 0).toLocaleString()}</td>
                  <td className={`px-4 py-3 font-semibold ${(row.netBalance || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ₨{(row.netBalance || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                      row.approvalStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      row.approvalStatus === 'rejected' ? 'bg-rose-100 text-rose-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>{row.approvalStatus || 'draft'}</span>
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

export default FinancialReports;
