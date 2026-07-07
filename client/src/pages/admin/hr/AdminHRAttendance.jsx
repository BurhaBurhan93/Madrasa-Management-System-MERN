import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';
import Card from '../../../components/UIHelper/Card';

const AdminHRAttendance = () => {
  const { t } = useTranslation('admin');
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('card');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [summary, setSummary] = useState({});

  useEffect(() => {
    const syncLang = () => {
      const lang = readStoredLanguage('adminLang', 'en');
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    };
    syncLang();
    window.addEventListener('storage', syncLang);
    return () => window.removeEventListener('storage', syncLang);
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/hr/employees', { params: { limit: 200, status: 'active' } });
      const result = Array.isArray(data) ? data : data.data || [];
      setEmployees(result);
    } catch {}
  };

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/hr/attendance/date/${selectedDate}`);
      const result = Array.isArray(data) ? data : data.data || [];
      setRecords(result);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  const fetchSummary = async () => {
    try {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
      const { data } = await api.get('/hr/attendance/summary', { params: { start: firstDay, end: lastDay } });
      setSummary(data.data || data || {});
    } catch {}
  };

  useEffect(() => { fetchAttendance(); fetchSummary(); }, [fetchAttendance]);
  useEffect(() => { fetchEmployees(); }, []);

  const recordMap = {};
  records.forEach(r => {
    const empId = typeof r.employee === 'object' ? r.employee?._id : r.employee;
    recordMap[empId] = r;
  });

  const attendanceStatuses = ['present', 'absent', 'late', 'half-day', 'on-leave'];
  const statusColors = {
    present: 'bg-green-100 text-green-700',
    absent: 'bg-red-100 text-red-700',
    late: 'bg-amber-100 text-amber-700',
    'half-day': 'bg-orange-100 text-orange-700',
    'on-leave': 'bg-purple-100 text-purple-700',
  };
  const statusIcons = {
    present: '✓',
    absent: '✗',
    late: '⏰',
    'half-day': '½',
    'on-leave': '🏖',
  };

  const getStatus = (empId) => {
    const r = recordMap[empId];
    return r ? r.status : 'absent';
  };

  const handleStatusChange = (empId, newStatus) => {
    setRecords(prev => {
      const existing = prev.find(r => {
        const id = typeof r.employee === 'object' ? r.employee?._id : r.employee;
        return id === empId;
      });
      if (existing) {
        return prev.map(r => {
          const id = typeof r.employee === 'object' ? r.employee?._id : r.employee;
          return id === empId ? { ...r, status: newStatus } : r;
        });
      }
      const emp = employees.find(e => e._id === empId);
      return [...prev, { employee: emp, status: newStatus, checkIn: '', checkOut: '', date: selectedDate }];
    });
  };

  const handleMarkAll = (status) => {
    const updated = [...records];
    employees.forEach(emp => {
      const existing = updated.find(r => {
        const id = typeof r.employee === 'object' ? r.employee?._id : r.employee;
        return id === emp._id;
      });
      if (!existing) {
        updated.push({ employee: emp, status, checkIn: '', checkOut: '', date: selectedDate });
      } else {
        const idx = updated.indexOf(existing);
        updated[idx] = { ...existing, status };
      }
    });
    setRecords(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        date: selectedDate,
        records: records.map(r => ({
          employee: typeof r.employee === 'object' ? r.employee._id : r.employee,
          status: r.status,
          checkIn: r.checkIn || '',
          checkOut: r.checkOut || '',
          remarks: r.remarks || '',
        })),
      };
      await api.post('/hr/attendance', payload);
      fetchAttendance();
      fetchSummary();
    } catch (err) { console.error(err); } finally {
      setSaving(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    if (search) {
      const q = search.toLowerCase();
      if (!emp.fullName?.toLowerCase().includes(q) && !emp.employeeCode?.toLowerCase().includes(q)) return false;
    }
    if (statusFilter) {
      const s = getStatus(emp._id);
      if (s !== statusFilter) return false;
    }
    return true;
  });

  const presentCount = employees.filter(e => getStatus(e._id) === 'present').length;
  const absentCount = employees.filter(e => getStatus(e._id) === 'absent').length;
  const lateCount = employees.filter(e => getStatus(e._id) === 'late').length;

  if (loading && employees.length === 0) return <div className="flex items-center justify-center py-20 text-slate-500">{t('common.loading')}</div>;

  return (
    <div className="w-full min-h-screen p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('hr.employeeAttendance')}</h1>
          <p className="text-slate-500 mt-1">{t('hr.trackAttendance')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"><div className="p-4"><p className="text-sm opacity-90">{t('common.totalEmployees')}</p><p className="text-2xl font-bold">{employees.length}</p></div></Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white"><div className="p-4"><p className="text-sm opacity-90">{t('hr.present')}</p><p className="text-2xl font-bold">{presentCount}</p></div></Card>
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white"><div className="p-4"><p className="text-sm opacity-90">{t('hr.absent')}</p><p className="text-2xl font-bold">{absentCount}</p></div></Card>
        <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white"><div className="p-4"><p className="text-sm opacity-90">{t('hr.late')}</p><p className="text-2xl font-bold">{lateCount}</p></div></Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700 shrink-0">{t('common.date')}:</label>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500">{t('hr.markAll')}:</span>
            {attendanceStatuses.map(s => (
              <button key={s} onClick={() => handleMarkAll(s)} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[s]} hover:opacity-80`}>{t(`hr.${s}`)}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 w-full md:w-48">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('common.search')} className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm placeholder-slate-400 focus:border-cyan-500 focus:outline-none" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">{t('common.allStatus')}</option>
              {attendanceStatuses.map(s => <option key={s} value={s}>{t(`hr.${s}`)}</option>)}
            </select>
            <div className="flex rounded-lg border border-slate-300 overflow-hidden">
              <button onClick={() => setViewMode('card')} className={`px-3 py-2 text-sm ${viewMode === 'card' ? 'bg-cyan-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button onClick={() => setViewMode('table')} className={`px-3 py-2 text-sm ${viewMode === 'table' ? 'bg-cyan-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </button>
            </div>
            <button onClick={handleSave} disabled={saving} className="rounded-lg bg-cyan-600 px-5 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50">{saving ? t('common.saving') : t('common.save')}</button>
          </div>
        </div>
      </Card>

      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEmployees.map(emp => {
            const att = recordMap[emp._id];
            return (
              <div key={emp._id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-lg transition-shadow min-w-0">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 truncate" title={emp.fullName}>{emp.fullName}</h3>
                    <p className="text-xs text-slate-400 truncate">{emp.employeeCode}</p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[getStatus(emp._id)]}`}>
                    {statusIcons[getStatus(emp._id)]} {t(`hr.${getStatus(emp._id)}`)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 truncate" title={emp.department?.departmentName || ''}>{t('common.department')}: {emp.department?.departmentName || '-'}</div>
                <div className="flex gap-1 flex-wrap">
                  {attendanceStatuses.map(s => (
                    <button key={s} onClick={() => handleStatusChange(emp._id, s)} className={`rounded-full px-2 py-0.5 text-xs font-medium transition-all ${getStatus(emp._id) === s ? statusColors[s] + ' ring-2 ring-offset-1 ring-slate-300' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{t(`hr.${s}`)}</button>
                  ))}
                </div>
              </div>
            );
          })}
          {filteredEmployees.length === 0 && !loading && <div className="col-span-full text-center py-20 text-slate-400">{t('common.noRecords')}</div>}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-3 font-semibold text-slate-600">{t('common.fullName')}</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">{t('common.employeeCode')}</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">{t('common.department')}</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">{t('common.status')}</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">{t('hr.checkIn')}</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">{t('hr.checkOut')}</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400">{t('common.noRecords')}</td></tr>}
                {filteredEmployees.map(emp => {
                  const att = recordMap[emp._id];
                  return (
                    <tr key={emp._id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium text-slate-800">
                        <div className="truncate max-w-[160px]" title={emp.fullName}>{emp.fullName}</div>
                        <div className="text-xs text-slate-400">{emp.employeeCode}</div>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{emp.employeeCode || '-'}</td>
                      <td className="px-5 py-3 text-slate-600 truncate max-w-[120px]" title={emp.department?.departmentName || ''}>{emp.department?.departmentName || '-'}</td>
                      <td className="px-5 py-3">
                        <select value={getStatus(emp._id)} onChange={e => handleStatusChange(emp._id, e.target.value)} className={`text-xs font-semibold rounded-full px-2.5 py-0.5 border-0 focus:ring-0 cursor-pointer ${statusColors[getStatus(emp._id)]}`}>
                          {attendanceStatuses.map(s => <option key={s} value={s}>{t(`hr.${s}`)}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-3"><input type="time" value={att?.checkIn || ''} onChange={e => handleStatusChange(emp._id, getStatus(emp._id))} className="w-24 rounded border border-slate-200 px-2 py-1 text-xs" /></td>
                      <td className="px-5 py-3"><input type="time" value={att?.checkOut || ''} onChange={e => handleStatusChange(emp._id, getStatus(emp._id))} className="w-24 rounded border border-slate-200 px-2 py-1 text-xs" /></td>
                      <td className="px-5 py-3">
                        <button onClick={() => window.open(`/admin/hr/employees?search=${emp.fullName}`, '_self')} className="text-xs text-cyan-600 hover:text-cyan-900 font-medium">{t('hr.viewProfile')}</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHRAttendance;
