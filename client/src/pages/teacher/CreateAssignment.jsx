import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';
import CalendarDatePicker from "../../components/UIHelper/CalendarDatePicker";
import { PANEL_PAGE_BG } from '../../Constatns/pageStyles';

const fieldCls = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 dark:border-slate-600 dark:text-slate-100 dark:focus:border-slate-400';

const CreateAssignment = () => {
 const { t } = useTranslation(['teacher', 'common', 'nav', 'app']);
 const navigate = useNavigate();
 const [searchParams] = useSearchParams();
 const editId = searchParams.get('id');
 const [subjects, setSubjects] = useState([]);
 const [loading, setLoading] = useState(false);
 const [form, setForm] = useState({ title: '', courseId: '', description: '', dueDate: '', maxPoints: 100, status: 'active' });

 useEffect(() => {
 apiFetch('/teacher/subjects').then(r => parseJsonSafe(r)).then(d => { if (d.success) setSubjects(d.data); }).catch(console.error);
 if (editId) {
 apiFetch(`/teacher/assignments/${editId}`).then(r => parseJsonSafe(r)).then(d => {
 if (d.success && d.data) {
 const a = d.data;
 setForm({ title: a.title || '', courseId: a.courseId?._id || '', description: a.description || '', dueDate: a.dueDate ? a.dueDate.slice(0, 10) : '', maxPoints: a.maxPoints || 100, status: a.status || 'active' });
 }
 }).catch(console.error);
 }
 }, [editId]);

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (!form.title || !form.courseId || !form.dueDate) { alert(t('createAssignment.requiredFields')); return; }
 setLoading(true);
 try {
 const method = editId ? 'PUT' : 'POST';
 const endpoint = editId ? `/teacher/assignments/${editId}` : '/teacher/assignments';
 const res = await apiFetch(endpoint, {
 method,
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(form),
 });
 const data = await parseJsonSafe(res);
 if (data.success) navigate('/teacher/assignments');
 else throw new Error(data.message || t('createAssignment.createFailed'));
 } catch (e) {
 alert(e.message || t('createAssignment.createFailed'));
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className={PANEL_PAGE_BG}>
  <div className="px-3 py-4 sm:px-6 lg:px-8">
  <div className="mb-6 sm:mb-8">
  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
  {editId ? t('createAssignment.editTitle') : t('createAssignment.title')}
  </h1>
  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
  {editId ? t('createAssignment.editSubtitle') : t('createAssignment.subtitle')}
  </p>
  </div>

  <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-700 ">
  <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
  <div>
  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{t('createAssignment.assignmentTitle')} <span className="text-rose-500">*</span></label>
  <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className={fieldCls} placeholder={t('createAssignment.assignmentTitlePlaceholder')} />
  </div>
  <div>
  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{t('createAssignment.subject')} <span className="text-rose-500">*</span></label>
  <select value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })} required className={fieldCls}>
  <option value="">{t('createAssignment.selectSubject')}</option>
  {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
  </select>
  </div>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
  <div>
  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{t('createAssignment.dueDate')} <span className="text-rose-500">*</span></label>
  <CalendarDatePicker value={form.dueDate} onChange={(date) => setForm({ ...form, dueDate: date })} placeholder={t('createAssignment.selectDate')} />
  </div>
  <div>
  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{t('createAssignment.maxPoints')}</label>
  <input type="number" value={form.maxPoints} onChange={e => setForm({ ...form, maxPoints: e.target.value })} className={fieldCls} />
  </div>
  </div>
  <div>
  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{t('createAssignment.description')}</label>
  <textarea rows="4" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={fieldCls} placeholder={t('createAssignment.descriptionPlaceholder')} />
  </div>
  <div>
  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{t('createAssignment.status')}</label>
  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={fieldCls}>
  <option value="active">{t('common.active')}</option>
  <option value="completed">{t('common.completed')}</option>
  </select>
  </div>
  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
  <button type="button" onClick={() => navigate('/teacher/assignments')}
  className="w-full sm:w-auto rounded-2xl border border-slate-200 px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 transition dark:border-slate-700 dark:text-slate-300 dark:">
  {t('common.cancel')}
  </button>
  <button type="submit" disabled={loading}
  className="w-full sm:w-auto rounded-2xl bg-cyan-600 px-5 py-2 text-xs sm:text-sm font-medium text-white shadow-sm transition hover:bg-cyan-700 disabled:opacity-60">
  {loading ? t('createAssignment.creating') : (editId ? t('common.update') : t('createAssignment.create'))}
  </button>
 </div>
 </form>
 </div>
 </div>
 </div>
 );
};

export default CreateAssignment;
