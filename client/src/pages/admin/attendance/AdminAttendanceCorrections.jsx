import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import CalendarDatePicker from "../../../components/UIHelper/CalendarDatePicker";
import { FiRefreshCw, FiX, FiCheck, FiSearch, FiCalendar, FiClock, FiAlertTriangle } from 'react-icons/fi';
import api from '../../../lib/api';

const INITIAL_FORM = { employee: '', date: '', newStatus: 'present', correctionReason: '' };

const AdminAttendanceCorrections = () => {
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [empDropdown, setEmpDropdown] = useState(false);
  const { t } = useTranslation('admin');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [corrRes, empRes] = await Promise.all([
        api.get('/attendance/corrections'),
        api.get('/hr/employees?status=active'),
      ]);
      setCorrections(Array.isArray(corrRes.data) ? corrRes.data : corrRes.data?.data || []);
      setEmployees(Array.isArray(empRes.data) ? empRes.data : empRes.data?.data || []);
    } catch { setCorrections([]); setEmployees([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { const lang = readStoredLanguage(); if (lang) i18n.changeLanguage(lang); }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return corrections;
    return corrections.filter(c => c.status === filter);
  }, [corrections, filter]);

  const stats = useMemo(() => {
    const total = corrections.length;
    const pending = corrections.filter(c => c.status === 'pending').length;
    const approved = corrections.filter(c => c.status === 'approved').length;
    const rejected = corrections.filter(c => c.status === 'rejected').length;
    return { total, pending, approved, rejected };
  }, [corrections]);

  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return employees.slice(0, 50);
    const s = searchTerm.toLowerCase();
    return employees.filter(e =>
      e.fullName?.toLowerCase().includes(s) ||
      e.employeeCode?.toLowerCase().includes(s)
    ).slice(0, 50);
  }, [employees, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employee || !form.date || !form.correctionReason) return;
    setSubmitting(true);
    try {
      const payload = {
        employee: form.employee,
        date: form.date,
        newStatus: form.newStatus,
        correctionReason: form.correctionReason,
      };
      await api.post('/attendance/corrections', payload);
      setShowForm(false);
      setForm(INITIAL_FORM);
      fetchData();
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  const handleApprove = async (id) => {
    try { await api.put(`/attendance/corrections/${id}/approve`); fetchData(); } catch (err) { console.error(err); }
  };

  const handleReject = async (id) => {
    try { await api.put(`/attendance/corrections/${id}/reject`); fetchData(); } catch (err) { console.error(err); }
  };

  const selectEmployee = (emp) => {
    setForm({ ...form, employee: emp._id });
    setSearchTerm(`${emp.fullName} (${emp.employeeCode || ''})`);
    setEmpDropdown(false);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('attendance.corrections')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('attendance.manageCorrections')}</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); if (!showForm) { setForm(INITIAL_FORM); setSearchTerm(''); } }}
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:shadow-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-200"
        >
          {showForm ? t('common.cancel') : t('attendance.newCorrection')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: t('attendance.totalRecords'), value: stats.total, gradient: 'from-slate-500 to-slate-600', icon: FiClock },
          { label: t('common.pending'), value: stats.pending, gradient: 'from-amber-500 to-orange-600', icon: FiAlertTriangle },
          { label: t('common.approved'), value: stats.approved, gradient: 'from-emerald-500 to-teal-600', icon: FiCheck },
          { label: t('common.rejected'), value: stats.rejected, gradient: 'from-rose-500 to-pink-600', icon: FiX },
        ].map((stat, i) => (
          <div key={i} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.gradient} p-5 text-white shadow-lg`}>
            <div className="relative z-10">
              <p className="text-sm font-medium text-white/80">{stat.label}</p>
              <p className="mt-1 text-3xl font-bold">{stat.value}</p>
            </div>
            <stat.icon className="absolute right-3 top-3 h-12 w-12 text-white/10" />
          </div>
        ))}
      </div>

      {/* New Correction Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Employee Selector */}
            <div className="relative">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('attendance.selectEmployee')}</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setEmpDropdown(true); setForm({ ...form, employee: '' }); }}
                  onFocus={() => setEmpDropdown(true)}
                  placeholder={t('attendance.selectEmployee')}
                  className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none"
                />
              </div>
              {empDropdown && (
                <div className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                  {filteredEmployees.length === 0 && (
                    <div className="px-4 py-3 text-sm text-slate-400">{t('common.noRecords')}</div>
                  )}
                  {filteredEmployees.map(emp => (
                    <button
                      key={emp._id}
                      type="button"
                      onClick={() => selectEmployee(emp)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 text-left"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 text-xs font-bold text-cyan-700">
                        {emp.fullName?.charAt(0) || t('common.na') || '?'}
                      </div>
                      <div>
                        <p className="font-medium">{emp.fullName}</p>
                        {emp.employeeCode && <p className="text-xs text-slate-400">{emp.employeeCode}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('attendance.date')}</label>
              <CalendarDatePicker
                value={form.date}
                onChange={(date) => setForm({ ...form, date })}
                placeholder={t('attendance.selectDate')}
              />
            </div>

            {/* New Status */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('attendance.correctedStatus')}</label>
              <select
                value={form.newStatus}
                onChange={e => setForm({ ...form, newStatus: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none"
              >
                <option value="present">{t('attendance.present')}</option>
                <option value="absent">{t('attendance.absent')}</option>
                <option value="late">{t('attendance.late')}</option>
                <option value="half-day">{t('attendance.halfDay')}</option>
                <option value="on-leave">{t('attendance.onLeave')}</option>
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('attendance.reason')}</label>
              <input
                value={form.correctionReason}
                onChange={e => setForm({ ...form, correctionReason: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none"
                placeholder={t('attendance.reasonPlaceholder')}
                required
              />
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              disabled={submitting || !form.employee || !form.date || !form.correctionReason}
              className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2 text-sm font-medium text-white hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? (
                <span className="flex items-center gap-2"><FiRefreshCw className="animate-spin h-4 w-4" /> {t('attendance.submitCorrection')}</span>
              ) : t('attendance.submitCorrection')}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(INITIAL_FORM); setSearchTerm(''); }}
              className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'approved', 'rejected'].map(f => {
          const count = f === 'all' ? corrections.length : corrections.filter(c => c.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f === 'all' ? t('common.all') : t(`common.${f}`)}
              <span className="ml-1.5 text-xs opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('attendance.employee')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('attendance.date')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('attendance.oldStatus')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('attendance.correctedStatus')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('attendance.reason')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('users.status')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('attendance.createdAt')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('users.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-14 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <FiClock className="h-8 w-8" />
                      <span className="text-sm">{t('attendance.noCorrections')}</span>
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map((c, i) => {
                const emp = c.employee || {};
                const empName = emp.fullName || '-';
                const empCode = emp.employeeCode || '';
                return (
                  <tr key={c._id || i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 text-sm font-bold text-cyan-700">
                          {empName.charAt(0) || t('common.na') || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{empName}</p>
                          {empCode && <p className="text-xs text-slate-400">{empCode}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600 whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <FiCalendar className="h-3.5 w-3.5 text-slate-400" />
                        {c.date ? new Date(c.date).toLocaleDateString() : t('common.na') || '-'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {c.oldStatus && c.oldStatus !== 'unknown' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 capitalize">{t(`attendance.${c.oldStatus === 'half-day' ? 'halfDay' : c.oldStatus === 'on-leave' ? 'onLeave' : c.oldStatus}`) || t('common.' + c.oldStatus) || c.oldStatus || '-'}</span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                        c.newStatus === 'present' ? 'bg-emerald-100 text-emerald-700' :
                        c.newStatus === 'absent' ? 'bg-rose-100 text-rose-700' :
                        c.newStatus === 'late' ? 'bg-amber-100 text-amber-700' :
                        c.newStatus === 'half-day' ? 'bg-purple-100 text-purple-700' :
                        c.newStatus === 'on-leave' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>{t(`attendance.${c.newStatus === 'half-day' ? 'halfDay' : c.newStatus === 'on-leave' ? 'onLeave' : c.newStatus}`) || t('common.' + c.newStatus) || c.newStatus || '-'}</span>
                    </td>
                    <td className="px-5 py-3 max-w-[200px]">
                      <p className="truncate text-slate-500" title={c.correctionReason}>{c.correctionReason || '-'}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                        c.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        c.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {c.status === 'approved' ? <FiCheck className="h-3 w-3" /> : c.status === 'rejected' ? <FiX className="h-3 w-3" /> : <FiClock className="h-3 w-3" />}
                        {t(`common.${c.status}`) || c.status || '-'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-5 py-3">
                      {c.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(c._id)}
                            className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                          ><FiCheck className="h-3.5 w-3.5" /> {t('attendance.approve')}</button>
                          <button
                            onClick={() => handleReject(c._id)}
                            className="flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors"
                          ><FiX className="h-3.5 w-3.5" /> {t('attendance.reject')}</button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendanceCorrections;
