import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { PANEL_PAGE_BG } from '../../Constatns/pageStyles';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const inputCls = 'w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100';

const TeacherEditQuestion = () => {
  const { t } = useTranslation();
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
    } catch (e) { alert(t('editQuestion.failedToUpdateQuestion')); } finally { setLoading(false); }
  };

  if (!form) return <div className="flex h-64 items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-600" /></div>;

  return (
    <div className={PANEL_PAGE_BG}>
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">{t('teacher.editQuestion.title')}</h1>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">{t('teacher.editQuestion.questionText')}</label>
              <textarea value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} required rows="3" className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">{t('teacher.editQuestion.marks')}</label>
              <input type="number" value={form.marks} onChange={e => setForm({ ...form, marks: e.target.value })} min="1" className={inputCls} />
            </div>
            {form.questionType === 'mcq' && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-500">{t('teacher.editQuestion.options')}</label>
                {form.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-6 text-sm font-medium text-slate-500">{String.fromCharCode(65 + i)}.</span>
                    <input type="text" value={opt} onChange={e => { const o = [...form.options]; o[i] = e.target.value; setForm({ ...form, options: o }); }} className={inputCls} />
                  </div>
                ))}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">{t('teacher.editQuestion.correctAnswer')}</label>
                  <select value={form.correctAnswer} onChange={e => setForm({ ...form, correctAnswer: e.target.value })} className={inputCls}>
                    <option value="">{t('teacher.editQuestion.selectCorrectOption')}</option>
                    {form.options.filter(o => o.trim()).map((opt, i) => <option key={i} value={opt}>{String.fromCharCode(65 + i)}. {opt}</option>)}
                  </select>
                </div>
              </div>
            )}
            {form.questionType === 'truefalse' && (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">{t('teacher.editQuestion.correctAnswer')}</label>
                <select value={form.correctAnswer} onChange={e => setForm({ ...form, correctAnswer: e.target.value })} className={inputCls}>
                  <option value="True">{t('teacher.editQuestion.true')}</option>
                  <option value="False">{t('teacher.editQuestion.false')}</option>
                </select>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => navigate(`/teacher/exams/${examId}`)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100">{t('teacher.editQuestion.cancel')}</button>
              <button type="submit" disabled={loading} className="rounded-2xl bg-cyan-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-cyan-700 disabled:opacity-60">
                {loading
  ? t('teacher.editQuestion.saving')
  : t('teacher.editQuestion.updateQuestion')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherEditQuestion;
