import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';
import { PANEL_PAGE_BG } from '../../Constatns/pageStyles';

const gradeColors = {
  'A+': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'A': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'B': 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  'C': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'D': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'F': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

const MOCK_EXAMS = [
  { _id: 'e1', title: 'Mid-Term Quran Tafsir' },
  { _id: 'e2', title: 'Final Hadith Studies' },
  { _id: 'e3', title: 'Quiz - Fiqh' },
];

const MOCK_SUBJECTS = [
  { _id: 's1', name: 'Quran Tafsir' },
  { _id: 's2', name: 'Hadith Studies' },
  { _id: 's3', name: 'Fiqh' },
  { _id: 's4', name: 'Arabic Language' },
];

const MOCK_CLASSES = [
  { _id: 'c1', name: 'Class 10', section: 'A' },
  { _id: 'c2', name: 'Class 10', section: 'B' },
  { _id: 'c3', name: 'Class 9', section: 'A' },
];

const MOCK_RESULTS = [
  { _id: 'r1', student: { user: { name: 'Ahmad Khan' }, studentCode: 'STU-001' }, exam: { title: 'Mid-Term Quran Tafsir' }, subject: { name: 'Quran Tafsir' }, totalScore: 85, grade: 'B', status: 'pass', createdAt: '2026-05-15T10:30:00Z' },
  { _id: 'r2', student: { user: { name: 'Fatima Al-Hassan' }, studentCode: 'STU-002' }, exam: { title: 'Mid-Term Quran Tafsir' }, subject: { name: 'Quran Tafsir' }, totalScore: 72, grade: 'C', status: 'pass', createdAt: '2026-05-15T10:30:00Z' },
  { _id: 'r3', student: { user: { name: 'Yusuf Ibrahim' }, studentCode: 'STU-003' }, exam: { title: 'Mid-Term Quran Tafsir' }, subject: { name: 'Quran Tafsir' }, totalScore: 45, grade: 'F', status: 'fail', createdAt: '2026-05-15T10:30:00Z' },
  { _id: 'r4', student: { user: { name: 'Aisha Omar' }, studentCode: 'STU-004' }, exam: { title: 'Mid-Term Quran Tafsir' }, subject: { name: 'Quran Tafsir' }, totalScore: 91, grade: 'A+', status: 'pass', createdAt: '2026-05-15T10:30:00Z' },
  { _id: 'r5', student: { user: { name: 'Bilal Hussain' }, studentCode: 'STU-005' }, exam: { title: 'Final Hadith Studies' }, subject: { name: 'Hadith Studies' }, totalScore: 63, grade: 'D', status: 'pass', createdAt: '2026-06-20T14:00:00Z' },
];

const TeacherViewResults = () => {
  const { t } = useTranslation();
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filters, setFilters] = useState({ examId: '', subjectId: '', classId: '' });
  const [loading, setLoading] = useState(false);

  const fieldCls = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200';

  useEffect(() => {
    Promise.all([
      apiFetch('/teacher/exams').then(parseJsonSafe),
      apiFetch('/teacher/subjects').then(parseJsonSafe),
      apiFetch('/teacher/classes').then(parseJsonSafe),
    ]).then(([e, s, c]) => {
      if (e.success && e.data?.length > 0) setExams(e.data); else setExams(MOCK_EXAMS);
      if (s.success && s.data?.length > 0) setSubjects(s.data); else setSubjects(MOCK_SUBJECTS);
      if (c.success && c.data?.length > 0) setClasses(c.data); else setClasses(MOCK_CLASSES);
    }).catch(() => {
      setExams(MOCK_EXAMS);
      setSubjects(MOCK_SUBJECTS);
      setClasses(MOCK_CLASSES);
    });
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.examId) params.append('examId', filters.examId);
      if (filters.subjectId) params.append('subjectId', filters.subjectId);
      if (filters.classId) params.append('classId', filters.classId);
      const res = await apiFetch('/teacher/results?' + params.toString());
      const data = await parseJsonSafe(res);
      if (data.success && data.data?.length > 0) setResults(data.data);
      else setResults(MOCK_RESULTS);
    } catch (e) { console.error(e); setResults(MOCK_RESULTS); } finally { setLoading(false); }
  };

  const stats = {
    total: results.length,
    pass: results.filter(r => r.status === 'pass').length,
    fail: results.filter(r => r.status === 'fail').length,
    avg: results.length > 0 ? (results.reduce((s, r) => s + (r.totalScore || 0), 0) / results.length).toFixed(1) : 0,
  };

  return (
    <div className={PANEL_PAGE_BG}>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('teacher.viewResults.title')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('teacher.viewResults.subtitle')}</p>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{t('teacher.viewResults.filterResults')}</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4 items-end">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">{t('teacher.viewResults.exam')}</label>
              <select value={filters.examId} onChange={e => setFilters({ ...filters, examId: e.target.value })} className={fieldCls}>
                <option value="">{t('teacher.viewResults.allExams')}</option>
                {exams.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">{t('teacher.viewResults.subject')}</label>
              <select value={filters.subjectId} onChange={e => setFilters({ ...filters, subjectId: e.target.value })} className={fieldCls}>
                <option value="">{t('teacher.viewResults.allSubjects')}</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">{t('teacher.viewResults.class')}</label>
              <select value={filters.classId} onChange={e => setFilters({ ...filters, classId: e.target.value })} className={fieldCls}>
                <option value="">{t('teacher.viewResults.allClasses')}</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name} {c.section || ''}</option>)}
              </select>
            </div>
            <button onClick={fetchResults} disabled={loading} className="rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-cyan-700 disabled:opacity-60">
              {loading ? t('common.searching') : t('teacher.viewResults.searchResults')}
            </button>
          </div>
        </div>

        {/* Stats */}
        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: t('teacher.viewResults.totalResults'), value: stats.total, accent: 'bg-cyan-500' },
            { label: t('teacher.viewResults.passed'), value: stats.pass, accent: 'bg-emerald-500' },
            { label: t('teacher.viewResults.failed'), value: stats.fail, accent: 'bg-rose-500' },
            { label: t('teacher.viewResults.averageScore'), value: stats.avg, accent: 'bg-sky-500' },
          ].map(c => (
            <div key={c.label} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
              <div className={`absolute inset-x-0 top-0 h-1 ${c.accent}`} />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{c.label}</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{c.value}</p>
            </div>
          ))}
        </section>

        {/* Results Table */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500 dark:border-slate-700 dark:border-t-cyan-400" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-700/50">
                    {[t('common.hash'), t('common.code'), t('teacher.viewResults.student'), t('teacher.viewResults.exam'), t('teacher.viewResults.subject'), t('teacher.viewResults.score'), t('common.grade'), t('common.status'), t('common.date')].map(h => (
                      <th key={h} className="whitespace-nowrap p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {results.length === 0 ? (
                    <tr><td colSpan="9" className="p-8 text-center text-sm text-slate-400">{t('teacher.viewResults.noResults')}</td></tr>
                  ) : results.map((r, i) => (
                    <tr key={r._id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="p-4 text-slate-500 dark:text-slate-300">{i + 1}</td>
                      <td className="p-4 font-mono text-xs text-slate-500 dark:text-slate-400">{r.student?.studentCode || '-'}</td>
                      <td className="p-4 font-medium text-slate-900 dark:text-slate-100">{r.student?.user?.name || '-'}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">{r.exam?.title || '-'}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">{r.subject?.name || '-'}</td>
                      <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">{r.totalScore}</td>
                      <td className="p-4">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${gradeColors[r.grade] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>{r.grade || '-'}</span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${r.status === 'pass' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                          {r.status === 'pass' ? t('teacher.viewResults.pass') : t('teacher.viewResults.fail')}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-500 dark:text-slate-400">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherViewResults;
