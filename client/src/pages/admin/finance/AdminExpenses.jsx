import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../lib/api';
import CalendarDatePicker from "../../../components/UIHelper/CalendarDatePicker";
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import { FiSearch, FiRefreshCw, FiDollarSign, FiPlus, FiEdit2, FiTrash2, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';

const PAGE_SIZE = 10;
const INITIAL_FORM = { title: '', category: '', amount: '', date: '', vendor: '', description: '', status: 'pending' };

const AdminExpenses = () => {
  const { t } = useTranslation('admin');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try { const { data } = await api.get('/finance/expenses'); setExpenses(Array.isArray(data) ? data : data.data || []); }
    catch { setExpenses([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);
  useEffect(() => { const lang = readStoredLanguage(); if (lang) i18n.changeLanguage(lang); }, []);
  useEffect(() => { setPage(1); }, [searchTerm, statusFilter]);

  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase();
    let result = expenses.filter(e =>
      (e.title || '').toLowerCase().includes(s) ||
      (e.category || '').toLowerCase().includes(s) ||
      (e.paidTo || '').toLowerCase().includes(s)
    );
    if (statusFilter !== 'all') result = result.filter(e => e.approvalStatus === statusFilter);
    return result;
  }, [expenses, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => ({
    total: expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0),
    pending: expenses.filter(e => e.approvalStatus === 'pending').reduce((s, e) => s + (Number(e.amount) || 0), 0),
    approved: expenses.filter(e => e.approvalStatus === 'approved' || e.approvalStatus === 'paid').reduce((s, e) => s + (Number(e.amount) || 0), 0),
    rejected: expenses.filter(e => e.approvalStatus === 'rejected').reduce((s, e) => s + (Number(e.amount) || 0), 0),
    pendingCount: expenses.filter(e => e.approvalStatus === 'pending').length,
    approvedCount: expenses.filter(e => e.approvalStatus === 'approved' || e.approvalStatus === 'paid').length,
  }), [expenses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title,
      category: form.category,
      amount: Number(form.amount) || 0,
      expenseDate: form.date || undefined,
      paidTo: form.vendor || undefined,
      remarks: form.description || undefined,
      approvalStatus: form.status || 'pending',
    };
    try {
      if (editingId) await api.put(`/finance/expenses/${editingId}`, payload);
      else await api.post('/finance/expenses', payload);
      setShowForm(false); setEditingId(null); setForm(INITIAL_FORM);
      fetchData();
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const handleEdit = (item) => {
    setForm({
      title: item.title || '',
      category: item.category || '',
      amount: item.amount || '',
      date: item.expenseDate ? item.expenseDate.slice(0, 10) : '',
      vendor: item.paidTo || '',
      description: item.remarks || '',
      status: item.approvalStatus || 'pending',
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('finance.deleteExpenseConfirm'))) return;
    try { await api.delete(`/finance/expenses/${id}`); fetchData(); } catch (err) { console.error(err); }
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
          <h1 className="text-2xl font-bold text-slate-900">{t('finance.expenses')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('finance.trackExpenses')}</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(INITIAL_FORM); }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:shadow-xl hover:from-cyan-600 hover:to-blue-700 transition-all"
        >
          <FiPlus size={16} /> {showForm ? t('common.cancel') : t('finance.addExpense')}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: t('finance.totalExpenses'), value: `₨${stats.total.toLocaleString()}`, gradient: 'from-slate-500 to-slate-600', icon: FiDollarSign },
          { label: t('finance.pending'), value: `₨${stats.pending.toLocaleString()} (${stats.pendingCount})`, gradient: 'from-amber-500 to-orange-600', icon: FiClock },
          { label: t('finance.approved'), value: `₨${stats.approved.toLocaleString()} (${stats.approvedCount})`, gradient: 'from-emerald-500 to-teal-600', icon: FiCheckCircle },
          { label: t('finance.rejected'), value: `₨${stats.rejected.toLocaleString()}`, gradient: 'from-rose-500 to-pink-600', icon: FiXCircle },
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
            placeholder={t('finance.searchExpenses') || 'Search expenses...'}
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm"
        >
          <option value="all">{t('common.all')}</option>
          {['pending', 'approved', 'rejected'].map(s => (
            <option key={s} value={s}>{t(`finance.${s}`) || s}</option>
          ))}
        </select>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('finance.title')} *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('finance.category')}</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                <option value="">{t('finance.select')}</option>
                <option value="utilities">{t('finance.utilities')}</option>
                <option value="supplies">{t('finance.supplies')}</option>
                <option value="maintenance">{t('finance.maintenance')}</option>
                <option value="transport">{t('finance.transport')}</option>
                <option value="equipment">{t('finance.equipment')}</option>
                <option value="other">{t('finance.other')}</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('common.amount')} *</label>
              <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('common.date')}</label>
              <CalendarDatePicker value={form.date} onChange={(date) => setForm({ ...form, date })} placeholder={t('finance.selectDate')} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('finance.vendor')}</label>
              <input value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('common.status')}</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                <option value="pending">{t('finance.pending')}</option>
                <option value="approved">{t('finance.approved')}</option>
                <option value="rejected">{t('finance.rejected')}</option>
              </select>
            </div>
          </div>
          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-slate-700">{t('common.description')}</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" rows={2} />
          </div>
          <div className="mt-4 flex gap-3">
            <button type="submit" disabled={saving || !form.title || !form.amount} className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {saving ? <span className="flex items-center justify-center gap-2"><FiRefreshCw className="animate-spin h-4 w-4" /> {t('common.saving')}</span> : editingId ? t('common.update') : t('finance.addExpense')}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm(INITIAL_FORM); }} className="flex-1 rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">{t('common.cancel')}</button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('finance.title')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('finance.category')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('common.amount')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('common.date')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('finance.vendor')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('common.status')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-14 text-center text-slate-400">{t('finance.noExpenses')}</td></tr>
              )}
              {paginated.map(e => (
                <tr key={e._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-800">{e.title}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">{e.category || '-'}</span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-slate-800">₨ {(e.amount || 0).toLocaleString()}</td>
                  <td className="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">
                    {e.expenseDate ? new Date(e.expenseDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500">{e.paidTo || '-'}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                      e.approvalStatus === 'approved' || e.approvalStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                      e.approvalStatus === 'rejected' ? 'bg-rose-100 text-rose-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {e.approvalStatus === 'approved' || e.approvalStatus === 'paid' ? <FiCheckCircle className="h-3 w-3" /> :
                       e.approvalStatus === 'rejected' ? <FiXCircle className="h-3 w-3" /> :
                       <FiClock className="h-3 w-3" />}
                      {t(`finance.${e.approvalStatus}`) || e.approvalStatus || 'pending'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => handleEdit(e)} className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 transition-colors" title={t('common.edit')}><FiEdit2 size={14} /></button>
                      <button onClick={() => handleDelete(e._id)} className="rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 transition-colors" title={t('common.delete')}><FiTrash2 size={14} /></button>
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

export default AdminExpenses;
