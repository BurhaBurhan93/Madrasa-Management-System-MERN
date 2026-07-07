import { useState, useEffect, useMemo } from 'react';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';
import { BarChartComponent } from '../../components/UIHelper/ECharts';
import { useTranslation } from 'react-i18next';
import { PANEL_PAGE_BG } from '../../Constatns/pageStyles';
import { buildPeriodQuery, getDefaultPeriodFilters } from '../../utils/reportPeriods';

const TeacherAttendanceReports = () => {
  const { t } = useTranslation();
  const [summary, setSummary] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filters, setFilters] = useState({ classId: '', ...getDefaultPeriodFilters() });
  const [loading, setLoading] = useState(false);

  const fieldCls = 'rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200';

  async function fetchClasses() {
    try {
      const res = await apiFetch('/teacher/classes');
      const data = await parseJsonSafe(res);
      if (data.success) setClasses(data.data);
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchReport() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...buildPeriodQuery(filters),
        ...(filters.classId && { classId: filters.classId }),
      });
      const res = await apiFetch(`/teacher/attendance/report?${params}`);
      const data = await parseJsonSafe(res);
      if (data.success) setSummary(data.data);
    } catch (e) {
      console.error(e);
      setSummary([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchClasses(); }, []);
  useEffect(() => { fetchReport(); }, [filters.classId, filters.period, filters.date, filters.week, filters.month, filters.year]);

  const getCount = (statuses, status) => statuses?.find(item => item.status === status)?.count || 0;

  const chartData = summary.map(row => ({
    name: row.user?.name?.split(' ')[0] || t('teacher.teacherAttendanceReports.messages.na', 'N/A'),
    present: getCount(row.statuses, 'present'),
    absent: getCount(row.statuses, 'absent'),
    late: getCount(row.statuses, 'late'),
  }));

  const totals = summary.reduce((acc, row) => ({
    present: acc.present + getCount(row.statuses, 'present'),
    absent: acc.absent + getCount(row.statuses, 'absent'),
    late: acc.late + getCount(row.statuses, 'late'),
    excused: acc.excused + getCount(row.statuses, 'excused'),
  }), { present: 0, absent: 0, late: 0, excused: 0 });

  const totalSessions = totals.present + totals.absent + totals.late + totals.excused;
  const rate = totalSessions > 0 ? Math.round((totals.present / totalSessions) * 100) : 0;

  const statCards = [
    { label: t('teacher.teacherAttendanceReports.stats.totalSessions', 'Total Sessions'), value: totalSessions, accent: 'bg-cyan-500' },
    { label: t('teacher.teacherAttendanceReports.stats.present', 'Present'), value: totals.present, accent: 'bg-emerald-500' },
    { label: t('teacher.teacherAttendanceReports.stats.absent', 'Absent'), value: totals.absent, accent: 'bg-rose-500' },
    { label: t('teacher.teacherAttendanceReports.stats.attendanceRate', 'Attendance Rate'), value: `${rate}%`, accent: 'bg-violet-500' },
  ];

  const months = [
    t('teacher.teacherAttendanceReports.months.jan', 'Jan'),
    t('teacher.teacherAttendanceReports.months.feb', 'Feb'),
    t('teacher.teacherAttendanceReports.months.mar', 'Mar'),
    t('teacher.teacherAttendanceReports.months.apr', 'Apr'),
    t('teacher.teacherAttendanceReports.months.may', 'May'),
    t('teacher.teacherAttendanceReports.months.jun', 'Jun'),
    t('teacher.teacherAttendanceReports.months.jul', 'Jul'),
    t('teacher.teacherAttendanceReports.months.aug', 'Aug'),
    t('teacher.teacherAttendanceReports.months.sep', 'Sep'),
    t('teacher.teacherAttendanceReports.months.oct', 'Oct'),
    t('teacher.teacherAttendanceReports.months.nov', 'Nov'),
    t('teacher.teacherAttendanceReports.months.dec', 'Dec'),
  ];

  const periodSubtitle = useMemo(() => {
    if (filters.period === 'daily') return t('teacher.teacherAttendanceReports.periods.daily', 'Daily attendance analytics for your classes');
    if (filters.period === 'weekly') return t('teacher.teacherAttendanceReports.periods.weekly', 'Weekly attendance analytics for your classes');
    return t('teacher.teacherAttendanceReports.periods.monthly', 'Monthly attendance analytics for your classes');
  }, [filters.period, t]);

  return (
    <div className={PANEL_PAGE_BG}>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('teacher.teacherAttendanceReports.title', 'Attendance Reports')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{periodSubtitle}</p>
        </div>

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{t('teacher.teacherAttendanceReports.filters.class', 'Class')}</label>
              <select value={filters.classId} onChange={e => setFilters(current => ({ ...current, classId: e.target.value }))} className={fieldCls}>
                <option value="">{t('teacher.teacherAttendanceReports.filters.allClasses', 'All Classes')}</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{t('teacher.teacherAttendanceReports.filters.period', 'Period')}</label>
              <select value={filters.period} onChange={e => setFilters(current => ({ ...current, period: e.target.value }))} className={fieldCls}>
                <option value="daily">{t('teacher.teacherAttendanceReports.periods.daily', 'Daily')}</option>
                <option value="weekly">{t('teacher.teacherAttendanceReports.periods.weekly', 'Weekly')}</option>
                <option value="monthly">{t('teacher.teacherAttendanceReports.periods.monthly', 'Monthly')}</option>
              </select>
            </div>

            {filters.period === 'daily' && (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{t('teacher.teacherAttendanceReports.filters.date', 'Date')}</label>
                <input type="date" value={filters.date} onChange={e => setFilters(current => ({ ...current, date: e.target.value }))} className={fieldCls} />
              </div>
            )}

            {filters.period === 'weekly' && (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{t('teacher.teacherAttendanceReports.filters.week', 'Week')}</label>
                <input type="week" value={filters.week} onChange={e => setFilters(current => ({ ...current, week: e.target.value }))} className={fieldCls} />
              </div>
            )}

            {filters.period === 'monthly' && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{t('teacher.teacherAttendanceReports.filters.month', 'Month')}</label>
                  <select value={filters.month} onChange={e => setFilters(current => ({ ...current, month: e.target.value }))} className={fieldCls}>
                    <option value="">{t('teacher.teacherAttendanceReports.filters.selectMonth', 'Select month')}</option>
                    {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{t('teacher.teacherAttendanceReports.filters.year', 'Year')}</label>
                  <input type="number" value={filters.year || ''} onChange={e => setFilters(current => ({ ...current, year: e.target.value }))} className={`${fieldCls} w-24`} />
                </div>
              </>
            )}
          </div>
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map(card => (
            <div key={card.label} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
              <div className={`absolute inset-x-0 top-0 h-1 ${card.accent}`} />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{card.value}</p>
            </div>
          ))}
        </section>

        {chartData.length > 0 && (
          <div className="mb-6 rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
            <BarChartComponent data={chartData} dataKey="present" nameKey="name" title={t('teacher.teacherAttendanceReports.chartTitle', 'Student Attendance Overview')} height={300} color="#0EA5E9" />
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          {loading ? (
            <div className="flex h-32 items-center justify-center text-slate-500 dark:text-slate-400">{t('teacher.teacherAttendanceReports.messages.loading', 'Loading...')}</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-700/50 dark:bg-slate-800/80">
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">{t('teacher.teacherAttendanceReports.table.student', 'Student')}</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">{t('teacher.teacherAttendanceReports.table.code', 'Code')}</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">{t('teacher.teacherAttendanceReports.table.present', 'Present')}</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-[0.12em] text-rose-600">{t('teacher.teacherAttendanceReports.table.absent', 'Absent')}</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-[0.12em] text-amber-600">{t('teacher.teacherAttendanceReports.table.late', 'Late')}</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-[0.12em] text-sky-600">{t('teacher.teacherAttendanceReports.table.excused', 'Excused')}</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">{t('teacher.teacherAttendanceReports.table.rate', 'Rate')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {summary.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500 dark:text-slate-400">{t('teacher.teacherAttendanceReports.messages.noData', 'No attendance data for the selected period')}</td>
                  </tr>
                ) : (
                  summary.map(row => {
                    const present = getCount(row.statuses, 'present');
                    const absent = getCount(row.statuses, 'absent');
                    const late = getCount(row.statuses, 'late');
                    const excused = getCount(row.statuses, 'excused');
                    const total = present + absent + late + excused;
                    const rowRate = total > 0 ? Math.round((present / total) * 100) : 0;
                    return (
                      <tr key={row._id} className="transition-colors duration-150 hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-800/30">
                        <td className="p-4 font-medium text-slate-900 dark:text-slate-100">{row.user?.name}</td>
                        <td className="p-4 text-slate-500 dark:text-slate-400">{row.student?.studentCode}</td>
                        <td className="p-4 text-center font-semibold text-emerald-600">{present}</td>
                        <td className="p-4 text-center font-semibold text-rose-600">{absent}</td>
                        <td className="p-4 text-center font-semibold text-amber-600">{late}</td>
                        <td className="p-4 text-center font-semibold text-sky-600">{excused}</td>
                        <td className="p-4 text-center">
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${rowRate >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{rowRate}%</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherAttendanceReports;
