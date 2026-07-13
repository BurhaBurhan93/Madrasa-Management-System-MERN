import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const HRReports = () => {
  const { t } = useTranslation('admin');
  const [period, setPeriod] = useState('monthly');
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncLang = () => {
      const lang = readStoredLanguage('adminLang', 'en');
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    };
    syncLang();
    window.addEventListener('storage', syncLang);
    return () => window.removeEventListener('storage', syncLang);
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const toArr = (r) => { try { const d = r.data; return Array.isArray(d) ? d : (d.data || []); } catch { return []; } };
      const safeFetch = async (url, params, setter) => {
        try { const r = await api.get(url, params); setter(toArr(r)); } catch { setter([]); }
      };
      await Promise.all([
        safeFetch('/hr/employees', { params: { limit: 500 } }, setEmployees),
        safeFetch('/hr/leaves', { params: { limit: 500 } }, setLeaves),
        safeFetch('/hr/attendance', { params: { limit: 500 } }, setAttendance),
        safeFetch('/hr/departments', { params: { limit: 100 } }, setDepartments),
        safeFetch('/hr/designations', { params: { limit: 100 } }, setDesignations),
      ]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const now = new Date();
  const periodFilter = useMemo(() => {
    if (period === 'daily') return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (period === 'weekly') { const d = new Date(now); d.setDate(d.getDate() - 7); return d; }
    if (period === 'monthly') return new Date(now.getFullYear(), now.getMonth(), 1);
    return new Date(now.getFullYear(), 0, 1);
  }, [period, now]);

  const stats = useMemo(() => {
    const activeEmp = employees.filter(e => (e.status || e.employmentStatus) === 'active' || e.status === undefined);
    const newHires = employees.filter(e => {
      if (!e.joinDate && !e.createdAt) return false;
      const d = new Date(e.joinDate || e.createdAt);
      return d >= periodFilter;
    });
    const pendingLeaves = leaves.filter(l => l.status === 'pending');
    const approvedLeaves = leaves.filter(l => l.status === 'approved');
    const rejectedLeaves = leaves.filter(l => l.status === 'rejected');
    const todayStr = now.toISOString().slice(0, 10);
    const todayAtt = attendance.filter(a => {
      const d = a.date || a.createdAt || '';
      return d.slice(0, 10) === todayStr;
    });
    const presentToday = todayAtt.filter(a => a.status === 'present').length;
    const absentToday = todayAtt.filter(a => a.status === 'absent').length;
    const lateToday = todayAtt.filter(a => a.status === 'late').length;
    const totalToday = todayAtt.length || 1;

    const byDept = {};
    activeEmp.forEach(e => {
      const dept = typeof e.department === 'object' && e.department ? (e.department.departmentName || t('common.unknown')) : (e.department || t('common.unknown'));
      byDept[dept] = (byDept[dept] || 0) + 1;
    });
    const deptData = Object.entries(byDept).sort((a, b) => b[1] - a[1]);

    const byGender = {};
    activeEmp.forEach(e => {
      const g = e.gender || t('common.unknown');
      byGender[g] = (byGender[g] || 0) + 1;
    });
    const genderData = Object.entries(byGender);

    const byEmpType = {};
    activeEmp.forEach(e => {
      const et = e.employeeType || t('common.unknown');
      byEmpType[et] = (byEmpType[et] || 0) + 1;
    });
    const empTypeData = Object.entries(byEmpType);

    const byDesignation = {};
    activeEmp.forEach(e => {
      const des = typeof e.designation === 'object' && e.designation ? (e.designation.designationTitle || t('common.unknown')) : (e.designation || t('common.unknown'));
      byDesignation[des] = (byDesignation[des] || 0) + 1;
    });
    const desData = Object.entries(byDesignation).sort((a, b) => b[1] - a[1]);

    const totalLeaveDays = leaves.reduce((s, l) => s + (Number(l.leaveDays) || 0), 0);
    const avgLeaveDays = leaves.length > 0 ? (totalLeaveDays / leaves.length).toFixed(1) : '0';

    return {
      totalEmployees: activeEmp.length,
      newHires: newHires.length,
      pendingLeaves: pendingLeaves.length,
      approvedLeaves: approvedLeaves.length,
      rejectedLeaves: rejectedLeaves.length,
      totalLeaves: leaves.length,
      totalLeaveDays,
      avgLeaveDays,
      presentToday: presentToday,
      absentToday,
      lateToday,
      attendanceRate: Math.round((presentToday / totalToday) * 100),
      deptData,
      genderData,
      empTypeData,
      desData,
      deptCount: Object.keys(byDept).length,
      desCount: Object.keys(byDesignation).length,
    };
  }, [employees, leaves, attendance, periodFilter, now]);

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">{t('common.loading')}</div>;

  return (
    <div className="w-full min-h-screen p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('hr.hrReports')}</h1>
          <p className="text-slate-500 mt-1">{t('hr.hrAnalytics')}</p>
        </div>
        <select value={period} onChange={e => setPeriod(e.target.value)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
          <option value="daily">{t('common.daily')}</option>
          <option value="weekly">{t('common.weekly')}</option>
          <option value="monthly">{t('common.monthly')}</option>
          <option value="yearly">{t('common.yearly')}</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{t('common.totalEmployees')}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{stats.totalEmployees}</p>
          <p className="mt-1 text-xs text-slate-400">{stats.deptCount} {t('hr.departments').toLowerCase()}, {stats.desCount} {t('hr.designations').toLowerCase()}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">{t('hr.newHires')}</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">{stats.newHires}</p>
          <p className="mt-1 text-xs text-emerald-500">{t('common.this')} {t(`common.${period}`).toLowerCase()}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">{t('hr.leaveBalance')}</p>
          <p className="mt-2 text-3xl font-bold text-amber-700">{stats.pendingLeaves}</p>
          <p className="mt-1 text-xs text-amber-500">{stats.approvedLeaves} {t('common.approved')} / {stats.rejectedLeaves} {t('common.rejected')}</p>
        </div>
        <div className="rounded-2xl border border-cyan-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-cyan-600 uppercase tracking-wider">{t('hr.attendanceRate')}</p>
          <p className="mt-2 text-3xl font-bold text-cyan-700">{stats.attendanceRate}%</p>
          <p className="mt-1 text-xs text-cyan-500">{stats.presentToday} {t('common.present')} / {stats.absentToday} {t('common.absent')} / {stats.lateToday} {t('common.late')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-4">{t('hr.departmentDistribution')}</h2>
          {stats.deptData.length === 0 ? <p className="text-sm text-slate-400">{t('common.noData')}</p> : (
            <div className="space-y-2">
              {stats.deptData.slice(0, 10).map(([name, count], i) => {
                const max = stats.deptData[0][1] || 1;
                const pct = Math.round((count / max) * 100);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0" />
                    <span className="text-sm text-slate-700 w-32 truncate">{name}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm font-medium text-slate-800 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-4">{t('hr.designationDistribution')}</h2>
          {stats.desData.length === 0 ? <p className="text-sm text-slate-400">{t('common.noData')}</p> : (
            <div className="space-y-2">
              {stats.desData.slice(0, 10).map(([name, count], i) => {
                const max = stats.desData[0][1] || 1;
                const pct = Math.round((count / max) * 100);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                    <span className="text-sm text-slate-700 w-36 truncate">{name}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm font-medium text-slate-800 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-4">{t('common.gender')}</h2>
          {stats.genderData.length === 0 ? <p className="text-sm text-slate-400">{t('common.noData')}</p> : (
            <div className="space-y-2">
              {stats.genderData.map(([name, count], i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: name === 'male' ? '#0ea5e9' : name === 'female' ? '#ec4899' : '#94a3b8' }} />
                    <span className="text-sm text-slate-700">{t('common.' + name.toLowerCase())}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-4">{t('hr.byEmploymentType')}</h2>
          {stats.empTypeData.length === 0 ? <p className="text-sm text-slate-400">{t('common.noData')}</p> : (
            <div className="space-y-2">
              {stats.empTypeData.map(([name, count], i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                    <span className="text-sm text-slate-700">{t('users.employeeTypes.' + name.toLowerCase()) || t('common.unknown')}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-4">{t('hr.leaveSummary')}</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600">{t('common.total')}</span><span className="text-sm font-semibold text-slate-800">{stats.totalLeaves}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600">{t('common.pending')}</span><span className="text-sm font-semibold text-amber-600">{stats.pendingLeaves}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600">{t('common.approved')}</span><span className="text-sm font-semibold text-green-600">{stats.approvedLeaves}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600">{t('common.rejected')}</span><span className="text-sm font-semibold text-red-600">{stats.rejectedLeaves}</span></div>
            <div className="border-t border-slate-100 pt-2 mt-2 flex items-center justify-between"><span className="text-sm text-slate-600">{t('hr.totalLeaveDays')}</span><span className="text-sm font-semibold text-slate-800">{stats.totalLeaveDays}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600">{t('hr.avgLeaveDays')}</span><span className="text-sm font-semibold text-slate-800">{stats.avgLeaveDays}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRReports;
