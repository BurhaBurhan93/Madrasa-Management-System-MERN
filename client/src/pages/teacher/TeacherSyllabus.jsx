import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';
import { PANEL_PAGE_BG } from '../../Constatns/pageStyles';

const MOCK = [
 { _id: '1', className: 'Class 10', subject: 'Quran Tafsir', topic: 'Surah Al-Fatiha', description: 'Detailed explanation of Surah Al-Fatiha, its meaning and significance', semester: '1st Semester', order: 1 },
 { _id: '2', className: 'Class 10', subject: 'Quran Tafsir', topic: 'Surah Al-Baqarah (1-50)', description: 'Introduction to Surah Al-Baqarah and verses 1-50', semester: '1st Semester', order: 2 },
 { _id: '3', className: 'Class 10', subject: 'Hadith Studies', topic: 'Introduction to Hadith', description: 'History of Hadith compilation, terminology and classification', semester: '1st Semester', order: 1 },
 { _id: '4', className: 'Class 10', subject: 'Hadith Studies', topic: 'Sahih Al-Bukhari', description: 'Study of selected hadith from Sahih Al-Bukhari', semester: '1st Semester', order: 2 },
 { _id: '5', className: 'Class 9', subject: 'Fiqh', topic: 'Introduction to Fiqh', description: 'Basic principles of Islamic jurisprudence', semester: '1st Semester', order: 1 },
 { _id: '6', className: 'Class 9', subject: 'Fiqh', topic: 'Rules of Prayer', description: 'Detailed study of the rules and conditions of Salah', semester: '1st Semester', order: 2 },
 { _id: '7', className: 'Class 9', subject: 'Arabic Language', topic: 'Grammar Basics', description: 'Introduction to Arabic grammar, nouns and verbs', semester: '1st Semester', order: 1 },
 { _id: '8', className: 'Class 8', subject: 'Quran Memorization', topic: 'Juz 30 Review', description: 'Review and memorization of Juz 30', semester: '2nd Semester', order: 1 },
];

const TeacherSyllabus = () => {
 const { t } = useTranslation(['teacher', 'common', 'nav', 'app']);
 const [items, setItems] = useState([]);
 const [loading, setLoading] = useState(false);
 const [classFilter, setClassFilter] = useState('');
 const [subjectFilter, setSubjectFilter] = useState('');

 const fieldCls = 'rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400 dark:border-slate-600 dark:text-slate-200';

 useEffect(() => {
 fetchSyllabus();
 }, []);

 const fetchSyllabus = async () => {
 setLoading(true);
 try {
 const res = await apiFetch('/academic/syllabus');
 const data = await parseJsonSafe(res);
 if (data.success && data.data?.length > 0) setItems(data.data);
 else setItems(MOCK);
 } catch (e) {
 console.error(e);
 setItems(MOCK);
 } finally {
 setLoading(false);
 }
 };

 const classes = [...new Set(items.map((i) => i.className).filter(Boolean))];
 const subjects = [...new Set(items.map((i) => i.subject).filter(Boolean))];

 const filtered = items.filter((i) => {
 if (classFilter && i.className !== classFilter) return false;
 if (subjectFilter && i.subject !== subjectFilter) return false;
 return true;
 });

 const renderLoading = () => (
 <div className="flex items-center justify-center py-20">
 <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500 dark:border-slate-700 dark:border-t-cyan-400" />
 </div>
 );

 return (
 <div className={PANEL_PAGE_BG}>
 <div className="px-3 py-4 sm:px-6 lg:px-8">
  <div className="mb-6 sm:mb-8">
  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{t('syllabus.title')}</h1>
  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t('syllabus.subtitle')}</p>
  </div>

  <div className="mb-6 rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-3 sm:p-5 shadow-sm dark:border-slate-700 ">
  <div className="flex flex-wrap gap-3 sm:gap-4">
  <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className={fieldCls}>
  <option value="">{t('syllabus.allClasses')}</option>
  {classes.map((c) => <option key={c} value={c}>{c}</option>)}
  </select>
  <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className={fieldCls}>
  <option value="">{t('syllabus.allSubjects')}</option>
  {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
  </select>
  </div>
  </div>

  {loading ? renderLoading() : (
  <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 ">
  <table className="w-full text-left text-xs sm:text-sm">
  <thead>
  <tr className="border-b border-slate-200 dark:border-slate-700">
  <th className="px-3 sm:px-5 py-3 sm:py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{t('syllabus.class')}</th>
  <th className="px-3 sm:px-5 py-3 sm:py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{t('syllabus.subject')}</th>
  <th className="px-3 sm:px-5 py-3 sm:py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{t('syllabus.topic')}</th>
  <th className="hidden sm:table-cell px-3 sm:px-5 py-3 sm:py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{t('syllabus.description')}</th>
  <th className="hidden sm:table-cell px-3 sm:px-5 py-3 sm:py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{t('syllabus.semester')}</th>
  <th className="px-3 sm:px-5 py-3 sm:py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{t('syllabus.order')}</th>
  </tr>
  </thead>
  <tbody>
  {filtered.map((item) => (
  <tr key={item._id} className="border-b border-slate-100 transition last:border-0 dark:border-slate-700/50 dark:">
  <td className="px-3 sm:px-5 py-3 sm:py-4 font-medium text-slate-900 dark:text-slate-100">{item.className || '-'}</td>
  <td className="px-3 sm:px-5 py-3 sm:py-4 text-slate-600 dark:text-slate-300">{item.subject || '-'}</td>
  <td className="px-3 sm:px-5 py-3 sm:py-4 text-slate-600 dark:text-slate-300 truncate max-w-[120px] sm:max-w-none">{item.topic || '-'}</td>
  <td className="hidden sm:table-cell max-w-xs truncate px-3 sm:px-5 py-3 sm:py-4 text-slate-600 dark:text-slate-300">{item.description || '-'}</td>
  <td className="hidden sm:table-cell px-3 sm:px-5 py-3 sm:py-4 text-slate-600 dark:text-slate-300">{item.semester || '-'}</td>
  <td className="px-3 sm:px-5 py-3 sm:py-4 text-slate-600 dark:text-slate-300">{item.order || 0}</td>
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

export default TeacherSyllabus;
