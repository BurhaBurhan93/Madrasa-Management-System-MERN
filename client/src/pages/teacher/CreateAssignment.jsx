import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import CalendarDatePicker from "../../components/UIHelper/CalendarDatePicker";
import { PANEL_PAGE_BG } from '../../Constatns/pageStyles';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const inputCls = 'w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100';

const CreateAssignment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', courseId: '', description: '', dueDate: '', maxPoints: 100, status: 'active' });

  useEffect(() => {
    axios.get('http://localhost:5000/api/teacher/subjects', api())
      .then(res => { if (res.data.success) setSubjects(res.data.data); })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.courseId || !form.dueDate) { alert(t('teacher.createAssignment.requiredFields')); return; }
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/teacher/assignments', form, api());
      if (res.data.success) { alert(t('teacher.createAssignment.createdSuccess')); }
    } catch (e) { alert(
  e.response?.data?.message ||
  t('teacher.createAssignment.createFailed')
); } finally { setLoading(false); }
  };

  return (
    <div className={PANEL_PAGE_BG}>
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">{t('teacher.createAssignment.title')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('teacher.createAssignment.subtitle')}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">{t('teacher.createAssignment.assignmentTitle')} <span className="text-rose-500">*</span></label>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className={inputCls} placeholder={t('teacher.createAssignment.assignmentTitlePlaceholder')} />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">{t('teacher.createAssignment.subject')} <span className="text-rose-500">*</span></label>
              <select value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })} required className={inputCls}>
                <option value="">{t('teacher.createAssignment.selectSubject')}</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">{t('teacher.createAssignment.dueDate')} <span className="text-rose-500">*</span></label>
                <CalendarDatePicker value={form.dueDate} onChange={(date) => setForm({ ...form, dueDate: date })} placeholder={t('teacher.createAssignment.selectDate')} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">{t('teacher.createAssignment.maxPoints')}</label>
                <input type="number" value={form.maxPoints} onChange={e => setForm({ ...form, maxPoints: e.target.value })} className={inputCls} />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">{t('teacher.createAssignment.description')}</label>
              <textarea rows="4" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inputCls} placeholder={t('teacher.createAssignment.descriptionPlaceholder')} />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">{t('teacher.createAssignment.status')}</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inputCls}>
                <option value="active">
  {t('teacher.common.active')}
</option>
                <option value="completed">
  {t('teacher.common.completed')}
</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => navigate(-1)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100">{t('teacher.common.cancel')}</button>
              <button type="submit" disabled={loading} className="rounded-2xl bg-cyan-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-cyan-700 disabled:opacity-60">
                {loading
  ? t('teacher.createAssignment.creating')
  : t('teacher.createAssignment.create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAssignment;
