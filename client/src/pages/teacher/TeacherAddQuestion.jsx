import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';


const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const inputCls = 'w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100';

const TeacherAddQuestion = () => {
  const { t } = useTranslation();
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
    } catch (e) { alert(
  e.response?.data?.message ||
  t('teacher.addQuestion.failedToAddQuestion')
); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef7f7_100%)]">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900"> {t('teacher.addQuestion.title')}</h1>
          <p className="mt-1 text-sm text-slate-500"><p className="mt-1 text-sm text-slate-500">
  {t('teacher.addQuestion.subtitle')}
</p></p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">{t('teacher.addQuestion.questionType')}</label>
              <select value={form.questionType} onChange={e => setForm({ ...form, questionType: e.target.value, correctAnswer: '' })} className={inputCls}>
                <option value="mcq">{t('teacher.addQuestion.multipleChoice')}</option>
                <option value="truefalse">{t('teacher.addQuestion.trueFalse')}</option>
                <option value="short">{t('teacher.addQuestion.shortAnswer')}</option>
                <option value="essay">{t('teacher.addQuestion.essay')}</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">{t('teacher.addQuestion.questionText')} <span className="text-rose-500">*</span></label>
              <textarea value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} required rows="3" className={inputCls} placeholder={t('teacher.addQuestion.enterQuestion')} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">{t('teacher.addQuestion.marks')} <span className="text-rose-500">*</span></label>
              <input type="number" value={form.marks} onChange={e => setForm({ ...form, marks: e.target.value })} required min="1" className={inputCls} />
            </div>
            {form.questionType === 'mcq' && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-500">{t('teacher.addQuestion.options')} <span className="text-rose-500">*</span></label>
                {form.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-6 text-sm font-medium text-slate-500">{String.fromCharCode(65 + i)}.</span>
                    <input type="text" value={opt} onChange={e => { const o = [...form.options]; o[i] = e.target.value; setForm({ ...form, options: o }); }} className={inputCls} placeholder={`${t('teacher.addQuestion.option')} ${String.fromCharCode(65 + i)}`} />
                  </div>
                ))}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">{t('teacher.addQuestion.correctAnswer')}</label>
                  <select value={form.correctAnswer} onChange={e => setForm({ ...form, correctAnswer: e.target.value })} className={inputCls}>
                    <option value=""> {t('teacher.addQuestion.selectCorrectOption')}</option>
                    {form.options.filter(o => o.trim()).map((opt, i) => <option key={i} value={opt}>{String.fromCharCode(65 + i)}. {opt}</option>)}
                  </select>
                </div>
              </div>
            )}
            {form.questionType === 'truefalse' && (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">{t('teacher.addQuestion.correctAnswer')}</label>
                <select value={form.correctAnswer} onChange={e => setForm({ ...form, correctAnswer: e.target.value })} className={inputCls}>
                  <option value="">{t('teacher.addQuestion.select')}</option>
                  <option value="True">{t('teacher.addQuestion.true')}</option>
                  <option value="False">{t('teacher.addQuestion.false')}</option>
                </select>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => navigate(`/teacher/exams/${examId}`)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100">{t('teacher.addQuestion.cancel')}</button>
              <button type="submit" disabled={loading} className="rounded-2xl bg-cyan-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-cyan-700 disabled:opacity-60">
                {
  loading
    ? t('teacher.addQuestion.saving')
    : t('teacher.addQuestion.saveQuestion')
}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherAddQuestion;
