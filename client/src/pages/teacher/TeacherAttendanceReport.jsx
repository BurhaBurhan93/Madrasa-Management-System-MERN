import { useState, useEffect, useMemo } from 'react';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';
import { BarChartComponent } from '../../components/UIHelper/ECharts';
import { useTranslation } from 'react-i18next';
import { PANEL_PAGE_BG } from '../../Constatns/pageStyles';
import { buildPeriodQuery, getDefaultPeriodFilters } from '../../utils/reportPeriods';

const TeacherAttendanceReports = () => {
 const { t } = useTranslation(['teacher', 'common', 'nav', 'app']);
 const [summary, setSummary] = useState([]);
 const [classes, setClasses] = useState([]);
 const [filters, setFilters] = useState({ classId: '', ...getDefaultPeriodFilters() });
 const [loading, setLoading] = useState(false);

 const fieldCls = 'rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400 dark:border-slate-600 dark:text-slate-200';

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
 name: row.user?.name?.split(' ')[0] || t('teacherAttendanceReports.messages.na'),
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
 { label: t('teacherAttendanceReports.stats.totalSessions'), value: totalSessions, accent: 'bg-cyan-500' },
 { label: t('teacherAttendanceReports.stats.present'), value: totals.present, accent: 'bg-emerald-500' },
 { label: t('teacherAttendanceReports.stats.absent'), value: totals.absent, accent: 'bg-rose-500' },
 { label: t('teacherAttendanceReports.stats.attendanceRate'), value: `${rate}%`, accent: 'bg-violet-500' },
 ];

 const months = [
 t('teacherAttendanceReports.months.jan'),
 t('teacherAttendanceReports.months.feb'),
 t('teacherAttendanceReports.months.mar'),
 t('teacherAttendanceReports.months.apr'),
 t('teacherAttendanceReports.months.may'),
 t('teacherAttendanceReports.months.jun'),
 t('teacherAttendanceReports.months.jul'),
 t('teacherAttendanceReports.months.aug'),
 t('teacherAttendanceReports.months.sep'),
 t('teacherAttendanceReports.months.oct'),
 t('teacherAttendanceReports.months.nov'),
 t('teacherAttendanceReports.months.dec'),
 ];

 const periodSubtitle = useMemo(() => {
 if (filters.period === 'daily') return t('teacherAttendanceReports.periods.daily');
 if (filters.period === 'weekly') return t('teacherAttendanceReports.periods.weekly');
 return t('teacherAttendanceReports.periods.monthly');
 }, [filters.period, t]);

 return (
 <div className={PANEL_PAGE_BG}>
  <div className="px-3 py-4 sm:px-6 lg:px-8">
  <div className="mb-6 sm:mb-8">
  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{t('teacherAttendanceReports.title')}</h1>
  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">{periodSubtitle}</p>
  </div>

  <div className="mb-6 rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-3 sm:p-5 shadow-sm dark:border-slate-700 ">
  <div className="flex flex-wrap items-end gap-3 sm:gap-4">
 <div>
 <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{t('teacherAttendanceReports.filters.class')}</label>
 <select value={filters.classId} onChange={e => setFilters(current => ({ ...current, classId: e.target.value }))} className={fieldCls}>
 <option value="">{t('teacherAttendanceReports.filters.allClasses')}</option>
 {classes.map(c => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
 </select>
 </div>

 <div>
 <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{t('teacherAttendanceReports.filters.period')}</label>
 <select value={filters.period} onChange={e => setFilters(current => ({ ...current, period: e.target.value }))} className={fieldCls}>
 <option value="daily">{t('teacherAttendanceReports.periods.daily')}</option>
 <option value="weekly">{t('teacherAttendanceReports.periods.weekly')}</option>
 <option value="monthly">{t('teacherAttendanceReports.periods.monthly')}</option>
 </select>
 </div>

 {filters.period === 'daily' && (
 <div>
 <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{t('teacherAttendanceReports.filters.date')}</label>
 <input type="date" value={filters.date} onChange={e => setFilters(current => ({ ...current, date: e.target.value }))} className={fieldCls} />
 </div>
 )}

 {filters.period === 'weekly' && (
 <div>
 <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{t('teacherAttendanceReports.filters.week')}</label>
 <input type="week" value={filters.week} onChange={e => setFilters(current => ({ ...current, week: e.target.value }))} className={fieldCls} />
 </div>
 )}

 {filters.period === 'monthly' && (
 <>
 <div>
 <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{t('teacherAttendanceReports.filters.month')}</label>
 <select value={filters.month} onChange={e => setFilters(current => ({ ...current, month: e.target.value }))} className={fieldCls}>
 <option value="">{t('teacherAttendanceReports.filters.selectMonth')}</option>
 {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
 </select>
 </div>
 <div>
 <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{t('teacherAttendanceReports.filters.year')}</label>
 <input type="number" value={filters.year || ''} onChange={e => setFilters(current => ({ ...current, year: e.target.value }))} className={`${fieldCls} w-24`} />
 </div>
 </>
 )}
 </div>
 </div>

  <section className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 md:grid-cols-4">
  {statCards.map(card => (
  <div key={card.label} className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-3 sm:p-5 shadow-sm dark:border-slate-700 ">
  <div className={`absolute inset-x-0 top-0 h-1 ${card.accent}`} />
  <p className="text-[10px] sm:text-sm font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
  <p className="mt-2 sm:mt-3 text-xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{card.value}</p>
  </div>
  ))}
  </section>

  {chartData.length > 0 && (
  <div className="mb-6 rounded-2xl sm:rounded-[28px] border border-slate-200 bg-white p-2 sm:p-3 shadow-sm dark:border-slate-700 ">
  <BarChartComponent data={chartData} dataKey="present" nameKey="name" title={t('teacherAttendanceReports.chartTitle')} height={200} color="#0EA5E9" />
  </div>
  )}

  <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 ">
  {loading ? (
  <div className="flex h-32 items-center justify-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t('teacherAttendanceReports.messages.loading')}</div>
  ) : (
  <div className="overflow-x-auto">
  <table className="w-full text-xs sm:text-sm">
  <thead>
  <tr className="border-b border-slate-100 dark:border-slate-700/50 ">
  <th className="p-3 sm:p-4 text-left text-[10px] sm:text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300 whitespace-nowrap">{t('teacherAttendanceReports.table.student')}</th>
  <th className="hidden sm:table-cell p-3 sm:p-4 text-left text-[10px] sm:text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300 whitespace-nowrap">{t('teacherAttendanceReports.table.code')}</th>
  <th className="p-3 sm:p-4 text-center text-[10px] sm:text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600 whitespace-nowrap">{t('teacherAttendanceReports.table.present')}</th>
  <th className="p-3 sm:p-4 text-center text-[10px] sm:text-xs font-semibold uppercase tracking-[0.12em] text-rose-600 whitespace-nowrap">{t('teacherAttendanceReports.table.absent')}</th>
  <th className="hidden sm:table-cell p-3 sm:p-4 text-center text-[10px] sm:text-xs font-semibold uppercase tracking-[0.12em] text-amber-600 whitespace-nowrap">{t('teacherAttendanceReports.table.late')}</th>
  <th className="hidden sm:table-cell p-3 sm:p-4 text-center text-[10px] sm:text-xs font-semibold uppercase tracking-[0.12em] text-sky-600 whitespace-nowrap">{t('teacherAttendanceReports.table.excused')}</th>
  <th className="p-3 sm:p-4 text-center text-[10px] sm:text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300 whitespace-nowrap">{t('teacherAttendanceReports.table.rate')}</th>
  </tr>
  </thead>
  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
  {summary.length === 0 ? (
  <tr>
  <td colSpan="7" className="p-6 sm:p-8 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t('teacherAttendanceReports.messages.noData')}</td>
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
  <tr key={row._id} className="transition-colors duration-150 dark:border-slate-700/50 dark:">
  <td className="p-3 sm:p-4 font-medium text-slate-900 dark:text-slate-100 truncate max-w-[120px] sm:max-w-none">{row.user?.name}</td>
  <td className="hidden sm:table-cell p-3 sm:p-4 text-slate-500 dark:text-slate-400">{row.student?.studentCode}</td>
  <td className="p-3 sm:p-4 text-center font-semibold text-emerald-600">{present}</td>
  <td className="p-3 sm:p-4 text-center font-semibold text-rose-600">{absent}</td>
  <td className="hidden sm:table-cell p-3 sm:p-4 text-center font-semibold text-amber-600">{late}</td>
  <td className="hidden sm:table-cell p-3 sm:p-4 text-center font-semibold text-sky-600">{excused}</td>
  <td className="p-3 sm:p-4 text-center">
  <span className={`rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium ${rowRate >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{rowRate}%</span>
  </td>
  </tr>
  );
  })
  )}
  </tbody>
  </table>
  </div>
  )}
  </div>
 </div>
 </div>
 );
};

export default TeacherAttendanceReports;
