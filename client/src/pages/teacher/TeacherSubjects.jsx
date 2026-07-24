import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';
import { PANEL_PAGE_BG } from '../../Constatns/pageStyles';

const statusVariants = {
 active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
 completed: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
 upcoming: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
 inactive: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
 default: ' text-slate-600 dark:text-slate-300',
};

const TeacherSubjects = () => {
 const { t } = useTranslation(['teacher', 'common', 'nav', 'app']);
 const navigate = useNavigate();
 const [loading, setLoading] = useState(true);
 const [subjects, setSubjects] = useState([]);
 const [filter, setFilter] = useState('all');
 const [sortBy, setSortBy] = useState('name');

 useEffect(() => { fetchSubjects(); }, []);

 const fetchSubjects = async () => {
 try {
 setLoading(true);
 const res = await apiFetch('/teacher/subjects');
 const data = await parseJsonSafe(res);
 setSubjects(data.data || []);
 } catch (error) {
 console.error('Error fetching subjects:', error);
 } finally {
 setLoading(false);
 }
 };

 const filteredSubjects = subjects
 .filter(sub => filter === 'all' || (sub.status || 'active') === filter)
 .sort((a, b) => {
 if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
 if (sortBy === 'students') return (b.students || 0) - (a.students || 0);
 if (sortBy === 'progress') return (b.progress || 0) - (a.progress || 0);
 return 0;
 });

 const totalStudents = subjects.reduce((sum, s) => sum + (s.students || 0), 0);
 const totalHours = subjects.reduce((sum, s) => sum + (s.weeklyHours || 0), 0);

 if (loading) {
 return (
 <div className={PANEL_PAGE_BG}>
 <div className="flex h-64 items-center justify-center">
 <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-600" />
 </div>
 </div>
 );
 }

 return (
 <div className={PANEL_PAGE_BG}>
 <div className="px-3 py-4 sm:px-6 lg:px-8">
  <div className="mb-6 sm:mb-8">
  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{t('common.subjects')}</h1>
  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t('common.manageSubjectsWorkload')}</p>
 </div>

  <section className="mb-6 sm:mb-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
  {[
  { label: t('dashboard.totalSubjects'), value: subjects.length, accent: 'bg-cyan-500' },
  { label: t('dashboard.activeClasses'), value: subjects.filter(s => (s.status || 'active') === 'active').length, accent: 'bg-emerald-500' },
  { label: t('dashboard.totalStudents'), value: totalStudents, accent: 'bg-violet-500' },
  { label: t('common.weeklyHours'), value: totalHours, accent: 'bg-amber-500' },
  ].map(c => (
  <div key={c.label} className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-700 ">
  <div className={`absolute inset-x-0 top-0 h-1 ${c.accent}`} />
  <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">{c.label}</p>
  <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{c.value}</p>
  </div>
  ))}
  </section>

 <div className="mb-6 rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-3 sm:p-5 shadow-sm dark:border-slate-700 ">
  <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
  <div className="flex flex-wrap gap-1.5 sm:gap-2">
  {['all', 'active', 'completed', 'upcoming', 'inactive'].map(status => (
  <button key={status} onClick={() => setFilter(status)}
  className={`rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium transition-all ${filter === status ? 'bg-cyan-600 text-white shadow-sm' : ' text-slate-600 dark:text-slate-300 dark:'}`}>
  {t(`common.${status}`)}
  </button>
  ))}
  </div>
  <select value={sortBy} onChange={e => setSortBy(e.target.value)}
  className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-700 outline-none transition focus:border-slate-400 dark:border-slate-600 dark:text-slate-200">
  <option value="name">{t('common.sortByName')}</option>
  <option value="students">{t('common.sortByStudents')}</option>
  <option value="progress">{t('common.sortByProgress')}</option>
  </select>
 </div>
 </div>

 {filteredSubjects.length === 0 ? (
  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 sm:py-12 text-center text-xs sm:text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
  {t('common.noSubjectsFound')}
 </div>
 ) : (
 <div className="overflow-x-auto rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 ">
  <table className="w-full text-xs sm:text-sm">
  <thead>
  <tr className="border-b border-slate-200 dark:border-slate-700">
  <th className="p-3 sm:p-4 text-left font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{t('common.subjectName')}</th>
  <th className="p-3 sm:p-4 text-left font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{t('common.code')}</th>
  <th className="hidden sm:table-cell p-3 sm:p-4 text-left font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{t('common.credits')}</th>
  <th className="p-3 sm:p-4 text-left font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{t('dashboard.totalStudents')}</th>
  <th className="p-3 sm:p-4 text-left font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{t('common.status')}</th>
  <th className="p-3 sm:p-4 text-left font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{t('common.actions')}</th>
  </tr>
  </thead>
  <tbody>
  {filteredSubjects.map(subject => (
  <tr key={subject._id} className="border-b border-slate-100 dark:border-slate-700/50 dark:">
  <td className="p-3 sm:p-4 font-medium text-slate-900 dark:text-slate-100 max-w-[120px] sm:max-w-none truncate">{subject.name || t('common.unnamedSubject')}</td>
  <td className="p-3 sm:p-4 text-slate-600 dark:text-slate-300">{subject.code || '-'}</td>
  <td className="hidden sm:table-cell p-3 sm:p-4 text-slate-600 dark:text-slate-300">{subject.credits || '-'}</td>
  <td className="p-3 sm:p-4 text-slate-600 dark:text-slate-300">{subject.students || 0}</td>
  <td className="p-3 sm:p-4">
  <span className={`rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-medium ${statusVariants[subject.status || 'default'] || statusVariants.default}`}>
  {subject.status ? t(`common.${subject.status}`) : subject.isActive ? t('common.active') : t('common.inactive')}
  </span>
  </td>
  <td className="p-3 sm:p-4">
  <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
  <button onClick={() => navigate(`/teacher/students?subjectId=${subject._id}`)}
  className="rounded-xl border border-slate-200 bg-white px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-slate-600 transition dark:border-slate-600 dark:text-slate-200 dark:">
  {t('common.students')}
  </button>
  <button onClick={() => navigate(`/teacher/attendance?subjectId=${subject._id}`)}
  className="rounded-xl border border-slate-200 bg-white px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-slate-600 transition dark:border-slate-600 dark:text-slate-200 dark:">
  {t('common.attendance')}
  </button>
  </div>
  </td>
  </tr>
  ))}
  </tbody>
  </table>
 </div>
 )}
 </div>
 </div>
 );
};

export default TeacherSubjects;
