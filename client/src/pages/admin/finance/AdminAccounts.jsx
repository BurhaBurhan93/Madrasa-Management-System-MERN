import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../lib/api';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import { FiSearch, FiRefreshCw, FiDollarSign, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiBook } from 'react-icons/fi';

const PAGE_SIZE = 10;

const AdminAccounts = () => {
  const { t } = useTranslation('admin');
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ accountName: '', accountType: 'cash', openingBalance: '', description: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try { const { data } = await api.get('/finance/accounts'); setAccounts(Array.isArray(data) ? data : data.data || []); }
    catch { setAccounts([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);
  useEffect(() => { const lang = readStoredLanguage(); if (lang) i18n.changeLanguage(lang); }, []);
  useEffect(() => { setPage(1); }, [searchTerm, statusFilter]);

  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase();
    let result = accounts.filter(a =>
      (a.accountName || '').toLowerCase().includes(s) ||
      (a.accountType || '').toLowerCase().includes(s)
    );
    if (statusFilter === 'active') result = result.filter(a => a.status === 'active');
    else if (statusFilter === 'inactive') result = result.filter(a => a.status === 'inactive');
    return result;
  }, [accounts, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => ({
    total: accounts.length,
    balance: accounts.reduce((sum, a) => sum + (Number(a.currentBalance) || 0), 0),
    active: accounts.filter(a => a.status !== 'inactive').length,
  }), [accounts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      accountName: form.accountName,
      accountType: form.accountType,
      openingBalance: Number(form.openingBalance) || 0,
    };
    try {
      if (editingId) await api.put(`/finance/accounts/${editingId}`, payload);
      else await api.post('/finance/accounts', payload);
      setShowForm(false); setEditingId(null); setForm({ accountName: '', accountType: 'cash', openingBalance: '', description: '' });
      fetchData();
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const handleEdit = (item) => {
    setForm({ accountName: item.accountName || '', accountType: item.accountType || 'cash', openingBalance: item.openingBalance || '', description: '' });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('finance.deleteAccountConfirm'))) return;
    try { await api.delete(`/finance/accounts/${id}`); fetchData(); } catch (err) { console.error(err); }
  };

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
          <h1 className="text-2xl font-bold text-slate-900">{t('finance.accounts')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('finance.manageAccounts')}</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ accountName: '', accountType: 'cash', openingBalance: '', description: '' }); }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:shadow-xl hover:from-cyan-600 hover:to-blue-700 transition-all"
        >
          <FiPlus size={16} /> {showForm ? t('common.cancel') : t('finance.addAccount')}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {[
          { label: t('finance.totalAccounts'), value: stats.total, gradient: 'from-slate-500 to-slate-600', icon: FiBook },
          { label: t('finance.totalBalance'), value: `₨${stats.balance.toLocaleString()}`, gradient: 'from-emerald-500 to-teal-600', icon: FiDollarSign },
          { label: t('common.active'), value: stats.active, gradient: 'from-cyan-500 to-blue-600', icon: FiCheck },
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
          <input
            type="text"
            placeholder={t('finance.searchAccounts') || 'Search accounts...'}
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'inactive'].map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                statusFilter === f
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >{t(`common.${f}`)}</button>
          ))}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('finance.accountName')} *</label>
              <input value={form.accountName} onChange={e => setForm({ ...form, accountName: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('common.type')}</label>
              <select value={form.accountType} onChange={e => setForm({ ...form, accountType: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                <option value="cash">{t('finance.cash')}</option>
                <option value="petty_cash">{t('finance.pettyCash')}</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('finance.openingBalance')}</label>
              <input type="number" value={form.openingBalance} onChange={e => setForm({ ...form, openingBalance: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="submit" disabled={saving || !form.accountName} className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {saving ? <span className="flex items-center justify-center gap-2"><FiRefreshCw className="animate-spin h-4 w-4" /> {t('common.saving')}</span> : editingId ? t('common.update') : t('finance.createAccount')}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm({ accountName: '', accountType: 'cash', openingBalance: '', description: '' }); }} className="flex-1 rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">{t('common.cancel')}</button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('finance.accountName')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('common.type')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('finance.balance')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('common.status')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-14 text-center text-slate-400">{t('finance.noAccounts')}</td></tr>
              )}
              {paginated.map(a => (
                <tr key={a._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-800">{a.accountName}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 capitalize">{a.accountType || '-'}</span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-slate-800">₨ {(a.currentBalance || 0).toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                      a.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {a.status === 'active' ? <FiCheck className="h-3 w-3" /> : <FiX className="h-3 w-3" />}
                      {t(`common.${a.status}`) || a.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => handleEdit(a)} className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 transition-colors" title={t('common.edit')}><FiEdit2 size={14} /></button>
                      <button onClick={() => handleDelete(a._id)} className="rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 transition-colors" title={t('common.delete')}><FiTrash2 size={14} /></button>
                    </div>
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

export default AdminAccounts;
