import { useState, useEffect } from 'react';
import axios from 'axios';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const gradeColors = {
  'A+': 'bg-emerald-100 text-emerald-700', A: 'bg-emerald-100 text-emerald-700',
  B: 'bg-sky-100 text-sky-700', C: 'bg-amber-100 text-amber-700',
  D: 'bg-orange-100 text-orange-700', F: 'bg-rose-100 text-rose-700'
};

const TeacherViewResults = () => {
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filters, setFilters] = useState({ examId: '', subjectId: '', classId: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:5000/api/teacher/exams', api()),
      axios.get('http://localhost:5000/api/teacher/subjects', api()),
      axios.get('http://localhost:5000/api/teacher/classes', api()),
    ]).then(([e, s, c]) => {
      if (e.data.success) setExams(e.data.data);
      if (s.data.success) setSubjects(s.data.data);
      if (c.data.success) setClasses(c.data.data);
    }).catch(console.error);
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.examId) params.append('examId', filters.examId);
      if (filters.subjectId) params.append('subjectId', filters.subjectId);
      if (filters.classId) params.append('classId', filters.classId);
      const res = await axios.get(`http://localhost:5000/api/teacher/results?${params}`, api());
      if (res.data.success) setResults(res.data.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const stats = {
    total: results.length,
    pass: results.filter(r => r.status === 'pass').length,
    fail: results.filter(r => r.status === 'fail').length,
    avg: results.length > 0 ? (results.reduce((s, r) => s + (r.totalScore || 0), 0) / results.length).toFixed(1) : 0,
  };

  const selectCls = 'w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100';

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef7f7_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">View Results</h1>
          <p className="mt-1 text-sm text-slate-500">Filter and view student exam results</p>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4 items-end">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Exam</label>
              <select value={filters.examId} onChange={e => setFilters({ ...filters, examId: e.target.value })} className={selectCls}>
                <option value="">All Exams</option>
                {exams.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Subject</label>
              <select value={filters.subjectId} onChange={e => setFilters({ ...filters, subjectId: e.target.value })} className={selectCls}>
                <option value="">All Subjects</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Class</label>
              <select value={filters.classId} onChange={e => setFilters({ ...filters, classId: e.target.value })} className={selectCls}>
                <option value="">All Classes</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
              </select>
            </div>
            <button onClick={fetchResults} className="rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-cyan-700">
              Search
            </button>
          </div>
        </div>

        {/* Stats */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
          {[
            { label: 'Total', value: stats.total, accent: 'bg-cyan-500' },
            { label: 'Passed', value: stats.pass, accent: 'bg-emerald-500' },
            { label: 'Failed', value: stats.fail, accent: 'bg-rose-500' },
            { label: 'Average', value: stats.avg, accent: 'bg-sky-500' },
          ].map(c => (
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
                  {['#', 'Student', 'Exam', 'Subject', 'Score', 'Grade', 'Status'].map(h => (
                    <th key={h} className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.length === 0 ? (
                  <tr><td colSpan="7" className="p-8 text-center text-slate-500">No results found. Use filters above to search.</td></tr>
                ) : results.map((r, i) => (
                  <tr key={r._id} className="transition-colors duration-150 hover:bg-slate-50">
                    <td className="p-4 text-slate-500">{i + 1}</td>
                    <td className="p-4 font-medium text-slate-900">{r.student?.user?.name || '-'}</td>
                    <td className="p-4 text-slate-600">{r.exam?.title || '-'}</td>
                    <td className="p-4 text-slate-600">{r.subject?.name || '-'}</td>
                    <td className="p-4 font-semibold text-slate-900">{r.totalScore}</td>
                    <td className="p-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${gradeColors[r.grade] || 'bg-slate-100 text-slate-600'}`}>{r.grade}</span>
                    </td>
                    <td className="p-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${r.status === 'pass' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};

export default TeacherViewResults;
