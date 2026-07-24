import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';
import { PANEL_PAGE_BG } from '../../Constatns/pageStyles';

const statusColors = {
 active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
 completed: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
 cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

const TeacherAssignments = () => {
 const { t } = useTranslation(['teacher', 'common', 'nav', 'app']);
 const navigate = useNavigate();
 const [assignments, setAssignments] = useState([]);
 const [subjects, setSubjects] = useState([]);
 const [filterStatus, setFilterStatus] = useState('all');
 const [filterSubject, setFilterSubject] = useState('all');
 const [loading, setLoading] = useState(false);

 useEffect(() => { fetchAssignments(); fetchSubjects(); }, []);

 const fetchAssignments = async () => {
 setLoading(true);
 try {
 const res = await apiFetch('/teacher/assignments');
 const data = await parseJsonSafe(res);
 if (data.success) setAssignments(data.data);
 } catch (e) { console.error(e); } finally { setLoading(false); }
 };

 const fetchSubjects = async () => {
 try {
 const res = await apiFetch('/teacher/subjects');
 const data = await parseJsonSafe(res);
 if (data.success) setSubjects(data.data);
 } catch (e) { console.error(e); }
 };

 const handleDelete = async (id) => {
 if (!window.confirm(t('assignments.deleteConfirm'))) return;
 try {
 await apiFetch(`/teacher/assignments/${id}`, { method: 'DELETE' });
 fetchAssignments();
 } catch (e) { alert(t('assignments.deleteFailed')); }
 };

 const handleStatusChange = async (id, status) => {
 try {
 await apiFetch(`/teacher/assignments/${id}`, {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ status }),
 });
 fetchAssignments();
 } catch (e) { alert(t('assignments.updateFailed')); }
 };

 const filtered = assignments.filter(a => {
 const matchStatus = filterStatus === 'all' || a.status === filterStatus;
 const matchSubject = filterSubject === 'all' || a.courseId?._id === filterSubject;
 return matchStatus && matchSubject;
 });

 const stats = {
 total: assignments.length,
 active: assignments.filter(a => a.status === 'active').length,
 completed: assignments.filter(a => a.status === 'completed').length,
 overdue: assignments.filter(a => new Date(a.dueDate) < new Date() && a.status === 'active').length,
 };

 return (
 <div className={PANEL_PAGE_BG}>
 <div className="px-3 py-4 sm:px-6 lg:px-8">
  <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
  <div>
  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{t('assignments.title')}</h1>
  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t('assignments.subtitle')}</p>
  </div>
  <button onClick={() => navigate('/teacher/create-assignments')}
  className="w-full sm:w-auto rounded-2xl bg-cyan-600 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-cyan-700 hover:shadow-md">
  + {t('assignments.createAssignment')}
  </button>
 </div>

  <section className="mb-6 sm:mb-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
  {[
  { label: t('assignments.total'), value: stats.total, accent: 'bg-cyan-500' },
  { label: t('assignments.active'), value: stats.active, accent: 'bg-emerald-500' },
  { label: t('assignments.completed'), value: stats.completed, accent: 'bg-violet-500' },
  { label: t('assignments.overdue'), value: stats.overdue, accent: 'bg-rose-500' },
  ].map(c => (
  <div key={c.label} className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-700 ">
  <div className={`absolute inset-x-0 top-0 h-1 ${c.accent}`} />
  <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">{c.label}</p>
  <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{c.value}</p>
  </div>
  ))}
  </section>

  <div className="mb-6 rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-3 sm:p-5 shadow-sm dark:border-slate-700 ">
  <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
  className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-600 outline-none focus:border-slate-400 dark:border-slate-600 dark:text-slate-200">
  <option value="all">{t('assignments.allStatus')}</option>
  <option value="active">{t('common.active')}</option>
  <option value="completed">{t('common.completed')}</option>
  <option value="cancelled">{t('assignments.cancelled')}</option>
  </select>
  <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
  className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-600 outline-none focus:border-slate-400 dark:border-slate-600 dark:text-slate-200">
  <option value="all">{t('assignments.allSubjects')}</option>
  {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
  </select>
  </div>
  </div>

  {loading ? (
  <div className="flex h-32 items-center justify-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t('assignments.loading')}</div>
  ) : filtered.length === 0 ? (
  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 sm:py-12 text-center text-xs sm:text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
  {t('assignments.noAssignmentsFound')}
  </div>
  ) : (
  <div className="overflow-x-auto rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 ">
  <table className="w-full text-xs sm:text-sm">
  <thead>
  <tr className="border-b border-slate-200 dark:border-slate-700">
  <th className="p-3 sm:p-4 text-left font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{t('assignments.title')}</th>
  <th className="p-3 sm:p-4 text-left font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{t('assignments.subject')}</th>
  <th className="p-3 sm:p-4 text-left font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{t('assignments.dueDate')}</th>
  <th className="hidden sm:table-cell p-3 sm:p-4 text-left font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{t('assignments.maxPoints')}</th>
  <th className="p-3 sm:p-4 text-left font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{t('assignments.status')}</th>
  <th className="p-3 sm:p-4 text-left font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{t('common.actions')}</th>
  </tr>
  </thead>
  <tbody>
  {filtered.map(a => {
  const isOverdue = new Date(a.dueDate) < new Date() && a.status === 'active';
  return (
  <tr key={a._id} className="border-b border-slate-100 dark:border-slate-700/50 dark:">
  <td className="p-3 sm:p-4 font-medium text-slate-900 dark:text-slate-100 truncate max-w-[120px] sm:max-w-none">{a.title}</td>
  <td className="p-3 sm:p-4 text-slate-600 dark:text-slate-300">{a.courseId?.name || t('assignments.noSubject')}</td>
  <td className={`p-3 sm:p-4 whitespace-nowrap ${isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'}`}>
  {new Date(a.dueDate).toLocaleDateString()} {isOverdue && <span className="ml-1 text-xs">⚠</span>}
  </td>
  <td className="hidden sm:table-cell p-3 sm:p-4 text-slate-600 dark:text-slate-300">{a.maxPoints}</td>
  <td className="p-3 sm:p-4">
  <span className={`rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-medium ${statusColors[a.status] || ' text-slate-600 dark:text-slate-300'}`}>
  {a.status === 'active' ? t('common.active') : a.status === 'completed' ? t('common.completed') : a.status === 'cancelled' ? t('assignments.cancelled') : a.status}
  </span>
  </td>
  <td className="p-3 sm:p-4">
  <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
  <button onClick={() => navigate(`/teacher/create-assignments?id=${a._id}`)}
  className="rounded-xl border border-slate-200 bg-white px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-slate-600 transition dark:border-slate-600 dark:text-slate-200 dark:">
  {t('common.edit')}
  </button>
  {a.status === 'active' && (
  <button onClick={() => handleStatusChange(a._id, 'completed')}
  className="rounded-xl border border-sky-200 bg-sky-50 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-sky-700 transition hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-900/30 dark:text-sky-400 dark:hover:bg-sky-900/50">
  {t('assignments.markComplete')}
  </button>
  )}
  <button onClick={() => handleDelete(a._id)}
  className="rounded-xl border border-rose-200 bg-rose-50 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50">
  {t('assignments.delete')}
  </button>
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 )}
 </div>
 </div>
 );
};

export default TeacherAssignments;
