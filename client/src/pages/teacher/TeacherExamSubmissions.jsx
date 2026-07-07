import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';
import { PANEL_PAGE_BG } from '../../Constatns/pageStyles';

const MOCK_SUBMISSIONS = [
  { _id: 's1', student: { user: { name: 'Ahmad Khan' } }, score: 85, totalMarks: 100, submittedAt: '2026-06-27T10:30:00Z' },
  { _id: 's2', student: { user: { name: 'Fatima Al-Hassan' } }, score: 72, totalMarks: 100, submittedAt: '2026-06-27T11:00:00Z' },
  { _id: 's3', student: { user: { name: 'Yusuf Ibrahim' } }, score: 45, totalMarks: 100, submittedAt: '2026-06-27T11:15:00Z' },
  { _id: 's4', student: { user: { name: 'Aisha Omar' } }, score: 91, totalMarks: 100, submittedAt: '2026-06-27T11:30:00Z' },
  { _id: 's5', student: { user: { name: 'Bilal Hussain' } }, score: 63, totalMarks: 100, submittedAt: '2026-06-27T12:00:00Z' },
];

const MOCK_EXAM = { _id: 'mock', title: 'Mid-Term Quran Tafsir Exam', totalMarks: 100 };

const TeacherExamSubmissions = () => {
  const { examId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [examId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [examRes, subRes] = await Promise.all([
        apiFetch('/teacher/exams/' + examId),
        apiFetch('/teacher/exams/' + examId + '/submissions'),
      ]);
      const examData = await parseJsonSafe(examRes);
      const subData = await parseJsonSafe(subRes);
      if (examData.success && examData.data) setExam(examData.data);
      else setExam(MOCK_EXAM);
      if (subData.success && subData.data?.length > 0) setSubmissions(subData.data);
      else setSubmissions(MOCK_SUBMISSIONS);
    } catch (e) {
      console.error(e);
      setExam(MOCK_EXAM);
      setSubmissions(MOCK_SUBMISSIONS);
    } finally { setLoading(false); }
  };

  const avg = submissions.length > 0
    ? (submissions.reduce((s, r) => s + r.score, 0) / submissions.length).toFixed(1)
    : 0;
  const totalMarks = exam?.totalMarks || 100;
  const passed = submissions.filter(s => (s.score / totalMarks) >= 0.5).length;

  const statCards = [
    { label: 'Submitted', value: submissions.length, accent: 'bg-cyan-500' },
    { label: 'Passed', value: passed, accent: 'bg-emerald-500' },
    { label: 'Failed', value: submissions.length - passed, accent: 'bg-rose-500' },
    { label: 'Average', value: avg, accent: 'bg-sky-500' },
  ];

  return (
    <div className={PANEL_PAGE_BG}>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Submissions — {exam?.title || 'Exam'}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Total submissions: {submissions.length}</p>
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map(c => (
            <div key={c.label} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
              <div className={`absolute inset-x-0 top-0 h-1 ${c.accent}`} />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{c.label}</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{c.value}</p>
            </div>
          ))}
        </section>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500 dark:border-slate-700 dark:border-t-cyan-400" />
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-700/50">
                  {['#', 'Student', 'Score', 'Total', 'Percentage', 'Status', 'Submitted At'].map(h => (
                    <th key={h} className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {submissions.length === 0 ? (
                  <tr><td colSpan="7" className="px-5 py-12 text-center text-sm text-slate-400">No submissions yet</td></tr>
                ) : submissions.map((s, i) => {
                  const pct = totalMarks > 0 ? Math.round((s.score / totalMarks) * 100) : 0;
                  const pass = pct >= 50;
                  return (
                    <tr key={s._id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{i + 1}</td>
                      <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">{s.student?.user?.name || 'Unknown'}</td>
                      <td className="px-5 py-4 font-semibold text-slate-900 dark:text-slate-100">{s.score}</td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{s.totalMarks}</td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{pct}%</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${pass ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                          {pass ? 'Pass' : 'Fail'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                        {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherExamSubmissions;
