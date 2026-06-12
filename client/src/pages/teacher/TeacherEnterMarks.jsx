import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const calcGrade = (score, total) => {
  const p = (score / total) * 100;
  if (p >= 90) return 'A+'; if (p >= 80) return 'A'; if (p >= 70) return 'B';
  if (p >= 60) return 'C'; if (p >= 50) return 'D'; return 'F';
};

const TeacherEnterMarks = () => {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [totalMarks, setTotalMarks] = useState(100);
  const [filters, setFilters] = useState({ examId: '', subjectId: '', classId: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const loadStudents = async () => {
    if (!filters.classId) { alert('Please select a class'); return; }
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/teacher/students?classId=${filters.classId}`, api());
      if (res.data.success) {
        setStudents(res.data.data);
        const m = {};
        res.data.data.forEach(s => { m[s._id] = ''; });
        if (filters.examId && filters.subjectId) {
          const resultsRes = await axios.get(
            `http://localhost:5000/api/teacher/results?examId=${filters.examId}&subjectId=${filters.subjectId}&classId=${filters.classId}`,
            api()
          );
          if (resultsRes.data.success) {
            resultsRes.data.data.forEach(r => { if (r.student?._id) m[r.student._id] = r.totalScore; });
          }
        }
        setMarks(m);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const saveMarks = async () => {
    if (!filters.examId || !filters.subjectId || !filters.classId) { alert('Please select exam, subject and class'); return; }
    setSaving(true);
    try {
      const marksArr = students.map(s => ({ student: s._id, totalScore: Number(marks[s._id] || 0), totalMarks }));
      const res = await axios.post('http://localhost:5000/api/teacher/results/save-marks', {
        examId: filters.examId, subjectId: filters.subjectId, classId: filters.classId, marks: marksArr
      }, api());
      if (res.data.success) alert('Marks saved successfully!');
    } catch (e) { alert('Failed to save marks'); } finally { setSaving(false); }
  };

  const summary = useMemo(() => {
    const valid = students.filter(s => marks[s._id] !== '');
    const avg = valid.length > 0 ? (valid.reduce((sum, s) => sum + Number(marks[s._id]), 0) / valid.length).toFixed(1) : 0;
    const pass = valid.filter(s => (Number(marks[s._id]) / totalMarks) >= 0.5).length;
    return { avg, pass, fail: valid.length - pass };
  }, [marks, students, totalMarks]);

  const selectCls = 'w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100';

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef7f7_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Enter Marks</h1>
          <p className="mt-1 text-sm text-slate-500">Select exam, subject and class then load students</p>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5 items-end">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Exam</label>
              <select value={filters.examId} onChange={e => setFilters({ ...filters, examId: e.target.value })} className={selectCls}>
                <option value="">Select Exam</option>
                {exams.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Subject</label>
              <select value={filters.subjectId} onChange={e => setFilters({ ...filters, subjectId: e.target.value })} className={selectCls}>
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Class</label>
              <select value={filters.classId} onChange={e => setFilters({ ...filters, classId: e.target.value })} className={selectCls}>
                <option value="">Select Class</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Total Marks</label>
              <input type="number" value={totalMarks} onChange={e => setTotalMarks(Number(e.target.value))} className={selectCls} />
            </div>
            <button onClick={loadStudents} disabled={loading} className="rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-cyan-700 disabled:opacity-60">
              {loading ? 'Loading...' : 'Load Students'}
            </button>
          </div>
        </div>

        {/* Summary */}
        {students.length > 0 && (
          <section className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Class Average', value: summary.avg, accent: 'bg-cyan-500' },
              { label: 'Pass', value: summary.pass, accent: 'bg-emerald-500' },
              { label: 'Fail', value: summary.fail, accent: 'bg-rose-500' },
            ].map(c => (
              <div key={c.label} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm">
                <div className={`absolute inset-x-0 top-0 h-1 ${c.accent}`} />
                <p className="text-sm text-slate-500">{c.label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{c.value}</p>
              </div>
            ))}
          </section>
        )}

        {/* Marks Table */}
        {students.length > 0 && (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['#', 'Student', 'Code', 'Total', 'Obtained', 'Grade', 'Status'].map(h => (
                    <th key={h} className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s, i) => {
                  const score = Number(marks[s._id] || 0);
                  const grade = marks[s._id] !== '' ? calcGrade(score, totalMarks) : '-';
                  const pass = marks[s._id] !== '' && (score / totalMarks) >= 0.5;
                  return (
                    <tr key={s._id} className="transition-colors duration-150 hover:bg-slate-50">
                      <td className="p-4 text-slate-500">{i + 1}</td>
                      <td className="p-4 font-medium text-slate-900">{s.user?.name}</td>
                      <td className="p-4 text-slate-500">{s.studentCode}</td>
                      <td className="p-4 text-slate-600">{totalMarks}</td>
                      <td className="p-4">
                        <input
                          type="number" min="0" max={totalMarks} value={marks[s._id]}
                          onChange={e => setMarks(prev => ({ ...prev, [s._id]: e.target.value }))}
                          className="w-20 rounded-xl border border-slate-200 px-2 py-1 text-sm outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                        />
                      </td>
                      <td className="p-4 font-semibold text-slate-900">{grade}</td>
                      <td className="p-4">
                        {marks[s._id] !== '' && (
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${pass ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {pass ? 'Pass' : 'Fail'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex justify-end border-t border-slate-100 p-4">
              <button onClick={saveMarks} disabled={saving} className="rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-cyan-700 disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Marks'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TeacherEnterMarks;
