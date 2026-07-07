import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from "../../../lib/api";
import {
  buildPeriodQuery,
  getDefaultPeriodFilters,
} from "../../../utils/reportPeriods";
import { FiCalendar, FiUsers, FiCheckCircle, FiXCircle, FiClock, FiSearch, FiDownload, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const PAGE_SIZE = 10;

const getCount = (statuses, status) =>
  statuses?.find((item) => item.status === status)?.count || 0;

const AdminAttendanceReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(getDefaultPeriodFilters());
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [employeeTypeFilter, setEmployeeTypeFilter] = useState('');
  const [departments, setDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = useTranslation('admin');
  const [stats, setStats] = useState({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    rate: 0,
  });

  useEffect(() => { const lang = readStoredLanguage(); if (lang) i18n.changeLanguage(lang); }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await api.get('/hr/departments');
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setDepartments(list);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  async function fetchReports() {
    setLoading(true);
    try {
      const params = new URLSearchParams(buildPeriodQuery(filter)).toString();
      const { data } = await api.get(`/attendance/summary?${params}`);
      const records = Array.isArray(data) ? data : data.data || [];
      setReports(records);

      const totals = records.reduce(
        (acc, row) => {
          const present = getCount(row.statuses, "present");
          const absent = getCount(row.statuses, "absent");
          const late = getCount(row.statuses, "late");
          const excused = getCount(row.statuses, "excused");
          return {
            present: acc.present + present,
            absent: acc.absent + absent,
            late: acc.late + late,
            total: acc.total + present + absent + late + excused,
          };
        },
        { present: 0, absent: 0, late: 0, total: 0 },
      );

      setStats({
        totalDays: totals.total,
        presentDays: totals.present,
        absentDays: totals.absent,
        lateDays: totals.late,
        rate:
          totals.total > 0
            ? Math.round((totals.present / totals.total) * 100)
            : 0,
      });
    } catch {
      setReports([]);
      setStats({ totalDays: 0, presentDays: 0, absentDays: 0, lateDays: 0, rate: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReports();
  }, [filter.period, filter.date, filter.week, filter.month]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, departmentFilter, employeeTypeFilter]);

  const filteredReports = useMemo(() => {
    return reports.filter(row => {
      const name = (row.employee?.fullName || '').toLowerCase();
      const code = (row.employee?.employeeCode || '').toLowerCase();
      const search = searchTerm.toLowerCase();
      if (search && !name.includes(search) && !code.includes(search)) return false;
      if (departmentFilter && row.employee?.department !== departmentFilter) return false;
      return true;
    });
  }, [reports, searchTerm, departmentFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE));
  const paginatedReports = filteredReports.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const exportPDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageTitle = `${t('attendance.reports')} - ${filter.period.toUpperCase()}`;
      doc.setFontSize(16);
      doc.text(pageTitle, 14, 20);
      doc.setFontSize(10);
      const periodLabel = t('attendance.period');
      const dateStr = new Date().toLocaleDateString(i18n.language === 'ps' ? 'ps-AF' : i18n.language === 'prs' ? 'prs-AF' : 'en-US');
      doc.text(`${periodLabel}: ${filter.period} | ${dateStr}`, 14, 28);
      const headRow = [t('attendance.employee'), t('academic.code'), t('attendance.present'), t('attendance.absent'), t('attendance.late'), t('attendance.attendanceRate')];
      const bodyRows = filteredReports.length > 0
        ? filteredReports.map(row => {
            const present = getCount(row.statuses, "present");
            const absent = getCount(row.statuses, "absent");
            const late = getCount(row.statuses, "late");
            const excused = getCount(row.statuses, "excused");
            const total = present + absent + late + excused;
            const rate = total > 0 ? Math.round((present / total) * 100) : 0;
            return [row.employee?.fullName || '-', row.employee?.employeeCode || '-', present, absent, late, `${rate}%`];
          })
        : [['-', '-', '0', '0', '0', '0%']];
      autoTable(doc, {
        startY: 35,
        head: [headRow],
        body: bodyRows,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 247, 250] },
      });
      doc.save(`Attendance_Report_${filter.period}.pdf`);
    } catch (err) {
      console.error('PDF Export Error:', err);
      alert(`Export failed: ${err.message}`);
    }
  };

  if (loading && reports.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">{t('attendance.reports')}</h1>
          <p className="mt-1 text-gray-600">{t('attendance.viewAnalyzeAttendance')}</p>
        </div>
        <button onClick={exportPDF} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-indigo-700"><FiDownload size={16} /> {t('common.exportPdf')}</button>
      </div>

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[140px]">
            <label className="mb-1 block text-xs font-medium text-gray-500">{t('attendance.period')}</label>
            <select value={filter.period} onChange={(e) => setFilter((c) => ({ ...c, period: e.target.value }))} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none">
              <option value="daily">{t('attendance.daily')}</option>
              <option value="weekly">{t('attendance.weekly')}</option>
              <option value="monthly">{t('attendance.monthly')}</option>
            </select>
          </div>
          {filter.period === "daily" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">{t('attendance.date')}</label>
              <input type="date" value={filter.date} onChange={(e) => setFilter((c) => ({ ...c, date: e.target.value }))} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
          )}
          {filter.period === "weekly" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">{t('attendance.week')}</label>
              <input type="week" value={filter.week} onChange={(e) => setFilter((c) => ({ ...c, week: e.target.value }))} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
          )}
          {filter.period === "monthly" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">{t('attendance.month')}</label>
              <input type="month" value={filter.month} onChange={(e) => setFilter((c) => ({ ...c, month: e.target.value }))} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
          )}
          <div className="min-w-[160px]">
            <label className="mb-1 block text-xs font-medium text-gray-500">{t('hr.departments')}</label>
            <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none">
              <option value="">{t('attendance.allDepartments')}</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.departmentName}</option>)}
            </select>
          </div>
          <div className="min-w-[180px] flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-500">{t('common.search')}</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder={t('attendance.searchClassTeacher')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div><p className="text-sm opacity-90">{t('attendance.totalRecords')}</p><p className="mt-1 text-3xl font-bold">{stats.totalDays}</p></div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20"><FiCalendar size={22} /></div>
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div><p className="text-sm opacity-90">{t('attendance.present')}</p><p className="mt-1 text-3xl font-bold">{stats.presentDays}</p></div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20"><FiCheckCircle size={22} /></div>
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div><p className="text-sm opacity-90">{t('attendance.absent')}</p><p className="mt-1 text-3xl font-bold">{stats.absentDays}</p></div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20"><FiXCircle size={22} /></div>
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div><p className="text-sm opacity-90">{t('attendance.attendanceRate')}</p><p className="mt-1 text-3xl font-bold">{stats.rate}%</p></div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20"><FiUsers size={22} /></div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <p className="text-sm text-gray-500">{t('attendance.totalRecords')}: <span className="font-semibold text-gray-900">{filteredReports.length}</span></p>
          {pageCount > 1 && (
            <div className="flex items-center gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"><FiChevronLeft size={14} /></button>
              <span className="text-sm text-gray-500">{t('common.page')} {currentPage} {t('common.of')} {pageCount}</span>
              <button disabled={currentPage === pageCount} onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"><FiChevronRight size={14} /></button>
            </div>
          )}
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('attendance.employee')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('academic.code')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('attendance.present')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('attendance.absent')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('attendance.late')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('attendance.attendanceRate')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('attendance.status')}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReports.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-16 text-center text-gray-400">{t('attendance.noRecords')}</td></tr>
            )}
            {paginatedReports.map((row, index) => {
              const present = getCount(row.statuses, "present");
              const absent = getCount(row.statuses, "absent");
              const late = getCount(row.statuses, "late");
              const excused = getCount(row.statuses, "excused");
              const total = present + absent + late + excused;
              const rowRate = total > 0 ? Math.round((present / total) * 100) : 0;
              const initial = row.employee?.fullName?.charAt(0) || '?';
              return (
                <tr key={row._id || index} className="border-t border-gray-100 transition-colors hover:bg-indigo-50/40">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-sm font-bold text-white shadow-sm">{initial}</div>
                      <span className="font-medium text-gray-900">{row.employee?.fullName || '-'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{row.employee?.employeeCode || '-'}</td>
                  <td className="px-5 py-4"><span className="font-semibold text-emerald-600">{present}</span></td>
                  <td className="px-5 py-4"><span className="font-semibold text-rose-600">{absent}</span></td>
                  <td className="px-5 py-4"><span className="font-semibold text-amber-600">{late}</span></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-200">
                        <div className={`h-full rounded-full ${rowRate >= 75 ? 'bg-emerald-500' : rowRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${rowRate}%` }} />
                      </div>
                      <span className={`text-xs font-semibold ${rowRate >= 75 ? 'text-emerald-700' : rowRate >= 50 ? 'text-amber-700' : 'text-rose-700'}`}>{rowRate}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${rowRate >= 75 ? 'bg-emerald-100 text-emerald-700' : rowRate >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                      {rowRate >= 75 ? <FiCheckCircle size={12} /> : rowRate >= 50 ? <FiClock size={12} /> : <FiXCircle size={12} />}
                      {rowRate >= 75 ? t('attendance.excellent') : rowRate >= 50 ? t('attendance.needsAttention') : t('attendance.absent')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {pageCount > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4">
            <p className="text-sm text-gray-500">{t('common.page')} {currentPage} {t('common.of')} {pageCount}</p>
            <div className="flex items-center gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="flex items-center gap-1.5 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"><FiChevronLeft size={14} /> {t('common.previous')}</button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setCurrentPage(p)} className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition-colors ${currentPage === p ? 'bg-indigo-600 text-white shadow-sm' : 'border border-gray-300 text-gray-600 hover:bg-gray-100'}`}>{p}</button>
              ))}
              <button disabled={currentPage === pageCount} onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))} className="flex items-center gap-1.5 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40">{t('common.next')} <FiChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAttendanceReports;
