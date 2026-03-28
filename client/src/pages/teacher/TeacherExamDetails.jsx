import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '../../components/UIHelper/Card';
import Button from '../../components/UIHelper/Button';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const statusColors = { draft: 'bg-yellow-100 text-yellow-700', published: 'bg-green-100 text-green-700', finished: 'bg-gray-100 text-gray-700' };

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
      if (res.data.success) {
        setExam(res.data.data);
        setQuestions(res.data.data.questions || []);
      }
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

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!exam) return <div className="p-6 text-red-500">Exam not found</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{exam.title}</h1>
          <p className="text-gray-500">{exam.subject?.name} {exam.class ? `| ${exam.class.name} ${exam.class.section}` : ''}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {exam.status === 'draft' && (
            <>
              <Button onClick={() => navigate(`/teacher/exams/${examId}/add-question`)}>+ Add Question</Button>
              <Button onClick={handlePublish} className="bg-green-600 hover:bg-green-700 text-white">Publish</Button>
            </>
          )}
          {exam.status === 'published' && (
            <>
              <Button onClick={() => navigate(`/teacher/exams/${examId}/submissions`)} className="bg-purple-600 hover:bg-purple-700 text-white">View Submissions</Button>
              <Button onClick={handleClose} variant="danger">Close Exam</Button>
            </>
          )}
          {exam.status === 'finished' && (
            <Button onClick={() => navigate(`/teacher/exams/${examId}/submissions`)} className="bg-purple-600 hover:bg-purple-700 text-white">View Submissions</Button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Status', value: <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColors[exam.status]}`}>{exam.status}</span> },
          { label: 'Duration', value: `${exam.duration} min` },
          { label: 'Total Marks', value: exam.totalMarks },
          { label: 'Questions', value: questions.length },
        ].map(c => (
          <Card key={c.label} className="text-center">
            <div className="text-sm text-gray-500">{c.label}</div>
            <div className="font-bold mt-1">{c.value}</div>
          </Card>
        ))}
      </div>

      {/* Questions */}
      <Card>
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Questions</h2>
          {questions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No questions yet. {exam.status === 'draft' && 'Click "Add Question" to start.'}</p>
          ) : (
            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={q._id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{i + 1}. {q.question}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{q.questionType}</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{q.marks} marks</span>
                      </div>
                    </div>
                    {exam.status === 'draft' && (
                      <div className="flex gap-2 ml-4">
                        <button onClick={() => navigate(`/teacher/exams/${examId}/edit-question/${q._id}`)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                        <button onClick={() => handleDeleteQuestion(q._id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                      </div>
                    )}
                  </div>
                  {q.questionType === 'mcq' && q.options?.length > 0 && (
                    <ul className="mt-2 ml-4 space-y-1">
                      {q.options.map((opt, j) => (
                        <li key={j} className={`text-sm ${opt === q.correctAnswer ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                          {String.fromCharCode(65 + j)}. {opt} {opt === q.correctAnswer && '✓'}
                        </li>
                      ))}
                    </ul>
                  )}
                  {q.questionType === 'truefalse' && (
                    <p className="text-sm text-green-600 mt-1">Correct: {q.correctAnswer}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TeacherExamDetails;
