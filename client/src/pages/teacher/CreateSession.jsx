import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';
import { useTranslation } from 'react-i18next';
import { PANEL_PAGE_BG } from '../../Constatns/pageStyles';

const fieldCls = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 dark:border-slate-600 dark:text-slate-100 dark:focus:border-slate-400';

const CreateSession = () => {
 const { t } = useTranslation(['teacher', 'common', 'nav', 'app']);
 const navigate = useNavigate();
 const [classes, setClasses] = useState([]);
 const [submitting, setSubmitting] = useState(false);
 const [form, setForm] = useState({
 class: '',
 sessionDate: new Date().toISOString().split('T')[0],
 sessionType: 'lecture',
 location: ''
 });

 useEffect(() => { fetchClasses(); }, []);

 const fetchClasses = async () => {
 try {
 const res = await apiFetch('/teacher/classes');
 const data = await parseJsonSafe(res);
 if (data.success) setClasses(data.data);
 } catch (e) { console.error(e); }
 };

 const handleCreate = async () => {
 if (!form.class) { alert(t('teacher.attendance.selectClass')); return; }
 setSubmitting(true);
 try {
 const res = await apiFetch('/teacher/sessions', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(form)
 });
 const data = await parseJsonSafe(res);
 if (!res.ok) throw new Error(data.message || t('teacher.attendance.failedCreateSession'));
 if (data.success) navigate('/teacher/attendance');
 } catch (e) {
 alert(e.message || t('teacher.attendance.failedCreateSession'));
 } finally { setSubmitting(false); }
 };

 return (
 <div className={PANEL_PAGE_BG}>
 <div className="px-4 py-6 sm:px-6 lg:px-8">
 <div className="mb-8">
 <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('teacher.attendance.createSession')}</h1>
 <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('teacher.attendance.subtitle')}</p>
 </div>

 <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 ">
 <div className="space-y-4">
 <div>
 <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{t('teacher.attendance.selectClass')} *</label>
 <select value={form.class} onChange={e => setForm({ ...form, class: e.target.value })} className={fieldCls}>
 <option value="">{t('teacher.attendance.selectClass')}</option>
 {classes.map(c => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
 </select>
 </div>

 <div>
 <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{t('teacher.attendance.selectDate')} *</label>
 <input type="date" value={form.sessionDate} onChange={e => setForm({ ...form, sessionDate: e.target.value })}
 className={fieldCls + ' [color-scheme:light] dark:[color-scheme:dark]'} />
 </div>

 <div>
 <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{t('teacher.attendance.sessionType')}</label>
 <select value={form.sessionType} onChange={e => setForm({ ...form, sessionType: e.target.value })} className={fieldCls}>
 <option value="lecture">{t('teacher.attendance.lecture')}</option>
 <option value="exam">{t('teacher.attendance.exam')}</option>
 <option value="other">{t('teacher.attendance.other')}</option>
 </select>
 </div>

 <div>
 <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{t('teacher.attendance.locationOptional')}</label>
 <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder={t('teacher.attendance.locationOptional')} className={fieldCls} />
 </div>
 </div>

 <div className="mt-6 flex justify-end gap-3">
 <button onClick={() => navigate('/teacher/attendance')}
 className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition dark:border-slate-600 dark:text-slate-200 dark:">
 {t('teacher.attendance.cancel')}
 </button>
 <button onClick={handleCreate} disabled={submitting}
 className="rounded-2xl bg-cyan-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-cyan-700 hover:shadow-md disabled:opacity-60">
 {submitting ? t('teacher.attendance.creating') : t('teacher.attendance.create')}
 </button>
 </div>
 </div>
 </div>
 </div>
 );
};

export default CreateSession;
