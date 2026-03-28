import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Card from '../../components/UIHelper/Card';

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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Submissions — {exam?.title}</h1>
        <p className="text-gray-500">Total: {submissions.length} submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Submitted', value: submissions.length, color: 'text-gray-700' },
          { label: 'Passed', value: passed, color: 'text-green-600' },
          { label: 'Failed', value: submissions.length - passed, color: 'text-red-600' },
          { label: 'Average', value: avg, color: 'text-blue-600' },
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
                <th className="p-3 text-left">Score</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Percentage</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">No submissions yet</td></tr>
              ) : submissions.map((s, i) => {
                const pct = exam ? Math.round((s.score / exam.totalMarks) * 100) : 0;
                const pass = pct >= 50;
                return (
                  <tr key={s._id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{i + 1}</td>
                    <td className="p-3 font-medium">{s.student?.user?.name || 'Unknown'}</td>
                    <td className="p-3 font-semibold">{s.score}</td>
                    <td className="p-3">{s.totalMarks}</td>
                    <td className="p-3">{pct}%</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${pass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {pass ? 'Pass' : 'Fail'}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">{new Date(s.submittedAt).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

export default TeacherExamSubmissions;
