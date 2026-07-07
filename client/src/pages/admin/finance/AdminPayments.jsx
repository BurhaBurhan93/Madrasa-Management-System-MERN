import React, { useState, useEffect, useMemo } from 'react';
import { FiDollarSign, FiCheckCircle, FiClock, FiSearch, FiDownload, FiPlus, FiRefreshCw, FiBook, FiCreditCard } from 'react-icons/fi';
import CalendarDatePicker from "../../../components/UIHelper/CalendarDatePicker";
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';

const PAGE_SIZE = 10;
const INITIAL_PAYMENT = { studentFee: '', receiptNo: '', paidAmount: '', paymentMethod: 'cash', paymentDate: '', transactionReference: '', paymentChannel: '', verificationStatus: 'verified', remarks: '' };

const AdminPayments = () => {
  const { t } = useTranslation('admin');
  const [payments, setPayments] = useState([]);
  const [studentFees, setStudentFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(INITIAL_PAYMENT);
  const [saving, setSaving] = useState(false);

  useEffect(() => { const lang = readStoredLanguage(); if (lang) i18n.changeLanguage(lang); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [payRes, sfRes] = await Promise.all([
        api.get('/finance/fee-payments'),
        api.get('/finance/student-fees'),
      ]);
      setPayments(Array.isArray(payRes.data) ? payRes.data : payRes.data?.data || []);
      setStudentFees(Array.isArray(sfRes.data) ? sfRes.data : sfRes.data?.data || []);
    } catch { setPayments([]); setStudentFees([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const filteredPayments = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return payments.filter(p => {
      const studentName = p.studentFee?.student?.firstName + ' ' + p.studentFee?.student?.lastName || '';
      const matchesSearch = (p.receiptNo || '').toLowerCase().includes(s) ||
                           (p.transactionReference || '').toLowerCase().includes(s) ||
                           studentName.toLowerCase().includes(s);
      const matchesStatus = statusFilter === 'all' || p.paymentStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payments, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / PAGE_SIZE));
  const paginatedPayments = filteredPayments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [searchTerm, statusFilter]);

  const stats = useMemo(() => ({
    paid: payments.filter(p => p.paymentStatus === 'completed').reduce((s, p) => s + (p.paidAmount || 0), 0),
    pending: payments.filter(p => p.paymentStatus === 'pending').reduce((s, p) => s + (p.paidAmount || 0), 0),
    failed: payments.filter(p => p.paymentStatus === 'failed').reduce((s, p) => s + (p.paidAmount || 0), 0),
    total: payments.reduce((s, p) => s + (p.paidAmount || 0), 0),
  }), [payments]);

  const cashPayments = payments.filter(p => p.paymentMethod === 'cash');
  const cardPayments = payments.filter(p => p.paymentMethod === 'card');
  const cashAmount = cashPayments.reduce((s, p) => s + (p.paidAmount || 0), 0);
  const cardAmount = cardPayments.reduce((s, p) => s + (p.paidAmount || 0), 0);

  const handleSubmit = async () => {
    if (!form.receiptNo || !form.paidAmount) return;
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.transactionReference) delete payload.transactionReference;
      if (!payload.paymentChannel) delete payload.paymentChannel;
      if (!payload.remarks) delete payload.remarks;

      await api.post('/finance/fee-payments', payload);
      setShowModal(false);
      setForm(INITIAL_PAYMENT);
      fetchData();
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try { await api.put(`/finance/fee-payments/${id}`, { paymentStatus: newStatus }); fetchData(); } catch (err) { console.error(err); }
  };

  const statusBadgeClass = (status) => {
    return status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
           status === 'pending' ? 'bg-amber-100 text-amber-700' :
           status === 'failed' ? 'bg-rose-100 text-rose-700' :
           'bg-slate-100 text-slate-600';
  };

  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(16);
    doc.text('Fee Payments Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
    autoTable(doc, {
      startY: 34,
      head: [['Receipt#', 'Student', 'Amount', 'Method', 'Date', 'Status', 'Verification', 'Transaction Ref']],
      body: payments.map(p => {
        const stud = p.studentFee?.student || {};
        return [
          p.receiptNo || '-',
          `${stud.firstName || ''} ${stud.lastName || ''}`.trim() || '-',
          `Rs.${(p.paidAmount || 0).toLocaleString()}`,
          p.paymentMethod || '-',
          p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '-',
          p.paymentStatus || '-',
          p.verificationStatus || '-',
          p.transactionReference || '-',
        ];
      }),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
    });
    doc.save('fee-payments.pdf');
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
          <h1 className="text-2xl font-bold text-slate-900">{t('finance.payments')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('finance.managePayments')}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportPDF} className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
            <FiDownload size={16} /> {t('attendance.exportReport')}
          </button>
          <button
            onClick={() => { setShowModal(true); setForm(INITIAL_PAYMENT); }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all"
          >
            <FiPlus size={16} /> {t('finance.recordPayment')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: t('finance.totalPaid'), value: `Rs.${stats.paid.toLocaleString()}`, gradient: 'from-emerald-500 to-teal-600', icon: FiCheckCircle },
          { label: t('finance.pending'), value: `Rs.${stats.pending.toLocaleString()}`, gradient: 'from-amber-500 to-orange-600', icon: FiClock },
          { label: t('finance.overdue'), value: `Rs.${stats.failed.toLocaleString()}`, gradient: 'from-rose-500 to-pink-600', icon: FiDollarSign },
          { label: t('finance.totalRevenue'), value: `Rs.${stats.total.toLocaleString()}`, gradient: 'from-blue-500 to-indigo-600', icon: FiBook },
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
            placeholder={t('finance.searchPayments')}
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
          <option value="all">{t('finance.allStatus')}</option>
          {['completed', 'pending', 'failed'].map(s => (
            <option key={s} value={s}>{t(`finance.${s}`) || s}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600">{t('finance.receiptNo')}</th>
                <th className="px-4 py-3 font-semibold text-slate-600">{'Student'}</th>
                <th className="px-4 py-3 font-semibold text-slate-600">{t('finance.amount')}</th>
                <th className="px-4 py-3 font-semibold text-slate-600">{t('finance.method')}</th>
                <th className="px-4 py-3 font-semibold text-slate-600">{t('finance.paymentDate')}</th>
                <th className="px-4 py-3 font-semibold text-slate-600">{t('finance.status')}</th>
                <th className="px-4 py-3 font-semibold text-slate-600">{t('finance.transactionReference')}</th>
                <th className="px-4 py-3 font-semibold text-slate-600">{t('finance.verificationStatus')}</th>
                <th className="px-4 py-3 font-semibold text-slate-600">{t('finance.paymentChannel')}</th>
                <th className="px-4 py-3 font-semibold text-slate-600">{t('users.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPayments.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-14 text-center text-slate-400">{t('common.noRecords')}</td></tr>
              )}
              {paginatedPayments.map(p => {
                const stud = p.studentFee?.student || {};
                const studentName = [stud.firstName, stud.lastName].filter(Boolean).join(' ') || '-';
                return (
                  <tr key={p._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-slate-700">{p.receiptNo}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-xs font-bold text-blue-700">
                          {studentName.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{studentName}</p>
                          {stud.studentCode && <p className="text-xs text-slate-400">{stud.studentCode}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">Rs.{(p.paidAmount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${p.paymentMethod === 'cash' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'}`}>
                        {p.paymentMethod === 'cash' ? <FiDollarSign className="h-3 w-3" /> : <FiCreditCard className="h-3 w-3" />}
                        {t(`finance.${p.paymentMethod}`) || p.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={p.paymentStatus}
                        onChange={e => handleStatusChange(p._id, e.target.value)}
                        className={`rounded-lg border-0 px-2.5 py-1 text-xs font-medium outline-none cursor-pointer ${statusBadgeClass(p.paymentStatus)}`}
                      >
                        <option value="completed">{t('finance.paid')}</option>
                        <option value="pending">{t('finance.pending')}</option>
                        <option value="failed">{t('finance.failed')}</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-[120px] truncate">{p.transactionReference || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        p.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                        p.verificationStatus === 'pending' ? 'bg-amber-100 text-amber-700' :
                        p.verificationStatus === 'rejected' ? 'bg-rose-100 text-rose-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>{p.verificationStatus || '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{p.paymentChannel || '-'}</td>
                    <td className="px-4 py-3">
                      {p.remarks && <span className="text-xs text-slate-400 italic" title={p.remarks}>{p.remarks.slice(0, 20)}{p.remarks.length > 20 ? '...' : ''}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">{t('finance.paymentSummary')}</h3>
          <div className="space-y-4">
            {[
              { label: t('finance.paidAmount'), amount: stats.paid, color: 'emerald' },
              { label: t('finance.pendingAmount'), amount: stats.pending, color: 'amber' },
              { label: t('finance.overdueAmount'), amount: stats.failed, color: 'rose' },
            ].map((item, i) => {
              const pct = stats.total > 0 ? ((item.amount / stats.total) * 100).toFixed(1) : 0;
              const barColor = { emerald: 'bg-emerald-500', amber: 'bg-amber-500', rose: 'bg-rose-500' }[item.color];
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-slate-600">{item.label}</span>
                    <span className={`text-sm font-semibold ${item.color === 'emerald' ? 'text-emerald-600' : item.color === 'amber' ? 'text-amber-600' : 'text-rose-600'}`}>Rs.{item.amount.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">{t('finance.paymentMethods')}</h3>
          <div className="space-y-4">
            {[
              { method: 'cash', amount: cashAmount, count: cashPayments.length, icon: FiDollarSign, color: 'emerald' },
              { method: 'card', amount: cardAmount, count: cardPayments.length, icon: FiCreditCard, color: 'purple' },
            ].map((item, i) => {
              const pct = stats.total > 0 ? ((item.amount / stats.total) * 100).toFixed(1) : 0;
              return (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-purple-600'}`}>
                      <item.icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 capitalize">{t(`finance.${item.method}`)}</p>
                      <p className="text-xs text-slate-400">{item.count} {t('finance.payments').toLowerCase()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-800">Rs.{item.amount.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">{pct}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-5">{t('finance.recordNewPayment')}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{t('finance.receiptNo')} *</label>
                  <input type="text" value={form.receiptNo} onChange={e => setForm({...form, receiptNo: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder="REC-001" required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{t('finance.amountLabel')} *</label>
                  <input type="number" value={form.paidAmount} onChange={e => setForm({...form, paidAmount: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder={t('finance.enterAmount')} min="0" required />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{t('finance.studentName')}</label>
                <select value={form.studentFee} onChange={e => setForm({...form, studentFee: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                  <option value="">-- {t('academic.selectClass')} --</option>
                  {studentFees.map(sf => {
                    const stud = sf.student || {};
                    const name = [stud.firstName, stud.lastName].filter(Boolean).join(' ') || 'N/A';
                    return <option key={sf._id} value={sf._id}>{name} ({sf.academicYear || '-'})</option>;
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{t('finance.paymentMethod')}</label>
                  <select value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                    <option value="cash">{t('finance.cash')}</option>
                    <option value="card">{t('finance.card')}</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{t('finance.paymentDate')}</label>
                  <CalendarDatePicker value={form.paymentDate} onChange={(date) => setForm({...form, paymentDate: date })} placeholder={t('finance.selectDate')} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{t('finance.transactionReference')}</label>
                  <input type="text" value={form.transactionReference} onChange={e => setForm({...form, transactionReference: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder="TXN-12345" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{t('finance.paymentChannel')}</label>
                  <input type="text" value={form.paymentChannel} onChange={e => setForm({...form, paymentChannel: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder="e.g., Bank Transfer" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{t('finance.verificationStatus')}</label>
                  <select value={form.verificationStatus} onChange={e => setForm({...form, verificationStatus: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                    <option value="verified">{t('common.verified') || 'Verified'}</option>
                    <option value="pending">{t('finance.pending')}</option>
                    <option value="rejected">{t('finance.rejected') || 'Rejected'}</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{t('finance.remarks')}</label>
                  <input type="text" value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder="Optional notes" />
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={saving || !form.receiptNo || !form.paidAmount || !form.studentFee}
                className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2"><FiRefreshCw className="animate-spin h-4 w-4" /> {t('common.saving')}</span>
                ) : t('finance.recordPayment')}
              </button>
              <button
                onClick={() => { setShowModal(false); setForm(INITIAL_PAYMENT); }}
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

export default AdminPayments;
