import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from "../../../lib/api";
import {
  getDefaultPeriodFilters,
  isDateWithinRange,
} from "../../../utils/reportPeriods";

const AdminAcademicReports = () => {
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
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalExams: 0,
    totalClasses: 0,
  });
  const [exams, setExams] = useState([]);

  async function fetchData() {
    setLoading(true);
    try {
      const [classRes, examRes, studentRes] = await Promise.all([
        api.get("/academic/classes"),
        api.get("/academic/exams"),
        api.get("/students/reports"),
      ]);

      const allClasses = Array.isArray(classRes.data?.data)
        ? classRes.data.data
        : Array.isArray(classRes.data)
          ? classRes.data
          : [];
      const allExams = Array.isArray(examRes.data?.data)
        ? examRes.data.data
        : Array.isArray(examRes.data)
          ? examRes.data
          : [];
      const studentData = studentRes.data?.data || {};

      const filteredExams = allExams.filter((e) =>
        isDateWithinRange(e.startDate || e.createdAt, filters),
      );

      setClasses(allClasses);
      setExams(filteredExams);
      setStats({
        totalClasses: allClasses.length,
        totalStudents: studentData.stats?.totalStudents || 0,
        activeStudents: studentData.stats?.activeStudents || 0,
        totalExams: filteredExams.length,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [filters.period, filters.date, filters.week, filters.month]);

  const periodLabel = useMemo(() => {
    const labels = { daily: t('reports.today'), weekly: t('reports.thisWeek'), yearly: t('reports.thisYear'), term: t('reports.thisTerm') };
    return labels[filters.period] || t('reports.thisMonth');
  }, [filters.period]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t('reports.academicReports')}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {t('reports.academicPerformance')}
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={filters.period}
            onChange={(e) =>
              setFilters((c) => ({ ...c, period: e.target.value }))
            }
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
          >
            <option value="daily">{t('reports.periodDaily')}</option>
            <option value="weekly">{t('reports.periodWeekly')}</option>
            <option value="monthly">{t('reports.periodMonthly')}</option>
            <option value="term">{t('reports.periodTerm')}</option>
            <option value="yearly">{t('reports.periodYearly')}</option>
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
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
          <p className="text-xs font-medium text-cyan-600">{t('reports.attendanceReports')}</p>
          <p className="mt-1 text-2xl font-bold text-cyan-700">
            {loading ? "…" : stats.totalStudents}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-medium text-emerald-600">
            {t('reports.activeStudents')}
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">
            {loading ? "…" : stats.activeStudents}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-xs font-medium text-amber-600">
            {t('reports.examsCount')} ({periodLabel})
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-700">
            {loading ? "…" : stats.totalExams}
          </p>
        </div>
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
          <p className="text-xs font-medium text-violet-600">{t('reports.activeClasses')}</p>
          <p className="mt-1 text-2xl font-bold text-violet-700">
            {loading ? "…" : stats.totalClasses}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('reports.activeClasses')}</h2>
          {loading ? (
            <p className="text-slate-400">{t('common.loading')}</p>
          ) : classes.length === 0 ? (
            <p className="text-slate-400">{t('common.noData')}</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    {t('reports.class')}
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    {t('reports.section')}
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    {t('reports.level')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {classes.map((c, i) => (
                  <tr
                    key={c._id || i}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {c.name || c.className || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {c.section || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {c.level || c.grade || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            {t('reports.examsCount')} — {periodLabel}
          </h2>
          {loading ? (
            <p className="text-slate-400">{t('common.loading')}</p>
          ) : exams.length === 0 ? (
            <p className="text-slate-400">
              {t('common.noData')}
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    {t('reports.title')}
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    {t('reports.status')}
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    {t('reports.start')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {exams.map((e, i) => (
                  <tr
                    key={e._id || i}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {e.title || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${e.status === "active" ? "bg-emerald-100 text-emerald-700" : e.status === "completed" ? "bg-slate-100 text-slate-600" : "bg-amber-100 text-amber-700"}`}
                      >
                        {e.status || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {e.startDate
                        ? new Date(e.startDate).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAcademicReports;
