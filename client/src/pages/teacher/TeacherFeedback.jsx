import { useState, useEffect, useMemo } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiStar, FiFilter } from 'react-icons/fi';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';
import { useTranslation } from 'react-i18next';
import { PANEL_PAGE_BG } from '../../Constatns/pageStyles';

const typeColors = {
  student: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  admin: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  peer: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  self: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

const categoryColors = {
  academic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  behavior: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  attendance: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  participation: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  improvement: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  general: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

const types = ['student', 'admin', 'peer', 'self'];
const categories = ['academic', 'behavior', 'attendance', 'participation', 'improvement', 'general'];
const fieldCls = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200';
const labelCls = 'mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400';

const MOCK = [
  { _id: 'f1', feedbackType: 'student', subject: 'Ahmad Khan - Excellent Quran recitation', category: 'academic', rating: 5, comments: 'Ahmad has shown remarkable improvement in his Quran recitation. His tajweed is excellent and he leads the class with confidence.', student: { user: { name: 'Ahmad Khan' }, studentCode: 'STU-001' }, class: { name: 'Class 10', section: 'A' }, subjectRef: { name: 'Quran Tafsir' }, createdAt: '2026-06-25T10:00:00Z', tags: ['excellent', 'quran'] },
  { _id: 'f2', feedbackType: 'student', subject: 'Fatima Al-Hassan - Needs improvement in attendance', category: 'attendance', rating: 2, comments: 'Fatima has been absent 4 times this month. Need to follow up with parents regarding attendance.', student: { user: { name: 'Fatima Al-Hassan' }, studentCode: 'STU-002' }, class: { name: 'Class 10', section: 'A' }, subjectRef: { name: 'Hadith Studies' }, createdAt: '2026-06-22T14:00:00Z', tags: ['attention-needed'] },
  { _id: 'f3', feedbackType: 'self', subject: 'Teaching methods review', category: 'improvement', rating: 4, comments: 'I need to incorporate more interactive teaching methods. The students respond well to group discussions.', createdAt: '2026-06-20T09:00:00Z', tags: ['self-reflection'] },
  { _id: 'f4', feedbackType: 'admin', subject: 'Annual performance review feedback', category: 'general', rating: 4, comments: 'Good performance overall. Recommended for senior teacher position. Students consistently perform well in exams.', createdAt: '2026-06-15T11:00:00Z', tags: ['performance'] },
];

const TeacherFeedback = () => {
  const { t } = useTranslation();
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ feedbackType: 'student', subject: '', category: 'general', rating: 3, comments: '', tags: '' });

  useEffect(() => { fetchFeedbacks(); fetchStats(); }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType) params.append('type', filterType);
      if (filterCategory) params.append('category', filterCategory);
      const res = await apiFetch('/teacher/feedback?' + params.toString());
      const data = await parseJsonSafe(res);
      if (data.success && data.data?.length > 0) setFeedbacks(data.data);
      else setFeedbacks(MOCK);
    } catch { setFeedbacks(MOCK); } finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const res = await apiFetch('/teacher/feedback/stats');
      const data = await parseJsonSafe(res);
      if (data.success) setStats(data.data);
    } catch {}
  };

  const handleCreate = async () => {
    if (!form.subject.trim()) { alert(t('teacher.feedback.subjectRequired')); return; }
    try {
      const body = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [] };
      const res = await apiFetch('/teacher/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await parseJsonSafe(res);
      if (data.success) { setShowForm(false); resetForm(); fetchFeedbacks(); fetchStats(); }
      else alert(data.message || t('teacher.feedback.createFailed'));
    } catch { alert(t('teacher.feedback.createFailed')); }
  };

  const handleEdit = async () => {
    if (!editing) return;
    try {
      const body = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [] };
      const res = await apiFetch('/teacher/feedback/' + editing._id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await parseJsonSafe(res);
      if (data.success) { setEditing(null); setShowForm(false); resetForm(); fetchFeedbacks(); fetchStats(); }
      else alert(data.message || t('teacher.feedback.updateFailed'));
    } catch { alert(t('teacher.feedback.updateFailed')); }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('teacher.feedback.deleteConfirm'))) return;
    try {
      const res = await apiFetch('/teacher/feedback/' + id, { method: 'DELETE' });
      const data = await parseJsonSafe(res);
      if (data.success) { fetchFeedbacks(); fetchStats(); }
      else alert(data.message || t('teacher.feedback.deleteFailed'));
    } catch { alert(t('teacher.feedback.deleteFailed')); }
  };

  const resetForm = () => setForm({ feedbackType: 'student', subject: '', category: 'general', rating: 3, comments: '', tags: '' });

  const openCreate = () => { resetForm(); setEditing(null); setShowForm(true); };

  const openEdit = (f) => {
    setForm({
      feedbackType: f.feedbackType,
      subject: f.subject,
      category: f.category || 'general',
      rating: f.rating || 3,
      comments: f.comments || '',
      tags: f.tags?.join(', ') || '',
    });
    setEditing(f);
    setShowForm(true);
  };

  const filtered = feedbacks.filter(f => {
    const matchSearch = !search || f.subject?.toLowerCase().includes(search.toLowerCase()) || f.comments?.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const summary = useMemo(() => ({
    total: feedbacks.length,
    avgRating: feedbacks.length ? (feedbacks.reduce((a, f) => a + (f.rating || 0), 0) / feedbacks.length).toFixed(1) : 0,
    student: feedbacks.filter(f => f.feedbackType === 'student').length,
    self: feedbacks.filter(f => f.feedbackType === 'self').length,
  }), [feedbacks]);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  return (
    <div className={PANEL_PAGE_BG}>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('teacher.feedback.title')}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('teacher.feedback.subtitle')}</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-cyan-700">
            <FiPlus size={16} /> {t('teacher.feedback.newFeedback')}
          </button>
        </div>

        {/* Stats */}
        <section className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: t('teacher.feedback.totalFeedback'), value: summary.total, accent: 'bg-cyan-500' },
            { label: t('teacher.feedback.avgRating'), value: summary.avgRating + '/5', accent: 'bg-amber-500' },
            { label: t('teacher.feedback.studentFeedback'), value: summary.student, accent: 'bg-violet-500' },
            { label: t('teacher.feedback.selfReflections'), value: summary.self, accent: 'bg-emerald-500' },
          ].map(c => (
            <div key={c.label} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
              <div className={`absolute inset-x-0 top-0 h-1 ${c.accent}`} />
              <p className="text-xs text-slate-500 dark:text-slate-400">{c.label}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{c.value}</p>
            </div>
          ))}
        </section>

        {/* Filters */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <div className="flex flex-wrap gap-3 items-center">
            <FiFilter className="text-slate-400" size={16} />
            <input type="text" placeholder={t('teacher.feedback.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-600 outline-none focus:border-cyan-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 min-w-[200px]" />
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
              <option value="">{t('teacher.feedback.allTypes')}</option>
              {types.map(type => <option key={type} value={type}>{t('teacher.feedback.type.' + type)}</option>)}
            </select>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
              <option value="">{t('teacher.feedback.allCategories')}</option>
              {categories.map(c => <option key={c} value={c}>{t('teacher.feedback.category.' + c)}</option>)}
            </select>
            <button onClick={fetchFeedbacks} className="rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700">{t('common.apply')}</button>
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500 dark:border-slate-700 dark:border-t-cyan-400" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('teacher.feedback.noFeedback')}</p>
            </div>
          ) : filtered.map(f => (
            <div key={f._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeColors[f.feedbackType]}`}>{t('teacher.feedback.type.' + f.feedbackType)}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryColors[f.category]}`}>{t('teacher.feedback.category.' + f.category)}</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <FiStar key={n} size={14} className={n <= (f.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'} />
                      ))}
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{f.subject}</h3>
                  {f.student && (
                    <p className="mt-1 text-xs text-cyan-600 dark:text-cyan-400">
                      {t('teacher.feedback.student')}: {f.student.user?.name || t('common.unknown')} ({f.student.studentCode || t('common.na')})
                    </p>
                  )}
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{f.comments}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                    <span>{formatDate(f.createdAt)}</span>
                    {f.class && <span>{t('teacher.feedback.feedbackClass')}: {f.class.name} {f.class.section || ''}</span>}
                    {f.subjectRef && <span>{t('teacher.feedback.feedbackSubject')}: {f.subjectRef.name}</span>}
                    {f.tags?.length > 0 && (
                      <div className="flex gap-1">
                        {f.tags.map(tag => (
                          <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => openEdit(f)} title={t('teacher.feedback.edit')} className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400"><FiEdit2 size={14} /></button>
                  <button onClick={() => handleDelete(f._id)} title={t('teacher.feedback.delete')} className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400"><FiTrash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex items-start justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{editing ? t('teacher.feedback.editFeedback') : t('teacher.feedback.newFeedback')}</h2>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700">×</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>{t('teacher.feedback.feedbackType')}</label>
                  <select value={form.feedbackType} onChange={e => setForm({ ...form, feedbackType: e.target.value })} className={fieldCls}>
                    {types.map(type => <option key={type} value={type}>{t('teacher.feedback.type.' + type)}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{t('teacher.feedback.feedbackCategory')}</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={fieldCls}>
                    {categories.map(c => <option key={c} value={c}>{t('teacher.feedback.category.' + c)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>{t('teacher.feedback.subject')}</label>
                <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className={fieldCls} placeholder={t('teacher.feedback.subjectPlaceholder')} />
              </div>
              <div>
                <label className={labelCls}>{t('teacher.feedback.rating')}</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })} className="text-2xl transition">
                      <FiStar className={n <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>{t('teacher.feedback.comments')}</label>
                <textarea value={form.comments} onChange={e => setForm({ ...form, comments: e.target.value })} className={fieldCls} rows={4} placeholder={t('teacher.feedback.commentsPlaceholder')} />
              </div>
              <div>
                <label className={labelCls}>{t('teacher.feedback.tags')}</label>
                <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className={fieldCls} placeholder={t('teacher.feedback.tagsPlaceholder')} />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">{t('common.cancel')}</button>
              <button onClick={editing ? handleEdit : handleCreate} className="rounded-2xl bg-cyan-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-cyan-700">{editing ? t('common.update') : t('common.create')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherFeedback;
