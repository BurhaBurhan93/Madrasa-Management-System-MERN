import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';
import { PANEL_PAGE_BG } from '../../Constatns/pageStyles';

const TeacherStudents = () => {
 const { t } = useTranslation(['teacher', 'common', 'nav', 'app']);
 const navigate = useNavigate();
 const [loading, setLoading] = useState(true);
 const [subjects, setSubjects] = useState([]);
 const [students, setStudents] = useState([]);
 const [selectedSubject, setSelectedSubject] = useState('all');
 const [selectedStatus, setSelectedStatus] = useState('all');
 const [search, setSearch] = useState('');

 useEffect(() => { fetchData(); }, []);

 const fetchData = async () => {
 try {
 setLoading(true);
 const [subjectsRes, studentsRes] = await Promise.all([
 apiFetch('/teacher/subjects'),
 apiFetch('/teacher/students')
 ]);
 setSubjects((await parseJsonSafe(subjectsRes)).data || []);
 setStudents((await parseJsonSafe(studentsRes)).data || []);
 } catch (error) {
 console.error('Error fetching data:', error);
 } finally {
 setLoading(false);
 }
 };

 const filteredStudents = students.filter(student => {
 const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;
 const matchesSearch =
 (student.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
 (student.studentCode || '').toLowerCase().includes(search.toLowerCase());
 const matchesSubject = selectedSubject === 'all' || student.currentClass?._id === selectedSubject;
 return matchesStatus && matchesSearch && matchesSubject;
 });

 const stats = {
 total: students.length,
 active: students.filter(s => s.status === 'active').length,
 inactive: students.filter(s => s.status === 'inactive').length,
 subjects: subjects.length,
 };

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
  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{t('students.title')}</h1>
  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t('students.subtitle')}</p>
  </div>

  <section className="mb-6 sm:mb-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
  {[
  { label: t('students.totalStudents'), value: stats.total, accent: 'bg-cyan-500' },
  { label: t('students.activeStudents'), value: stats.active, accent: 'bg-emerald-500' },
  { label: t('students.inactiveStudents'), value: stats.inactive, accent: 'bg-rose-500' },
  { label: t('students.mySubjects'), value: stats.subjects, accent: 'bg-violet-500' },
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
  <input type="text" placeholder={t('students.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)}
  className="w-full sm:flex-1 rounded-xl border border-slate-300 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-600 outline-none focus:border-slate-400 dark:border-slate-600 dark:text-slate-200 dark:focus:border-slate-400" />
  <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}
  className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-600 outline-none focus:border-slate-400 dark:border-slate-600 dark:text-slate-200">
  <option value="all">{t('students.allStatus')}</option>
  <option value="active">{t('common.active')}</option>
  <option value="inactive">{t('common.inactive')}</option>
  </select>
  <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
  className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-600 outline-none focus:border-slate-400 dark:border-slate-600 dark:text-slate-200">
  <option value="all">{t('students.allSubjects')}</option>
  {subjects.map(sub => <option key={sub._id} value={sub._id}>{sub.name || t('na')}</option>)}
  </select>
 </div>
 </div>

 {filteredStudents.length === 0 ? (
 <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 sm:py-16 text-center dark:border-slate-700">
  <p className="text-base sm:text-lg font-medium text-slate-500 dark:text-slate-400">{t('students.noStudentsFound')}</p>
  <p className="mt-2 text-xs sm:text-sm text-slate-400 dark:text-slate-500">{t('students.registerStudentsMessage')}</p>
 </div>
 ) : (
 <div className="overflow-x-auto rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 ">
  <table className="w-full text-xs sm:text-sm">
  <thead>
  <tr className="border-b border-slate-200 dark:border-slate-700">
  <th className="p-3 sm:p-4 text-left font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{t('students.name')}</th>
  <th className="p-3 sm:p-4 text-left font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{t('students.code')}</th>
  <th className="p-3 sm:p-4 text-left font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{t('students.class')}</th>
  <th className="hidden sm:table-cell p-3 sm:p-4 text-left font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{t('students.email')}</th>
  <th className="p-3 sm:p-4 text-left font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{t('students.status')}</th>
  <th className="p-3 sm:p-4 text-left font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{t('common.actions')}</th>
  </tr>
  </thead>
  <tbody>
  {filteredStudents.map(student => (
  <tr key={student._id} className="border-b border-slate-100 dark:border-slate-700/50 dark:">
  <td className="p-3 sm:p-4">
  <div className="flex items-center gap-2 sm:gap-3">
  <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 text-xs font-bold text-white">
  {student.user?.name?.[0] || t('na')}
  </div>
  <span className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[100px] sm:max-w-none">{student.user?.name || t('students.unknown')}</span>
  </div>
  </td>
  <td className="p-3 sm:p-4 text-slate-600 dark:text-slate-300 font-mono">{student.studentCode || t('na') || '-'}</td>
  <td className="p-3 sm:p-4 text-slate-600 dark:text-slate-300">{student.currentClass?.name || t('na') || '-'} {student.currentClass?.section || ''}</td>
  <td className="hidden sm:table-cell p-3 sm:p-4 text-slate-600 dark:text-slate-300 truncate max-w-[150px]">{student.user?.email || t('na') || '-'}</td>
  <td className="p-3 sm:p-4">
  <span className={`rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-medium ${student.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
  {student.status === 'active' ? t('common.active') : t('common.inactive')}
  </span>
  </td>
  <td className="p-3 sm:p-4">
  <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
  <button onClick={() => navigate('/teacher/attendance')}
  className="rounded-xl border border-slate-200 bg-white px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-slate-600 transition dark:border-slate-600 dark:text-slate-200 dark:">
  {t('students.markAttendance')}
  </button>
  <button onClick={() => navigate('/teacher/results/enter-marks')}
  className="rounded-xl border border-slate-200 bg-white px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-slate-600 transition dark:border-slate-600 dark:text-slate-200 dark:">
  {t('students.enterMarks')}
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

export default TeacherStudents;
