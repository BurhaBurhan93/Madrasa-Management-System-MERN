import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from "../../../lib/api";
import {
  buildPeriodQuery,
  getDefaultPeriodFilters,
} from "../../../utils/reportPeriods";

const getCount = (statuses, status) =>
  statuses?.find((item) => item.status === status)?.count || 0;

const AdminAttendanceReportsPage = () => {
  const { t } = useTranslation('admin');

  useEffect(() => {
    const syncLang = () => {
      const lang = readStoredLanguage('adminLang', 'en');
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    };
    syncLang();
  }, []);
  const [filters, setFilters] = useState(getDefaultPeriodFilters());
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState([]);
  const [stats, setStats] = useState({
    rate: 0,
    present: 0,
    late: 0,
    absent: 0,
  });

  async function fetchData() {
    setLoading(true);
    try {
      const params = new URLSearchParams(buildPeriodQuery(filters)).toString();
      const { data } = await api.get(`/attendance/summary?${params}`);
      const records = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : [];
      setSummary(records);

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
        present: totals.present,
        absent: totals.absent,
        late: totals.late,
        rate:
          totals.total > 0
            ? Math.round((totals.present / totals.total) * 100)
            : 0,
      });
    } catch (e) {
      console.error(e);
      setSummary([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [filters.period, filters.date, filters.week, filters.month]);

  const subtitle = useMemo(() => {
    if (filters.period === "daily") return t('reports.attendanceAnalytics');
    if (filters.period === "weekly")
      return t('reports.attendanceAnalytics');
    return t('reports.attendanceAnalytics');
  }, [filters.period]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t('reports.attendanceReports')}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={filters.period}
            onChange={(e) =>
              setFilters((c) => ({ ...c, period: e.target.value }))
            }
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
          >
            <option value="daily">{t('common.daily')}</option>
            <option value="weekly">{t('common.weekly')}</option>
            <option value="monthly">{t('common.monthly')}</option>
          </select>
          {filters.period === "daily" && (
            <input
              type="date"
              value={filters.date}
              onChange={(e) =>
                setFilters((c) => ({ ...c, date: e.target.value }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          )}
          {filters.period === "weekly" && (
            <input
              type="week"
              value={filters.week}
              onChange={(e) =>
                setFilters((c) => ({ ...c, week: e.target.value }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          )}
          {filters.period === "monthly" && (
            <input
              type="month"
              value={filters.month}
              onChange={(e) =>
                setFilters((c) => ({ ...c, month: e.target.value }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-medium text-emerald-600">{t('reports.attendanceAnalytics')}</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">
            {loading ? "…" : `${stats.rate}%`}
          </p>
        </div>
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
          <p className="text-xs font-medium text-cyan-600">{t('common.present')}</p>
          <p className="mt-1 text-2xl font-bold text-cyan-700">
            {loading ? "…" : stats.present}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-xs font-medium text-amber-600">{t('reports.lateArrivals')}</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">
            {loading ? "…" : stats.late}
          </p>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <p className="text-xs font-medium text-rose-600">{t('reports.absences')}</p>
          <p className="mt-1 text-2xl font-bold text-rose-700">
            {loading ? "…" : stats.absent}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
                <th className="px-5 py-3 font-semibold text-slate-600">
                  {t('common.employee')}
                </th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('common.code')}</th>
                <th className="px-5 py-3 font-semibold text-slate-600">{t('reports.attendanceReports')}</th>
              <th className="px-5 py-3 text-center font-semibold text-emerald-600">
                {t('common.present')}
              </th>
                <th className="px-5 py-3 text-center font-semibold text-rose-600">
                  {t('reports.absences')}
                </th>
                <th className="px-5 py-3 text-center font-semibold text-amber-600">
                  {t('reports.lateArrivals')}
                </th>
              <th className="px-5 py-3 text-center font-semibold text-slate-600">
                {t('common.rate')}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={6}
                   className="px-5 py-10 text-center text-slate-400"
                >
                  {t('common.loading')}
                </td>
              </tr>
            )}
            {!loading && summary.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-slate-400"
                >
                  {t('common.noData')}
                </td>
              </tr>
            )}
            {summary.map((row, i) => {
              const present = getCount(row.statuses, "present");
              const absent = getCount(row.statuses, "absent");
              const late = getCount(row.statuses, "late");
              const excused = getCount(row.statuses, "excused");
              const total = present + absent + late + excused;
              const rate = total > 0 ? Math.round((present / total) * 100) : 0;
              return (
                <tr
                  key={row._id || i}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-5 py-3 font-medium text-slate-800">
                    {row.employee?.fullName || "—"}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {row.employee?.employeeCode || "—"}
                  </td>
                  <td className="px-5 py-3 text-center text-slate-700">
                    {present}
                  </td>
                  <td className="px-5 py-3 text-center text-slate-700">
                    {absent}
                  </td>
                  <td className="px-5 py-3 text-center text-slate-700">
                    {late}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${rate >= 75 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                    >
                      {rate}%
                    </span>
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

export default AdminAttendanceReportsPage;
