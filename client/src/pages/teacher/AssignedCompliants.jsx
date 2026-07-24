import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiEye, FiCheck, FiPlus, FiEdit2, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';
import { PANEL_PAGE_BG } from '../../Constatns/pageStyles';

const statusColors = {
 open: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
 in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
 closed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};
const priorityColors = {
 high: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
 medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
 low: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
};
const fieldCls = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 dark:border-slate-600 dark:text-slate-200';
const labelCls = 'mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400';

const MOCK = [
 { _id: 'c1', complaintCode: 'CMP-0001', subject: 'Broken AC in Classroom 3', description: 'The air conditioner in Classroom 3 has been malfunctioning for a week. Students are uncomfortable during afternoon classes.', complaintCategory: 'Facilities', priorityLevel: 'high', complaintStatus: 'open', submittedDate: '2026-06-20T10:00:00Z', assignedTo: { name: 'Teacher' } },
 { _id: 'c2', complaintCode: 'CMP-0002', subject: 'Student Attendance Issue', description: 'Several students in Class 10-B have been consistently late. Need a follow-up meeting with parents.', complaintCategory: 'Student Behavior', priorityLevel: 'medium', complaintStatus: 'in_progress', submittedDate: '2026-06-18T14:30:00Z', assignedTo: { name: 'Teacher' } },
 { _id: 'c3', complaintCode: 'CMP-0003', subject: 'Library Books Missing', description: 'Three copies of the Quran Tafsir textbook are missing from the library. Request investigation.', complaintCategory: 'Academic', priorityLevel: 'low', complaintStatus: 'closed', submittedDate: '2026-06-15T09:00:00Z', assignedTo: { name: 'Teacher' }, closedAt: '2026-06-20T16:00:00Z' },
];

