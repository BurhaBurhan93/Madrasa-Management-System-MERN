import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';
import { useTranslation } from 'react-i18next';
import { PANEL_PAGE_BG } from '../../Constatns/pageStyles';

const statusColors = {
 draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
 published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
 finished: ' text-slate-600 dark:text-slate-300',
 cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

const TeacherExamsList = () => {
 const { t } = useTranslation(['teacher', 'common', 'nav', 'app']);
 const navigate = useNavigate();

 const [exams, setExams] = useState([]);
 const [search, setSearch] = useState('');
 const [statusFilter, setStatusFilter] = useState('');
 const [loading, setLoading] = useState(false);

 const fieldCls = 'rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400 dark:border-slate-600 dark:text-slate-200';

 useEffect(() => {
 fetchExams();
 }, []);

 const fetchExams = async () => {
 setLoading(true);
 try {
 const res = await apiFetch('/teacher/exams');
 const data = await parseJsonSafe(res);
 if (data.success) setExams(data.data);
 } catch (e) {
 console.error(e);
 } finally {
 setLoading(false);
 }
 };

 const handleDelete = async (id) => {
 if (!window.confirm(t('teacher.examsList.deleteExamConfirm'))) return;
 try {
 await apiFetch('/teacher/exams/' + id, { method: 'DELETE' });
 fetchExams();
 } catch (e) {
 alert(t('teacher.examsList.failedToDelete'));
 }
 };

 const handlePublish = async (id) => {
 try {
 const res = await apiFetch('/teacher/exams/' + id + '/publish', {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({}),
 });
 const data = await parseJsonSafe(res);
 if (data.success) {
 alert(t('teacher.examsList.examPublished'));
 fetchExams();
 }
 } catch (e) {
 alert(e.response?.data?.message || t('teacher.examsList.failedToPublish'));
 }
 };

 const handleClose = async (id) => {
 try {
 await apiFetch('/teacher/exams/' + id + '/close', {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({}),
 });
 alert(t('teacher.examsList.examClosed'));
 fetchExams();
 } catch (e) {
 alert(t('teacher.examsList.failedToClose'));
 }
 };

 const filtered = exams.filter((e) => {
 const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
 const matchStatus = statusFilter === '' || e.status === statusFilter;
 return matchSearch && matchStatus;
 });

 const stats = {
 total: exams.length,
 published: exams.filter((e) => e.status === 'published').length,
 draft: exams.filter((e) => e.status === 'draft').length,
 finished: exams.filter((e) => e.status === 'finished').length,
 };

 const statCards = [
 {
 label: t('teacher.examsList.total'),
 value: stats.total,
 accent: 'bg-cyan-500',
 },
 {
 label: t('teacher.examsList.draft'),
 value: stats.draft,
 accent: 'bg-amber-500',
 },
 {
 label: t('teacher.examsList.published'),
 value: stats.published,
 accent: 'bg-emerald-500',
 },
 {
 label: t('teacher.examsList.finished'),
 value: stats.finished,
 accent: 'bg-sky-500',
 },
 ];

 const renderLoading = () => (
 <div className="flex items-center justify-center py-20">
 <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500 dark:border-slate-700 dark:border-t-cyan-400" />
 <span className="ml-3 text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</span>
 </div>
 );

 const renderEmpty = () => (
 <div className="flex flex-col items-center justify-center py-20">
 <div className="mb-4 text-5xl">📋</div>
 <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
 {t('teacher.examsList.noExamsFound')}
 </p>
 </div>
 );

 const renderTable = () => (
 <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 ">
 <table className="w-full text-left text-sm">
 <thead>
 <tr className="border-b border-slate-200 dark:border-slate-700">
 <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">{t('teacher.examsList.title')}</th>
 <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">{t('teacher.examsList.subject')}</th>
 <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">{t('teacher.examsList.class')}</th>
 <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">{t('teacher.examsList.duration')}</th>
 <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">{t('teacher.examsList.status')}</th>
 <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">{t('teacher.examsList.actions')}</th>
 </tr>
 </thead>
 <tbody>
 {filtered.map((exam) => (
 <tr
 key={exam._id}
 className="border-b border-slate-100 transition last:border-0 dark:border-slate-700/50 dark:"
 >
 <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">{exam.title}</td>
 <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{exam.subject?.name || '-'}</td>
 <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
 {exam.class?.name ? (exam.class.section ? `${exam.class.name} - ${exam.class.section}` : exam.class.name) : '-'}
 </td>
 <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{exam.duration} {t('common.minutes')}</td>
 <td className="px-5 py-4">
 <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusColors[exam.status] || ''}`}>
 {t('teacher.examDetails.' + exam.status) || exam.status}
 </span>
 </td>
 <td className="px-5 py-4">
 <div className="flex items-center gap-2">
 <button
 onClick={() => navigate('/teacher/exams/' + exam._id)}
 className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition dark:border-slate-600 dark:text-slate-200 dark:"
 >
 {t('teacher.examsList.view')}
 </button>
 <button
 onClick={() => navigate('/teacher/exams/create?id=' + exam._id)}
 className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 transition hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-900/30 dark:text-sky-400 dark:hover:bg-sky-900/50"
 >
 {t('teacher.examsList.edit')}
 </button>
 {exam.status === 'draft' && (
 <button
 onClick={() => handlePublish(exam._id)}
 className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
 >
 {t('teacher.examsList.publish')}
 </button>
 )}
 {exam.status === 'published' && (
 <button
 onClick={() => handleClose(exam._id)}
 className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition dark:border-slate-600 dark:text-slate-200 dark:"
 >
 {t('teacher.examsList.close')}
 </button>
 )}
 <button
 onClick={() => handleDelete(exam._id)}
 className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50"
 >
 {t('teacher.examsList.delete')}
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 );

 return (
 <div className={PANEL_PAGE_BG}>
 <div className="px-4 py-6 sm:px-6 lg:px-8">
 <div className="mb-8 flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
 {t('teacher.examsList.title')}
 </h1>
 <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
 {t('teacher.examsList.subtitle')}
 </p>
 </div>
 <button
 onClick={() => navigate('/teacher/exams/create')}
 className="rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-cyan-700 hover:shadow-md"
 >
 + {t('teacher.examsList.createExam')}
 </button>
 </div>

 <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
 {statCards.map((c) => (
 <div
 key={c.label}
 className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 "
 >
 <div className={`absolute inset-x-0 top-0 h-1 ${c.accent}`} />
 <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{c.label}</p>
 <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
 {c.value}
 </p>
 </div>
 ))}
 </section>

 <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 ">
 <div className="flex gap-4">
 <input
 type="text"
 placeholder={t('teacher.examsList.searchExam')}
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className={fieldCls + ' flex-1'}
 />
 <select
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className={fieldCls}
 >
 <option value="">{t('teacher.examsList.allStatus')}</option>
 <option value="draft">{t('teacher.examsList.draft')}</option>
 <option value="published">{t('teacher.examsList.published')}</option>
 <option value="finished">{t('teacher.examsList.finished')}</option>
 </select>
 </div>
 </div>

 {loading ? renderLoading() : filtered.length === 0 ? renderEmpty() : renderTable()}
 </div>
 </div>
 );
};

export default TeacherExamsList;
