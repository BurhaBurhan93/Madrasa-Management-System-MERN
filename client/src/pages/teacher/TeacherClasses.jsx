import { useState, useEffect } from 'react';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';
import { PANEL_PAGE_BG } from '../../Constatns/pageStyles';

const MOCK = [
  { _id: '1', name: 'Class 10', section: 'A', description: 'Senior class focusing on advanced Islamic studies', classTeacher: 'Ustadh Ahmad' },
  { _id: '2', name: 'Class 10', section: 'B', description: 'Senior class with emphasis on Quran and Hadith', classTeacher: 'Dr. Fatima' },
  { _id: '3', name: 'Class 9', section: 'A', description: 'Intermediate Islamic studies program', classTeacher: 'Ustadh Yusuf' },
  { _id: '4', name: 'Class 9', section: 'B', description: 'Intermediate level with Arabic language focus', classTeacher: 'Ustadha Aisha' },
  { _id: '5', name: 'Class 8', section: 'A', description: 'Junior level foundational Islamic education', classTeacher: 'Ustadh Omar' },
  { _id: '6', name: 'Class 8', section: 'B', description: 'Junior level with Quran memorization track', classTeacher: 'Ustadha Khadija' },
];

const TeacherClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/teacher/classes');
      const data = await parseJsonSafe(res);
      if (data.success && data.data?.length > 0) setClasses(data.data);
      else setClasses(MOCK);
    } catch (e) {
      console.error(e);
      setClasses(MOCK);
    } finally {
      setLoading(false);
    }
  };

  const renderLoading = () => (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500 dark:border-slate-700 dark:border-t-cyan-400" />
    </div>
  );

  return (
    <div className={PANEL_PAGE_BG}>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">My Classes</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">View all registered classes</p>
        </div>

        {loading ? renderLoading() : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => (
              <div key={cls._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/50">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 text-xl font-bold text-white shadow-lg">
                  {cls.name?.[0]?.toUpperCase() || 'C'}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {cls.name} {cls.section ? `- ${cls.section}` : ''}
                </h3>
                {cls.description && (
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{cls.description}</p>
                )}
                {cls.classTeacher && (
                  <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-2 dark:bg-slate-700/50">
                    <p className="text-xs text-slate-400 dark:text-slate-500">Class Teacher</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{cls.classTeacher}</p>
                  </div>
                )}
              </div>
            ))}
            {!loading && classes.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No classes found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherClasses;
