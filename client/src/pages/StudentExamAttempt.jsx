import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const StudentExamAttempt = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchExam(); checkSubmission(); }, [examId]);

  const fetchExam = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/student/exams/${examId}`, api());
      if (res.data.success) setExam(res.data.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const checkSubmission = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/student/exams/${examId}/my-submission`, api());
      if (res.data.success && res.data.data) setSubmission(res.data.data);
    } catch (e) { console.error(e); }
  };

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!window.confirm('Submit exam? You cannot change answers after submission.')) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/student/exams/${examId}/submit`, { answers }, api());
      if (res.data.success) {
        setSubmission(res.data.data);
        alert(`Exam submitted! Your score: ${res.data.data.score} / ${res.data.data.totalMarks}`);
        navigate('/student/exams');
      }
    } catch (e) { alert(e.response?.data?.message || 'Failed to submit'); } finally { setSubmitting(false); }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading exam...</div>;

  if (submission) return (
    <div className="p-6 max-w-lg mx-auto text-center space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-xl p-8">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-800">Exam Submitted</h2>
        <p className="text-gray-500 mt-2">You have already submitted this exam</p>
        <div className="mt-6 text-4xl font-bold text-green-600">{submission.score} / {submission.totalMarks}</div>
        <p className="text-gray-500 mt-1">{Math.round((submission.score / submission.totalMarks) * 100)}%</p>
        <button onClick={() => navigate('/student/exams')} className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">Back to Exams</button>
      </div>
    </div>
  );

  if (!exam) return <div className="p-6 text-red-500">Exam not available</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-green-600 text-white rounded-xl p-6">
        <h1 className="text-2xl font-bold">{exam.title}</h1>
        <div className="flex gap-4 mt-2 text-green-100 text-sm">
          {exam.subject && <span>📚 {exam.subject.name}</span>}
          <span>⏱ {exam.duration} minutes</span>
          <span>📝 {exam.questions?.length} questions</span>
          <span>🎯 {exam.totalMarks} marks</span>
        </div>
      </div>

      {/* Questions */}
      {exam.questions?.map((q, i) => (
        <div key={q._id} className="bg-white rounded-xl shadow p-6 space-y-3">
          <div className="flex justify-between items-start">
            <p className="font-medium text-gray-800">{i + 1}. {q.question}</p>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full shrink-0 ml-4">{q.marks} marks</span>
          </div>

          {q.questionType === 'mcq' && q.options?.map((opt, j) => (
            <label key={j} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${answers[q._id] === opt ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="radio" name={q._id} value={opt} checked={answers[q._id] === opt} onChange={() => handleAnswer(q._id, opt)} className="text-green-600" />
              <span>{String.fromCharCode(65 + j)}. {opt}</span>
            </label>
          ))}

          {q.questionType === 'truefalse' && ['True', 'False'].map(opt => (
            <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${answers[q._id] === opt ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="radio" name={q._id} value={opt} checked={answers[q._id] === opt} onChange={() => handleAnswer(q._id, opt)} className="text-green-600" />
              <span>{opt}</span>
            </label>
          ))}

          {q.questionType === 'short' && (
            <input type="text" value={answers[q._id] || ''} onChange={e => handleAnswer(q._id, e.target.value)} placeholder="Your answer..." className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500" />
          )}

          {q.questionType === 'essay' && (
            <textarea value={answers[q._id] || ''} onChange={e => handleAnswer(q._id, e.target.value)} rows="4" placeholder="Your answer..." className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500" />
          )}
        </div>
      ))}

      {/* Submit */}
      <div className="flex justify-between items-center bg-white rounded-xl shadow p-4">
        <p className="text-sm text-gray-500">{Object.keys(answers).length} of {exam.questions?.length} answered</p>
        <button onClick={handleSubmit} disabled={submitting} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium">
          {submitting ? 'Submitting...' : 'Submit Exam'}
        </button>
      </div>
    </div>
  );
};

export default StudentExamAttempt;
