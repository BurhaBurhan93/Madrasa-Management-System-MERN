import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '../../components/UIHelper/Card';
import Button from '../../components/UIHelper/Button';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const TeacherAddQuestion = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ question: '', questionType: 'mcq', marks: 1, options: ['', '', '', ''], correctAnswer: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { question: form.question, questionType: form.questionType, marks: Number(form.marks), correctAnswer: form.correctAnswer };
      if (form.questionType === 'mcq') payload.options = form.options.filter(o => o.trim());
      if (form.questionType === 'truefalse') payload.options = ['True', 'False'];
      const res = await axios.post(`http://localhost:5000/api/teacher/exams/${examId}/questions`, payload, api());
      if (res.data.success) navigate(`/teacher/exams/${examId}`);
    } catch (e) { alert(e.response?.data?.message || 'Failed to add question'); } finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add Question</h1>
        <p className="text-gray-500">Add a new question to this exam</p>
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
            <select value={form.questionType} onChange={e => setForm({ ...form, questionType: e.target.value, correctAnswer: '' })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500">
              <option value="mcq">Multiple Choice (MCQ)</option>
              <option value="truefalse">True / False</option>
              <option value="short">Short Answer</option>
              <option value="essay">Essay</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question Text <span className="text-red-500">*</span></label>
            <textarea value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} required rows="3" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500" placeholder="Enter your question..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marks <span className="text-red-500">*</span></label>
            <input type="number" value={form.marks} onChange={e => setForm({ ...form, marks: e.target.value })} required min="1" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          {form.questionType === 'mcq' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Options <span className="text-red-500">*</span></label>
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm font-medium w-6">{String.fromCharCode(65 + i)}.</span>
                  <input type="text" value={opt} onChange={e => { const o = [...form.options]; o[i] = e.target.value; setForm({ ...form, options: o }); }} className="flex-1 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500" placeholder={`Option ${String.fromCharCode(65 + i)}`} />
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
                <option value="">Select</option>
                <option value="True">True</option>
                <option value="False">False</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate(`/teacher/exams/${examId}`)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Question'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TeacherAddQuestion;
