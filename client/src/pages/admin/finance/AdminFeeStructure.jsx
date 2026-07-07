import React, { useState, useEffect, useMemo } from 'react';
import { FiDollarSign, FiCalendar, FiPlus, FiEdit2, FiTrash2, FiSearch, FiDownload, FiCheck, FiX, FiBook, FiRefreshCw } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';

const PAGE_SIZE = 10;
const INITIAL_FEE = { feeCode: '', feeName: '', class: '', feeType: 'tuition', amount: '', frequency: 'monthly', applicableFrom: '', applicableTo: '', isMandatory: true, status: 'active' };

const AdminFeeStructure = () => {
  const { t } = useTranslation('admin');
  const [feeStructures, setFeeStructures] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [feeFilter, setFeeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(INITIAL_FEE);
  const [saving, setSaving] = useState(false);

  useEffect(() => { const lang = readStoredLanguage(); if (lang) i18n.changeLanguage(lang); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [feeRes, clsRes] = await Promise.all([
        api.get('/finance/fee-structures'),
        api.get('/academic/classes'),
      ]);
      setFeeStructures(Array.isArray(feeRes.data) ? feeRes.data : feeRes.data?.data || []);
      setClasses(Array.isArray(clsRes.data) ? clsRes.data : clsRes.data?.data || []);
    } catch { setFeeStructures([]); setClasses([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);
  useEffect(() => { setPage(1); }, [searchTerm, feeFilter]);

  const filteredFees = useMemo(() => {
    const s = searchTerm.toLowerCase();
    let result = feeStructures.filter(f =>
      (f.feeName || '').toLowerCase().includes(s) ||
      (f.feeCode || '').toLowerCase().includes(s) ||
      (f.feeType || '').toLowerCase().includes(s)
    );
    if (feeFilter === 'active') result = result.filter(f => f.status === 'active');
    else if (feeFilter === 'inactive') result = result.filter(f => f.status === 'inactive');
    else if (feeFilter === 'monthly') result = result.filter(f => f.frequency === 'monthly');
    else if (feeFilter === 'yearly') result = result.filter(f => f.frequency === 'yearly');
    else if (feeFilter === 'one-time') result = result.filter(f => f.frequency === 'one-time');
    return result;
  }, [feeStructures, searchTerm, feeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredFees.length / PAGE_SIZE));
  const paginatedFees = filteredFees.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => ({
    total: feeStructures.length,
    monthly: feeStructures.filter(f => f.frequency === 'monthly').reduce((s, f) => s + (f.amount || 0), 0),
    annual: feeStructures.reduce((s, f) => s + (f.amount || 0) * (f.frequency === 'monthly' ? 12 : f.frequency === 'yearly' ? 1 : 1), 0),
    active: feeStructures.filter(f => f.status === 'active').length,
  }), [feeStructures]);

  const handleSubmit = async () => {
    if (!form.feeName || !form.amount) return;
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.applicableFrom) delete payload.applicableFrom;
      if (!payload.applicableTo) delete payload.applicableTo;
      if (!payload.class) delete payload.class;

      if (editingId) await api.put(`/finance/fee-structures/${editingId}`, payload);
      else await api.post('/finance/fee-structures', payload);

      setShowModal(false);
      setEditingId(null);
      setForm(INITIAL_FEE);
      fetchData();
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const handleEdit = (fee) => {
    setForm({
      feeCode: fee.feeCode || '',
      feeName: fee.feeName || '',
      class: fee.class?._id || fee.class || '',
      feeType: fee.feeType || 'tuition',
      amount: fee.amount || '',
      frequency: fee.frequency || 'monthly',
      applicableFrom: fee.applicableFrom ? fee.applicableFrom.slice(0, 10) : '',
      applicableTo: fee.applicableTo ? fee.applicableTo.slice(0, 10) : '',
      isMandatory: fee.isMandatory !== undefined ? fee.isMandatory : true,
      status: fee.status || 'active',
    });
    setEditingId(fee._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('finance.deleteFeeConfirm'))) return;
    try { await api.delete(`/finance/fee-structures/${id}`); fetchData(); } catch (err) { console.error(err); }
  };

  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(16);
    doc.text('Fee Structures Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
    autoTable(doc, {
      startY: 34,
      head: [['Code', 'Name', 'Type', 'Amount', 'Frequency', 'From', 'To', 'Mandatory', 'Status']],
      body: feeStructures.map(f => [
        f.feeCode || '-', f.feeName || '-', f.feeType || '-',
        `Rs.${(f.amount || 0).toLocaleString()}`,
        f.frequency || '-',
        f.applicableFrom ? new Date(f.applicableFrom).toLocaleDateString() : '-',
        f.applicableTo ? new Date(f.applicableTo).toLocaleDateString() : '-',
        f.isMandatory ? 'Yes' : 'No',
        f.status || '-',
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
    });
    doc.save('fee-structures.pdf');
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
          <h1 className="text-2xl font-bold text-slate-900">{t('finance.feeStructure')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('finance.manageFeeStructures')}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportPDF} className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
            <FiDownload size={16} /> {t('attendance.exportReport')}
          </button>
          <button
            onClick={() => { setShowModal(true); setEditingId(null); setForm(INITIAL_FEE); }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all"
          >
            <FiPlus size={16} /> {t('finance.addNewFee')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: t('finance.totalFeeStructures'), value: stats.total, gradient: 'from-slate-500 to-slate-600', icon: FiBook },
          { label: t('finance.monthlyRevenue'), value: `Rs.${stats.monthly.toLocaleString()}`, gradient: 'from-emerald-500 to-teal-600', icon: FiDollarSign },
          { label: t('finance.annualRevenue'), value: `Rs.${stats.annual.toLocaleString()}`, gradient: 'from-blue-500 to-indigo-600', icon: FiCalendar },
          { label: t('common.active'), value: stats.active, gradient: 'from-amber-500 to-orange-600', icon: FiCheck },
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

      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
        <input
          type="text"
          placeholder={t('finance.searchFeeStructures')}
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: t('common.all') },
          { key: 'active', label: t('common.active') },
          { key: 'inactive', label: t('common.inactive') || 'Inactive' },
          { key: 'monthly', label: t('finance.monthly') },
          { key: 'yearly', label: t('finance.annual') },
          { key: 'one-time', label: t('finance.oneTime') },
        ].map(ft => (
          <button
            key={ft.key}
            onClick={() => setFeeFilter(ft.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              feeFilter === ft.key
                ? 'bg-slate-800 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >{ft.label}</button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600">{t('finance.feeCode')}</th>
                <th className="px-4 py-3 font-semibold text-slate-600">{t('finance.feeName')}</th>
                <th className="px-4 py-3 font-semibold text-slate-600">{t('finance.feeType')}</th>
                <th className="px-4 py-3 font-semibold text-slate-600">{t('finance.amount')}</th>
                <th className="px-4 py-3 font-semibold text-slate-600">{t('finance.frequency')}</th>
                <th className="px-4 py-3 font-semibold text-slate-600">{t('finance.applicableFrom')}</th>
                <th className="px-4 py-3 font-semibold text-slate-600">{t('finance.applicableTo')}</th>
                <th className="px-4 py-3 font-semibold text-slate-600">{t('finance.mandatory')}</th>
                <th className="px-4 py-3 font-semibold text-slate-600">{t('common.status')}</th>
                <th className="px-4 py-3 font-semibold text-slate-600">{t('users.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFees.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-14 text-center text-slate-400">{t('common.noRecords')}</td></tr>
              )}
              {paginatedFees.map((f, i) => (
                <tr key={f._id || i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-slate-700">{f.feeCode || '-'}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{f.feeName}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 capitalize">{f.feeType}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">Rs.{(f.amount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                      f.frequency === 'monthly' ? 'bg-emerald-100 text-emerald-700' :
                      f.frequency === 'yearly' ? 'bg-purple-100 text-purple-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>{f.frequency}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                    {f.applicableFrom ? new Date(f.applicableFrom).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                    {f.applicableTo ? new Date(f.applicableTo).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {f.isMandatory ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600"><FiCheck className="h-3.5 w-3.5" /> {t('common.yes')}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400"><FiX className="h-3.5 w-3.5" /> {t('common.no')}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      f.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>{f.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => handleEdit(f)} className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 transition-colors" title={t('common.edit')}><FiEdit2 size={14} /></button>
                      <button onClick={() => handleDelete(f._id)} className="rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 transition-colors" title={t('common.delete')}><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">{t('common.page')} {page} {t('common.of')} {totalPages}</span>
          <div className="flex gap-1.5">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  page === p ? 'bg-slate-800 text-white shadow-md' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >{p}</button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >Next</button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-5">
              {editingId ? t('common.edit') : t('finance.addFeeStructure')}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{t('finance.feeCode')}</label>
                  <input type="text" value={form.feeCode} onChange={e => setForm({...form, feeCode: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder="e.g., FEE-001" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{t('finance.feeName')} *</label>
                  <input type="text" value={form.feeName} onChange={e => setForm({...form, feeName: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder={t('finance.feeNamePlaceholder')} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{t('finance.feeType')}</label>
                  <select value={form.feeType} onChange={e => setForm({...form, feeType: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                    <option value="tuition">{t('finance.tuitionFee')}</option>
                    <option value="admission">{t('finance.admissionFee')}</option>
                    <option value="other">{t('finance.other')}</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{t('finance.amountLabel')} *</label>
                  <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder={t('finance.enterAmount')} min="0" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{t('finance.frequency')}</label>
                  <select value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                    <option value="monthly">{t('finance.monthly')}</option>
                    <option value="yearly">{t('finance.annual')}</option>
                    <option value="one-time">{t('finance.oneTime')}</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{t('finance.class')}</label>
                  <select value={form.class} onChange={e => setForm({...form, class: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                    <option value="">{t('academic.selectClass')}</option>
                    {classes.map(cls => (
                      <option key={cls._id} value={cls._id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{t('finance.applicableFrom')}</label>
                  <input type="date" value={form.applicableFrom} onChange={e => setForm({...form, applicableFrom: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{t('finance.applicableTo')}</label>
                  <input type="date" value={form.applicableTo} onChange={e => setForm({...form, applicableTo: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={form.isMandatory} onChange={e => setForm({...form, isMandatory: e.target.checked})} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-200" />
                  {t('finance.mandatory')}
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={form.status === 'active'} onChange={e => setForm({...form, status: e.target.checked ? 'active' : 'inactive'})} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-200" />
                  {t('common.active')}
                </label>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={saving || !form.feeName || !form.amount}
                className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2"><FiRefreshCw className="animate-spin h-4 w-4" /> {t('common.saving')}</span>
                ) : editingId ? t('common.edit') : t('finance.addFeeStructure')}
              </button>
              <button
                onClick={() => { setShowModal(false); setEditingId(null); setForm(INITIAL_FEE); }}
                className="flex-1 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeeStructure;