const AssignedComplaints = () => {
 const { t } = useTranslation(['teacher', 'common', 'nav', 'app']);
 const [complaints, setComplaints] = useState([]);
 const [selected, setSelected] = useState(null);
 const [filterStatus, setFilterStatus] = useState('');
 const [search, setSearch] = useState('');
 const [loading, setLoading] = useState(false);
 const [showForm, setShowForm] = useState(false);
 const [editingComplaint, setEditingComplaint] = useState(null);
 const [feedbackModal, setFeedbackModal] = useState(null);
 const [feedbacks, setFeedbacks] = useState([]);
 const [feedbackText, setFeedbackText] = useState('');
 const [feedbackRating, setFeedbackRating] = useState(3);
 const [form, setForm] = useState({ subject: '', description: '', complaintCategory: 'Academic', priorityLevel: 'medium' });
 const catLabels = { Academic: t('assignedComplaints.catAcademic'), Facilities: t('assignedComplaints.catFacilities'), 'Student Behavior': t('assignedComplaints.catStudentBehavior'), Staff: t('assignedComplaints.catStaff'), Safety: t('assignedComplaints.catSafety'), Other: t('assignedComplaints.catOther') };
 const categories = [catLabels.Academic, catLabels.Facilities, catLabels['Student Behavior'], catLabels.Staff, catLabels.Safety, catLabels.Other];
 const priorityLabels = { high: t('assignedComplaints.priorityHigh'), medium: t('assignedComplaints.priorityMedium'), low: t('assignedComplaints.priorityLow') };
 const statusLabels = { open: t('assignedComplaints.open'), in_progress: t('assignedComplaints.inProgress'), closed: t('assignedComplaints.closed') };

 useEffect(() => { fetchComplaints(); }, []);

 const fetchComplaints = async () => {
 setLoading(true);
 try {
 const res = await apiFetch('/teacher/complaints');
 const data = await parseJsonSafe(res);
 if (data.success && data.data?.length > 0) setComplaints(data.data);
 else setComplaints(MOCK);
 } catch { setComplaints(MOCK); } finally { setLoading(false); }
 };

 const handleCreate = async () => {
 if (!form.subject.trim()) { alert(t('assignedComplaints.subjectRequired')); return; }
 try {
 const res = await apiFetch('/teacher/complaints', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(form),
 });
 const data = await parseJsonSafe(res);
 if (data.success) { setShowForm(false); setForm({ subject: '', description: '', complaintCategory: 'Academic', priorityLevel: 'medium' }); fetchComplaints(); }
 else alert(data.message || t('assignedComplaints.createFailed'));
 } catch { alert(t('assignedComplaints.createFailed')); }
 };

 const handleEdit = async () => {
 if (!editingComplaint) return;
 try {
 const res = await apiFetch('/teacher/complaints/' + editingComplaint._id, {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(form),
 });
 const data = await parseJsonSafe(res);
 if (data.success) { setEditingComplaint(null); setShowForm(false); fetchComplaints(); }
 else alert(data.message || t('assignedComplaints.updateFailed'));
 } catch { alert(t('assignedComplaints.updateFailed')); }
 };

 const handleDelete = async (id) => {
 if (!confirm(t('assignedComplaints.deleteConfirm'))) return;
 try {
 const res = await apiFetch('/teacher/complaints/' + id, { method: 'DELETE' });
 const data = await parseJsonSafe(res);
 if (data.success) fetchComplaints();
 else alert(data.message || t('assignedComplaints.deleteFailed'));
 } catch { alert(t('assignedComplaints.deleteFailed')); }
 };

 const updateStatus = async (id, status) => {
 try {
 const res = await apiFetch('/teacher/complaints/' + id + '/status', {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ status }),
 });
 const data = await parseJsonSafe(res);
 if (data.success) { fetchComplaints(); setSelected(null); }
 } catch { alert(t('assignedComplaints.updateStatusFailed')); }
 };

 const openFeedback = async (complaint) => {
 setFeedbackModal(complaint);
 try {
 const res = await apiFetch('/teacher/complaints/' + complaint._id + '/feedback');
 const data = await parseJsonSafe(res);
 setFeedbacks(data.success ? data.data : []);
 } catch { setFeedbacks([]); }
 };

 const submitFeedback = async () => {
 if (!feedbackModal || !feedbackText.trim()) return;
 try {
 const res = await apiFetch('/teacher/complaints/' + feedbackModal._id + '/feedback', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ satisfactionLevel: feedbackRating, comments: feedbackText }),
 });
 const data = await parseJsonSafe(res);
 if (data.success) {
 setFeedbackText('');
 setFeedbackRating(3);
 openFeedback(feedbackModal);
 }
 } catch { alert(t('assignedComplaints.feedbackFailed')); }
 };

 const deleteFeedback = async (id) => {
 if (!confirm(t('assignedComplaints.deleteFeedbackConfirm'))) return;
 try {
 const res = await apiFetch('/teacher/complaint-feedback/' + id, { method: 'DELETE' });
 const data = await parseJsonSafe(res);
 if (data.success && feedbackModal) openFeedback(feedbackModal);
 } catch { alert(t('assignedComplaints.deleteFeedbackFailed')); }
 };

 const openEditForm = (c) => {
 setForm({ subject: c.subject, description: c.description || '', complaintCategory: c.complaintCategory || 'Academic', priorityLevel: c.priorityLevel || 'medium' });
 setEditingComplaint(c);
 setShowForm(true);
 };

 const openCreateForm = () => {
 setForm({ subject: '', description: '', complaintCategory: 'Academic', priorityLevel: 'medium' });
 setEditingComplaint(null);
 setShowForm(true);
 };

 const filtered = complaints.filter(c => {
 const matchStatus = filterStatus === '' || c.complaintStatus === filterStatus;
 const matchSearch = c.subject?.toLowerCase().includes(search.toLowerCase()) || c.complaintCode?.toLowerCase().includes(search.toLowerCase());
 return matchStatus && matchSearch;
 });

 const stats = {
 total: complaints.length,
 open: complaints.filter(c => c.complaintStatus === 'open').length,
 inProgress: complaints.filter(c => c.complaintStatus === 'in_progress').length,
 closed: complaints.filter(c => c.complaintStatus === 'closed').length,
 };

 const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

 return (
 <div className={PANEL_PAGE_BG}>
  <div className="px-3 py-4 sm:px-6 lg:px-8">
  <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start justify-between gap-3">
  <div>
  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{t('assignedComplaints.title')}</h1>
  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t('assignedComplaints.subtitle')}</p>
  </div>
  <button onClick={openCreateForm} className="flex items-center gap-2 rounded-2xl bg-cyan-600 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white shadow-sm transition hover:bg-cyan-700">
  <FiPlus size={14} /> {t('assignedComplaints.addComplaint')}
  </button>
 </div>

 {/* Stats */}
  <section className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
  {[
  { label: t('common.total'), value: stats.total, accent: 'bg-cyan-500' },
  { label: t('assignedComplaints.open'), value: stats.open, accent: 'bg-rose-500' },
  { label: t('assignedComplaints.inProgress'), value: stats.inProgress, accent: 'bg-amber-500' },
  { label: t('assignedComplaints.closed'), value: stats.closed, accent: 'bg-emerald-500' },
  ].map(c => (
  <div key={c.label} className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-3 sm:p-5 shadow-sm dark:border-slate-700 ">
  <div className={`absolute inset-x-0 top-0 h-1 ${c.accent}`} />
  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">{c.label}</p>
  <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{c.value}</p>
  </div>
  ))}
  </section>

 {/* Filters */}
  <div className="mb-6 rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-3 sm:p-5 shadow-sm dark:border-slate-700 ">
  <div className="flex flex-wrap gap-2 sm:gap-3">
  <input type="text" placeholder={t('assignedComplaints.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} className="min-w-[140px] sm:min-w-0 flex-1 rounded-2xl border border-slate-200 px-3 sm:px-4 py-2 text-xs sm:text-sm text-slate-600 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 dark:border-slate-600 dark:text-slate-200" />
  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-600 outline-none focus:border-cyan-300 dark:border-slate-600 dark:text-slate-200">
 <option value="">{t('assignedComplaints.allStatus')}</option>
 <option value="open">{t('assignedComplaints.open')}</option>
 <option value="in_progress">{t('assignedComplaints.inProgress')}</option>
 <option value="closed">{t('assignedComplaints.closed')}</option>
 </select>
 </div>
 </div>

 {/* Table */}
  <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 ">
  {loading ? (
  <div className="flex h-32 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500 dark:border-slate-700 dark:border-t-cyan-400" /></div>
  ) : filtered.length === 0 ? (
  <div className="px-4 py-12 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
  <div className="mx-auto w-fit rounded-2xl border border-dashed border-slate-200 px-4 sm:px-6 py-3 sm:py-4 dark:border-slate-700">{t('assignedComplaints.noComplaints')}</div>
  </div>
  ) : (
  <div className="overflow-x-auto">
  <table className="w-full text-xs sm:text-sm">
  <thead>
  <tr className="border-b border-slate-100 dark:border-slate-700 ">
  {[t('assignedComplaints.code'), t('assignedComplaints.subject'), t('assignedComplaints.category'), t('assignedComplaints.priority'), t('common.status'), t('common.date'), t('common.actions')].map(h => (
  <th key={h} className="whitespace-nowrap px-2 sm:px-4 py-3 text-left text-[10px] sm:text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">{h}</th>
  ))}
  </tr>
  </thead>
  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
  {filtered.map(c => (
  <tr key={c._id} className="transition dark:">
  <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-cyan-600 dark:text-cyan-400 text-[10px] sm:text-xs">{c.complaintCode}</td>
  <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-700 dark:text-slate-100 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{c.subject}</td>
  <td className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3"><span className="rounded-full px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-300">{catLabels[c.complaintCategory] || c.complaintCategory || '-'}</span></td>
  <td className="hidden md:table-cell px-2 sm:px-4 py-2 sm:py-3"><span className={`rounded-full px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-medium ${priorityColors[c.priorityLevel]}`}>{priorityLabels[c.priorityLevel] || c.priorityLevel}</span></td>
  <td className="px-2 sm:px-4 py-2 sm:py-3"><span className={`rounded-full px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-medium ${statusColors[c.complaintStatus]}`}>{statusLabels[c.complaintStatus] || c.complaintStatus}</span></td>
  <td className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">{formatDate(c.submittedDate)}</td>
  <td className="px-2 sm:px-4 py-2 sm:py-3">
  <div className="flex gap-1">
  <button onClick={() => setSelected(c)} title={t('assignedComplaints.view')} className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl border border-sky-200 bg-sky-50 text-sky-600 transition hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-900/30 dark:text-sky-400"><FiEye size={12} /></button>
  <button onClick={() => openFeedback(c)} title={t('assignedComplaints.feedback')} className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl border border-violet-200 bg-violet-50 text-violet-600 transition hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-900/30 dark:text-violet-400"><FiMessageSquare size={12} /></button>
  <button onClick={() => openEditForm(c)} title={t('assignedComplaints.edit')} className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl border border-amber-200 bg-amber-50 text-amber-600 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400"><FiEdit2 size={12} /></button>
  <button onClick={() => handleDelete(c._id)} title={t('assignedComplaints.delete')} className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400"><FiTrash2 size={12} /></button>
  {c.complaintStatus !== 'closed' && (
  <button onClick={() => updateStatus(c._id, 'closed')} title={t('assignedComplaints.resolve')} className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"><FiCheck size={12} /></button>
  )}
  </div>
  </td>
  </tr>
  ))}
  </tbody>
  </table>
  </div>
  )}
  </div>
 </div>

 {/* View Detail Modal */}
 {selected && (
 <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
 <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 ">
 <div className="mb-5 flex items-start justify-between">
 <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{selected.subject}</h2>
 <button onClick={() => setSelected(null)} className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-500 dark:border-slate-600 dark:text-slate-400 dark:">×</button>
 </div>
 <div className="space-y-3 text-sm">
 <div className="flex justify-between"><span className="text-slate-400">{t('assignedComplaints.code')}:</span><span className="font-medium text-slate-700 dark:text-slate-100">{selected.complaintCode}</span></div>
 <div className="flex justify-between"><span className="text-slate-400">{t('assignedComplaints.category')}:</span><span className="font-medium text-slate-700 dark:text-slate-100">{catLabels[selected.complaintCategory] || selected.complaintCategory || '-'}</span></div>
 <div className="flex justify-between"><span className="text-slate-400">{t('assignedComplaints.priority')}:</span><span className={`rounded-full px-3 py-0.5 text-xs font-medium ${priorityColors[selected.priorityLevel]}`}>{priorityLabels[selected.priorityLevel] || selected.priorityLevel}</span></div>
 <div className="flex justify-between"><span className="text-slate-400">{t('common.status')}:</span><span className={`rounded-full px-3 py-0.5 text-xs font-medium ${statusColors[selected.complaintStatus]}`}>{statusLabels[selected.complaintStatus] || selected.complaintStatus}</span></div>
 <div className="flex justify-between"><span className="text-slate-400">{t('common.date')}:</span><span className="font-medium text-slate-700 dark:text-slate-100">{formatDate(selected.submittedDate)}</span></div>
 {selected.closedAt && <div className="flex justify-between"><span className="text-slate-400">{t('assignedComplaints.closed')}:</span><span className="font-medium text-slate-700 dark:text-slate-100">{formatDate(selected.closedAt)}</span></div>}
 <div>
 <p className="mb-2 text-slate-400">{t('assignedComplaints.description')}:</p>
 <p className="rounded-2xl border border-slate-100 p-3 text-slate-600 dark:border-slate-600 dark:text-slate-300">{selected.description || t('assignedComplaints.noDescription')}</p>
 </div>
 </div>
 {selected.complaintStatus !== 'closed' && (
 <div className="mt-5 flex justify-end gap-3">
 {selected.complaintStatus === 'open' && (
 <button onClick={() => updateStatus(selected._id, 'in_progress')} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 dark:border-slate-600 dark:text-slate-200 dark:">{t('assignedComplaints.markInProgress')}</button>
 )}
 <button onClick={() => updateStatus(selected._id, 'closed')} className="rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-cyan-700">{t('assignedComplaints.markResolved')}</button>
 </div>
 )}
 </div>
 </div>
 )}

 {/* Create/Edit Modal */}
 {showForm && (
 <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
 <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 ">
 <div className="mb-5 flex items-start justify-between">
 <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{editingComplaint ? t('assignedComplaints.editComplaint') : t('assignedComplaints.newComplaint')}</h2>
 <button onClick={() => { setShowForm(false); setEditingComplaint(null); }} className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-500 dark:border-slate-600 dark:text-slate-400 dark:">×</button>
 </div>
 <div className="space-y-4">
 <div>
 <label className={labelCls}>{t('assignedComplaints.subject')} *</label>
 <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className={fieldCls} placeholder={t('assignedComplaints.subjectPlaceholder')} />
 </div>
 <div>
 <label className={labelCls}>{t('assignedComplaints.category')}</label>
 <select value={form.complaintCategory} onChange={e => setForm({ ...form, complaintCategory: e.target.value })} className={fieldCls}>
 {categories.map(c => <option key={c} value={c}>{c}</option>)}
 </select>
 </div>
 <div>
 <label className={labelCls}>{t('assignedComplaints.priority')}</label>
 <select value={form.priorityLevel} onChange={e => setForm({ ...form, priorityLevel: e.target.value })} className={fieldCls}>
 <option value="low">{t('assignedComplaints.priorityLow')}</option>
 <option value="medium">{t('assignedComplaints.priorityMedium')}</option>
 <option value="high">{t('assignedComplaints.priorityHigh')}</option>
 </select>
 </div>
 <div>
 <label className={labelCls}>{t('assignedComplaints.description')}</label>
 <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={fieldCls} rows={3} placeholder={t('assignedComplaints.descriptionPlaceholder')} />
 </div>
 </div>
 <div className="mt-5 flex justify-end gap-3">
 <button onClick={() => { setShowForm(false); setEditingComplaint(null); }} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 dark:border-slate-600 dark:text-slate-200 dark:">{t('common.cancel')}</button>
 <button onClick={editingComplaint ? handleEdit : handleCreate} className="rounded-2xl bg-cyan-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-cyan-700">{editingComplaint ? t('common.update') : t('common.create')}</button>
 </div>
 </div>
 </div>
 )}

 {/* Feedback Modal */}
 {feedbackModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
 <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 ">
 <div className="mb-5 flex items-start justify-between">
 <div>
 <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('assignedComplaints.feedback')}</h2>
 <p className="text-xs text-slate-400 dark:text-slate-500">{feedbackModal.complaintCode} - {feedbackModal.subject}</p>
 </div>
 <button onClick={() => setFeedbackModal(null)} className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-500 dark:border-slate-600 dark:text-slate-400 dark:">×</button>
 </div>

 {/* Existing Feedback */}
 <div className="mb-4 max-h-48 space-y-2 overflow-y-auto">
 {feedbacks.length === 0 ? (
 <p className="text-center text-xs text-slate-400 py-4">{t('assignedComplaints.noFeedback')}</p>
 ) : feedbacks.map(f => (
 <div key={f._id} className="rounded-2xl border border-slate-100 p-3 dark:border-slate-700 ">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{f.feedbackBy?.name || t('assignedComplaints.teacher')}</span>
 <div className="flex gap-0.5">
 {[1,2,3,4,5].map(n => (
 <span key={n} className={`text-xs ${n <= (f.satisfactionLevel || 0) ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}>★</span>
 ))}
 </div>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-[10px] text-slate-400">{new Date(f.createdAt).toLocaleDateString()}</span>
 <button onClick={() => deleteFeedback(f._id)} className="text-rose-400 hover:text-rose-600"><FiTrash2 size={12} /></button>
 </div>
 </div>
 <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{f.comments}</p>
 </div>
 ))}
 </div>

 {/* Add Feedback */}
 <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
 <div className="mb-3">
 <label className={labelCls}>{t('assignedComplaints.rating')}</label>
 <div className="flex gap-1">
 {[1,2,3,4,5].map(n => (
 <button key={n} onClick={() => setFeedbackRating(n)} className={`text-xl transition ${n <= feedbackRating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}>★</button>
 ))}
 </div>
 </div>
 <div>
 <label className={labelCls}>{t('assignedComplaints.comment')}</label>
 <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} className={fieldCls} rows={2} placeholder={t('assignedComplaints.writeFeedback')} />
 </div>
 <div className="mt-3 flex justify-end">
 <button onClick={submitFeedback} className="rounded-2xl bg-cyan-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-cyan-700">{t('assignedComplaints.submitFeedback')}</button>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};

export default AssignedComplaints;
