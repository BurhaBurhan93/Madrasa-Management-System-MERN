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
  default: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

const TeacherSubjects = () => {
  const { t } = useTranslation();
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
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('teacher.common.subjects')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('teacher.common.manageSubjectsWorkload')}</p>
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: t('teacher.dashboard.totalSubjects'), value: subjects.length, accent: 'bg-cyan-500' },
            { label: t('teacher.dashboard.activeClasses'), value: subjects.filter(s => (s.status || 'active') === 'active').length, accent: 'bg-emerald-500' },
            { label: t('teacher.dashboard.totalStudents'), value: totalStudents, accent: 'bg-violet-500' },
            { label: t('teacher.common.weeklyHours'), value: totalHours, accent: 'bg-amber-500' },
          ].map(c => (
            <div key={c.label} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
              <div className={`absolute inset-x-0 top-0 h-1 ${c.accent}`} />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{c.label}</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{c.value}</p>
            </div>
          ))}
        </section>

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {['all', 'active', 'completed', 'upcoming', 'inactive'].map(status => (
                <button key={status} onClick={() => setFilter(status)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${filter === status ? 'bg-cyan-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}`}>
                  {t(`teacher.common.${status}`)}
                </button>
              ))}
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
              <option value="name">{t('teacher.common.sortByName')}</option>
              <option value="students">{t('teacher.common.sortByStudents')}</option>
              <option value="progress">{t('teacher.common.sortByProgress')}</option>
            </select>
          </div>
        </div>

        {filteredSubjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            {t('teacher.common.noSubjectsFound')}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="p-4 text-left font-semibold text-slate-600 dark:text-slate-300">{t('teacher.common.subjectName')}</th>
                  <th className="p-4 text-left font-semibold text-slate-600 dark:text-slate-300">{t('teacher.common.code')}</th>
                  <th className="p-4 text-left font-semibold text-slate-600 dark:text-slate-300">{t('teacher.common.credits')}</th>
                  <th className="p-4 text-left font-semibold text-slate-600 dark:text-slate-300">{t('teacher.dashboard.totalStudents')}</th>
                  <th className="p-4 text-left font-semibold text-slate-600 dark:text-slate-300">{t('teacher.common.status')}</th>
                  <th className="p-4 text-left font-semibold text-slate-600 dark:text-slate-300">{t('teacher.common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.map(subject => (
                  <tr key={subject._id} className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-800/30">
                    <td className="p-4 font-medium text-slate-900 dark:text-slate-100">{subject.name || t('teacher.common.unnamedSubject')}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{subject.code || '-'}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{subject.credits || '-'}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{subject.students || 0}</td>
                    <td className="p-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusVariants[subject.status || 'default'] || statusVariants.default}`}>
                        {subject.status ? t(`teacher.common.${subject.status}`) : subject.isActive ? t('teacher.common.active') : t('teacher.common.inactive')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/teacher/students?subjectId=${subject._id}`)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                          {t('teacher.common.students')}
                        </button>
                        <button onClick={() => navigate(`/teacher/attendance?subjectId=${subject._id}`)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                          {t('teacher.common.attendance')}
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
