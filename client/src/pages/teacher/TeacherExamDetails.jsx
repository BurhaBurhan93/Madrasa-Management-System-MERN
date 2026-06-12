import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const statusColors = {
  draft: 'bg-amber-100 text-amber-700',
  published: 'bg-emerald-100 text-emerald-700',
  finished: 'bg-slate-100 text-slate-600'
};

const TeacherExamDetails = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchExam(); }, [examId]);

  const fetchExam = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/teacher/exams/${examId}`, api());
      if (res.data.success) { setExam(res.data.data); setQuestions(res.data.data.questions || []); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handlePublish = async () => {
    try {
      const res = await axios.put(`http://localhost:5000/api/teacher/exams/${examId}/publish`, {}, api());
      if (res.data.success) { alert('Exam published!'); fetchExam(); }
    } catch (e) { alert(e.response?.data?.message || 'Failed to publish'); }
  };

  const handleClose = async () => {
    try {
      await axios.put(`http://localhost:5000/api/teacher/exams/${examId}/close`, {}, api());
      fetchExam();
    } catch (e) { alert('Failed to close'); }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/teacher/exams/${examId}/questions/${qId}`, api());
      fetchExam();
    } catch (e) { alert('Failed to delete question'); }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-600" /></div>;
  if (!exam) return <div className="p-6 text-rose-500">Exam not found</div>;

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef7f7_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{exam.title}</h1>
            <p className="mt-1 text-sm text-slate-500">{exam.subject?.name}{exam.class ? ` · ${exam.class.name} ${exam.class.section}` : ''}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {exam.status === 'draft' && (
              <>
                <button onClick={() => navigate(`/teacher/exams/${examId}/add-question`)} className="rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-700">+ Add Question</button>
                <button onClick={handlePublish} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700">Publish</button>
              </>
            )}
            {exam.status === 'published' && (
              <>
                <button onClick={() => navigate(`/teacher/exams/${examId}/submissions`)} className="rounded-2xl bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-700">View Submissions</button>
                <button onClick={handleClose} className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition-all duration-200 hover:bg-rose-100">Close Exam</button>
              </>
            )}
            {exam.status === 'finished' && (
              <button onClick={() => navigate(`/teacher/exams/${examId}/submissions`)} className="rounded-2xl bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-700">View Submissions</button>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
          {[
            { label: 'Status', value: <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[exam.status]}`}>{exam.status}</span>, accent: 'bg-cyan-500' },
            { label: 'Duration', value: `${exam.duration} min`, accent: 'bg-sky-500' },
            { label: 'Total Marks', value: exam.totalMarks, accent: 'bg-violet-500' },
            { label: 'Questions', value: questions.length, accent: 'bg-amber-500' },
          ].map(c => (
            <div key={c.label} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className={`absolute inset-x-0 top-0 h-1 ${c.accent}`} />
              <p className="text-sm font-medium text-slate-500">{c.label}</p>
              <div className="mt-3 text-2xl font-bold text-slate-900">{c.value}</div>
            </div>
          ))}
        </section>

        {/* Questions */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">Questions</h2>
          {questions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-12 text-center text-sm text-slate-500">
              No questions yet. {exam.status === 'draft' && 'Click "Add Question" to start.'}
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={q._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{i + 1}. {q.question}</p>
                      <div className="mt-2 flex gap-2">
                        <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-700">{q.questionType}</span>
                        <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">{q.marks} marks</span>
                      </div>
                    </div>
                    {exam.status === 'draft' && (
                      <div className="ml-4 flex gap-2">
                        <button onClick={() => navigate(`/teacher/exams/${examId}/edit-question/${q._id}`)} className="rounded-xl border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 hover:bg-sky-100">Edit</button>
                        <button onClick={() => handleDeleteQuestion(q._id)} className="rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">Delete</button>
                      </div>
                    )}
                  </div>
                  {q.questionType === 'mcq' && q.options?.length > 0 && (
                    <ul className="mt-3 ml-4 space-y-1">
                      {q.options.map((opt, j) => (
                        <li key={j} className={`text-sm ${opt === q.correctAnswer ? 'font-medium text-emerald-600' : 'text-slate-600'}`}>
                          {String.fromCharCode(65 + j)}. {opt} {opt === q.correctAnswer && '✓'}
                        </li>
                      ))}
                    </ul>
                  )}
                  {q.questionType === 'truefalse' && (
                    <p className="mt-2 text-sm font-medium text-emerald-600">Correct: {q.correctAnswer}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TeacherExamDetails;
