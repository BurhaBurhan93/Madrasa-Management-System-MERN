import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Card from '../../components/UIHelper/Card';
import Button from '../../components/UIHelper/Button';

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

        // fetch existing marks if exam and subject selected
        if (filters.examId && filters.subjectId) {
          const resultsRes = await axios.get(
            `http://localhost:5000/api/teacher/results?examId=${filters.examId}&subjectId=${filters.subjectId}&classId=${filters.classId}`,
            api()
          );
          if (resultsRes.data.success) {
            resultsRes.data.data.forEach(r => {
              if (r.student?._id) m[r.student._id] = r.totalScore;
            });
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Enter Marks</h1>
        <p className="text-gray-500">Select exam, subject and class then load students</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Exam</label>
            <select value={filters.examId} onChange={e => setFilters({ ...filters, examId: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500">
              <option value="">Select Exam</option>
              {exams.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Subject</label>
            <select value={filters.subjectId} onChange={e => setFilters({ ...filters, subjectId: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500">
              <option value="">Select Subject</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Class</label>
            <select value={filters.classId} onChange={e => setFilters({ ...filters, classId: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500">
              <option value="">Select Class</option>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Total Marks</label>
            <input type="number" value={totalMarks} onChange={e => setTotalMarks(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <Button onClick={loadStudents} disabled={loading}>{loading ? 'Loading...' : 'Load Students'}</Button>
        </div>
      </Card>

      {/* Summary */}
      {students.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center"><p className="text-sm text-gray-500">Class Average</p><p className="text-2xl font-bold">{summary.avg}</p></Card>
          <Card className="text-center"><p className="text-sm text-gray-500">Pass</p><p className="text-2xl font-bold text-green-600">{summary.pass}</p></Card>
          <Card className="text-center"><p className="text-sm text-gray-500">Fail</p><p className="text-2xl font-bold text-red-600">{summary.fail}</p></Card>
        </div>
      )}

      {/* Marks Table */}
      {students.length > 0 && (
        <Card>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Student</th>
                <th className="p-3 text-left">Code</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Obtained</th>
                <th className="p-3 text-left">Grade</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => {
                const score = Number(marks[s._id] || 0);
                const grade = marks[s._id] !== '' ? calcGrade(score, totalMarks) : '-';
                const pass = marks[s._id] !== '' && (score / totalMarks) >= 0.5;
                return (
                  <tr key={s._id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{i + 1}</td>
                    <td className="p-3 font-medium">{s.user?.name}</td>
                    <td className="p-3 text-gray-500">{s.studentCode}</td>
                    <td className="p-3">{totalMarks}</td>
                    <td className="p-3">
                      <input type="number" min="0" max={totalMarks} value={marks[s._id]} onChange={e => setMarks(prev => ({ ...prev, [s._id]: e.target.value }))}
                        className="w-20 border rounded px-2 py-1 outline-none focus:ring-2 focus:ring-green-500" />
                    </td>
                    <td className="p-3 font-semibold">{grade}</td>
                    <td className="p-3">
                      {marks[s._id] !== '' && (
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${pass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {pass ? 'Pass' : 'Fail'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="flex justify-end p-4 border-t">
            <Button onClick={saveMarks} disabled={saving}>{saving ? 'Saving...' : 'Save Marks'}</Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TeacherEnterMarks;
