import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';
import { FiAlertTriangle, FiBell, FiCheckCircle, FiClock, FiEye, FiUser, FiCalendar } from 'react-icons/fi';

const AdminAttendanceWarnings = () => {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState('all');
  const { t } = useTranslation('admin');

  useEffect(() => { const lang = readStoredLanguage(); if (lang) i18n.changeLanguage(lang); }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/attendance/warnings');
      setWarnings(Array.isArray(data) ? data : data.data || []);
    } catch { setWarnings([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDismiss = async (id) => {
    setActionLoading(id);
    try {
      await api.put(`/attendance/warnings/${id}`);
      fetchData();
    } catch { /* ignore */ } finally { setActionLoading(null); }
  };

  const handleSendNotice = async (id) => {
    setActionLoading(id);
    try {
      await api.post(`/attendance/warnings/${id}/notify`);
      fetchData();
    } catch { /* ignore */ } finally { setActionLoading(null); }
  };

  const filtered = filter === 'all' ? warnings : warnings.filter(w => w.status === filter);

  const activeCount = warnings.filter(w => w.status === 'active').length;
  const notifiedCount = warnings.filter(w => w.status === 'notified').length;
  const dismissedCount = warnings.filter(w => w.status === 'dismissed').length;

  const getStudentName = (w) => {
    if (!w.student) return '-';
    const s = w.student;
    return `${s.firstName || ''} ${s.lastName || ''}`.trim() || '-';
  };

  const getStudentClass = (w) => {
    return w.student?.currentClass?.className || '-';
  };

  const warningTypeLabel = (type) => {
    if (type === 'low_attendance') return t('attendance.warningLowAttendance');
    if (type === 'excessive_late') return t('attendance.warningExcessiveLate');
    return t('attendance.' + type) || type;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-lg text-gray-500">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-indigo-300 border-t-indigo-600" />
          {t('common.loading')}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('attendance.warnings')}</h1>
          <p className="mt-1 text-gray-600">{t('attendance.manageWarnings')}</p>
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'notified', 'dismissed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-xl px-4 py-2 text-xs font-medium capitalize transition-colors ${
                filter === f ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {f === 'all' ? t('common.all') : f === 'active' ? t('users.active') : f === 'dismissed' ? t('attendance.dismissed') : t('attendance.notified')}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div><p className="text-sm opacity-90">{t('attendance.activeWarnings')}</p><p className="mt-1 text-3xl font-bold">{activeCount}</p></div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20"><FiAlertTriangle size={22} /></div>
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div><p className="text-sm opacity-90">{t('attendance.notified')}</p><p className="mt-1 text-3xl font-bold">{notifiedCount}</p></div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20"><FiBell size={22} /></div>
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div><p className="text-sm opacity-90">{t('attendance.dismissed')}</p><p className="mt-1 text-3xl font-bold">{dismissedCount}</p></div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20"><FiCheckCircle size={22} /></div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <p className="text-sm text-gray-500">{t('attendance.totalRecords')}: <span className="font-semibold text-gray-900">{filtered.length}</span></p>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('attendance.student')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('academic.class')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('attendance.warningType')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('attendance.attendancePercent')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('users.status')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('attendance.issuedAt')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('users.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-16 text-center text-gray-400">{t('attendance.noWarnings')}</td></tr>
            )}
            {filtered.map((w, i) => {
              const initial = w.student?.firstName?.charAt(0) || w.student?.lastName?.charAt(0) || '?';
              return (
                <tr key={w._id || i} className="border-t border-gray-100 transition-colors hover:bg-indigo-50/40">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-sm font-bold text-white shadow-sm">{initial.toUpperCase()}</div>
                      <div>
                        <span className="font-medium text-gray-900">{getStudentName(w)}</span>
                        {w.student?.studentCode && <p className="text-xs text-gray-400">{w.student.studentCode}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{getStudentClass(w)}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                      w.warningType === 'low_attendance' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {w.warningType === 'low_attendance' ? <FiEye size={12} /> : <FiClock size={12} />}
                      {warningTypeLabel(w.warningType)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${w.currentValue < w.threshold ? 'text-rose-600' : 'text-emerald-600'}`}>{w.currentValue ?? 0}%</span>
                      <span className="text-xs text-gray-400">/ {w.threshold ?? 0}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                      w.status === 'active' ? 'bg-amber-100 text-amber-700' :
                      w.status === 'notified' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {w.status === 'active' ? <FiAlertTriangle size={12} /> :
                       w.status === 'notified' ? <FiBell size={12} /> : <FiCheckCircle size={12} />}
                      {w.status === 'active' ? t('users.active') : w.status === 'notified' ? t('attendance.notified') : t('attendance.dismissed')}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                    {w.issuedAt ? new Date(w.issuedAt).toLocaleDateString(i18n.language === 'ps' ? 'ps-AF' : i18n.language === 'prs' ? 'prs-AF' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleSendNotice(w._id)} disabled={actionLoading === w._id || w.status === 'notified'}
                        className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                          w.status === 'notified'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}>
                        <FiBell size={12} /> {actionLoading === w._id ? <span className="loading-dots">{t('common.loading')}</span> : t('attendance.notify')}
                      </button>
                      <button onClick={() => handleDismiss(w._id)} disabled={actionLoading === w._id || w.status === 'dismissed'}
                        className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                          w.status === 'dismissed'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}>
                        <FiCheckCircle size={12} /> {actionLoading === w._id ? <span className="loading-dots">{t('common.loading')}</span> : t('attendance.dismiss')}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAttendanceWarnings;
