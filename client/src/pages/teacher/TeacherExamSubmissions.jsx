import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

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
        axios.get(`http://localhost:5000/api/teacher/exams/${examId}`, api()),
        axios.get(`http://localhost:5000/api/teacher/exams/${examId}/submissions`, api()),
      ]);
      if (examRes.data.success) setExam(examRes.data.data);
      if (subRes.data.success) setSubmissions(subRes.data.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const avg = submissions.length > 0
    ? (submissions.reduce((s, r) => s + r.score, 0) / submissions.length).toFixed(1)
    : 0;
  const passed = submissions.filter(s => exam && (s.score / exam.totalMarks) >= 0.5).length;

  const statCards = [
    { label: 'Submitted', value: submissions.length, accent: 'bg-cyan-500' },
    { label: 'Passed', value: passed, accent: 'bg-emerald-500' },
    { label: 'Failed', value: submissions.length - passed, accent: 'bg-rose-500' },
    { label: 'Average', value: avg, accent: 'bg-sky-500' },
  ];

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef7f7_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Submissions — {exam?.title}</h1>
          <p className="mt-1 text-sm text-slate-500">Total: {submissions.length} submissions</p>
        </div>

        {/* Stats */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
          {statCards.map(c => (
            <div key={c.label} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className={`absolute inset-x-0 top-0 h-1 ${c.accent}`} />
              <p className="text-sm font-medium text-slate-500">{c.label}</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{c.value}</p>
            </div>
          ))}
        </section>

        {/* Table */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex h-32 items-center justify-center text-slate-500">Loading...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['#', 'Student', 'Score', 'Total', 'Percentage', 'Status', 'Submitted At'].map(h => (
                    <th key={h} className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.length === 0 ? (
                  <tr><td colSpan="7" className="p-8 text-center text-slate-500">No submissions yet</td></tr>
                ) : submissions.map((s, i) => {
                  const pct = exam ? Math.round((s.score / exam.totalMarks) * 100) : 0;
                  const pass = pct >= 50;
                  return (
                    <tr key={s._id} className="transition-colors duration-150 hover:bg-slate-50">
                      <td className="p-4 text-slate-500">{i + 1}</td>
                      <td className="p-4 font-medium text-slate-900">{s.student?.user?.name || 'Unknown'}</td>
                      <td className="p-4 font-semibold text-slate-900">{s.score}</td>
                      <td className="p-4 text-slate-600">{s.totalMarks}</td>
                      <td className="p-4 text-slate-600">{pct}%</td>
                      <td className="p-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${pass ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {pass ? 'Pass' : 'Fail'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{new Date(s.submittedAt).toLocaleString()}</td>
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
