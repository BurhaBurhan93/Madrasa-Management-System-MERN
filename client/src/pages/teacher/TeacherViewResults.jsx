import { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../../components/UIHelper/Card';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const gradeColors = { 'A+': 'bg-green-100 text-green-700', A: 'bg-green-100 text-green-700', B: 'bg-blue-100 text-blue-700', C: 'bg-yellow-100 text-yellow-700', D: 'bg-orange-100 text-orange-700', F: 'bg-red-100 text-red-700' };

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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">View Results</h1>
        <p className="text-gray-500">Filter and view student exam results</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Exam</label>
            <select value={filters.examId} onChange={e => setFilters({ ...filters, examId: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500">
              <option value="">All Exams</option>
              {exams.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Subject</label>
            <select value={filters.subjectId} onChange={e => setFilters({ ...filters, subjectId: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500">
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Class</label>
            <select value={filters.classId} onChange={e => setFilters({ ...filters, classId: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500">
              <option value="">All Classes</option>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
            </select>
          </div>
          <button onClick={fetchResults} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium">Search</button>
        </div>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-700' },
          { label: 'Passed', value: stats.pass, color: 'text-green-600' },
          { label: 'Failed', value: stats.fail, color: 'text-red-600' },
          { label: 'Average', value: stats.avg, color: 'text-blue-600' },
        ].map(c => (
          <Card key={c.label} className="text-center">
            <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
            <div className="text-sm text-gray-500">{c.label}</div>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Student</th>
                <th className="p-3 text-left">Exam</th>
                <th className="p-3 text-left">Subject</th>
                <th className="p-3 text-left">Score</th>
                <th className="p-3 text-left">Grade</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">No results found. Use filters above to search.</td></tr>
              ) : results.map((r, i) => (
                <tr key={r._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3 font-medium">{r.student?.user?.name || '-'}</td>
                  <td className="p-3">{r.exam?.title || '-'}</td>
                  <td className="p-3">{r.subject?.name || '-'}</td>
                  <td className="p-3 font-semibold">{r.totalScore}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${gradeColors[r.grade] || 'bg-gray-100 text-gray-700'}`}>{r.grade}</span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${r.status === 'pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

export default TeacherViewResults;
