import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '../../components/UIHelper/Card';
import Button from '../../components/UIHelper/Button';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const TeacherEditQuestion = () => {
  const { examId, questionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/teacher/exams/${examId}/questions`, api())
      .then(res => {
        if (res.data.success) {
          const q = res.data.data.find(q => q._id === questionId);
          if (q) setForm({ question: q.question, questionType: q.questionType, marks: q.marks, options: q.options?.length ? q.options : ['', '', '', ''], correctAnswer: q.correctAnswer || '' });
        }
      }).catch(console.error);
  }, [examId, questionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { question: form.question, questionType: form.questionType, marks: Number(form.marks), correctAnswer: form.correctAnswer };
      if (form.questionType === 'mcq') payload.options = form.options.filter(o => o.trim());
      if (form.questionType === 'truefalse') payload.options = ['True', 'False'];
      await axios.put(`http://localhost:5000/api/teacher/exams/${examId}/questions/${questionId}`, payload, api());
      navigate(`/teacher/exams/${examId}`);
    } catch (e) { alert('Failed to update question'); } finally { setLoading(false); }
  };

  if (!form) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Question</h1>
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
            <textarea value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} required rows="3" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
            <input type="number" value={form.marks} onChange={e => setForm({ ...form, marks: e.target.value })} min="1" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          {form.questionType === 'mcq' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Options</label>
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm font-medium w-6">{String.fromCharCode(65 + i)}.</span>
                  <input type="text" value={opt} onChange={e => { const o = [...form.options]; o[i] = e.target.value; setForm({ ...form, options: o }); }} className="flex-1 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                <select value={form.correctAnswer} onChange={e => setForm({ ...form, correctAnswer: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Select correct option</option>
                  {form.options.filter(o => o.trim()).map((opt, i) => <option key={i} value={opt}>{String.fromCharCode(65 + i)}. {opt}</option>)}
                </select>
              </div>
            </div>
          )}
          {form.questionType === 'truefalse' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
              <select value={form.correctAnswer} onChange={e => setForm({ ...form, correctAnswer: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500">
                <option value="True">True</option>
                <option value="False">False</option>
              </select>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate(`/teacher/exams/${examId}`)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Update Question'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TeacherEditQuestion;
