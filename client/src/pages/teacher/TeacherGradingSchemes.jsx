import { useState, useEffect } from 'react';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';
import { PANEL_PAGE_BG } from '../../Constatns/pageStyles';

const MOCK = [
  { _id: '1', name: 'Standard Grading', description: 'Regular academic grading scheme for all subjects', grades: [
    { grade: 'A+', minMarks: 90, maxMarks: 100, gpa: 4.0, remark: 'Excellent' },
    { grade: 'A', minMarks: 80, maxMarks: 89, gpa: 3.7, remark: 'Very Good' },
    { grade: 'B+', minMarks: 75, maxMarks: 79, gpa: 3.3, remark: 'Good' },
    { grade: 'B', minMarks: 70, maxMarks: 74, gpa: 3.0, remark: 'Above Average' },
    { grade: 'C+', minMarks: 65, maxMarks: 69, gpa: 2.7, remark: 'Average' },
    { grade: 'C', minMarks: 60, maxMarks: 64, gpa: 2.3, remark: 'Satisfactory' },
    { grade: 'D', minMarks: 50, maxMarks: 59, gpa: 2.0, remark: 'Pass' },
    { grade: 'F', minMarks: 0, maxMarks: 49, gpa: 0.0, remark: 'Fail' },
  ]},
  { _id: '2', name: 'Quran Memorization', description: 'Grading for Hifz (Quran memorization) program', grades: [
    { grade: 'A+', minMarks: 95, maxMarks: 100, gpa: 4.0, remark: 'Outstanding memorization' },
    { grade: 'A', minMarks: 85, maxMarks: 94, gpa: 3.7, remark: 'Excellent memorization' },
    { grade: 'B', minMarks: 70, maxMarks: 84, gpa: 3.0, remark: 'Good memorization' },
    { grade: 'C', minMarks: 60, maxMarks: 69, gpa: 2.3, remark: 'Needs improvement' },
    { grade: 'F', minMarks: 0, maxMarks: 59, gpa: 0.0, remark: 'Incomplete' },
  ]},
];

const TeacherGradingSchemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/academic/grading');
      const data = await parseJsonSafe(res);
      if (data.success && data.data?.length > 0) setSchemes(data.data);
      else setSchemes(MOCK);
    } catch (e) {
      console.error(e);
      setSchemes(MOCK);
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Grading Schemes</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Grading criteria and grade boundaries</p>
        </div>

        {loading ? renderLoading() : schemes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 text-5xl">📊</div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No grading schemes found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {schemes.map((scheme) => (
              <div key={scheme._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{scheme.name}</h3>
                  {scheme.description && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{scheme.description}</p>
                  )}
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-700/50">
                        <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Grade</th>
                        <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Min Marks</th>
                        <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Max Marks</th>
                        <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">GPA</th>
                        <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scheme.grades?.map((g, i) => (
                        <tr key={i} className="border-b border-slate-100 last:border-0 dark:border-slate-700/50">
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{g.grade}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{g.minMarks ?? '-'}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{g.maxMarks ?? '-'}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{g.gpa ?? '-'}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{g.remark || '-'}</td>
                        </tr>
                      ))}
                      {(!scheme.grades || scheme.grades.length === 0) && (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-400">No grade boundaries defined</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherGradingSchemes;
