import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';
import { FiBook } from 'react-icons/fi';

const AdminSyllabus = () => {
  const { t } = useTranslation('admin');
  const [items, setItems] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ className: '', subject: '', topic: '', description: '', semester: '', order: '' });

  const fetchData = async () => {
    try {
      setError('');
      const { data } = await api.get('/academic/syllabus');
      setItems(Array.isArray(data) ? data : data.data || []);
    } catch (err) { setItems([]); setError(err.response?.data?.message || err.message); } finally { setLoading(false); }
  };

  const fetchClasses = async () => {
    try {
      const { data } = await api.get('/academic/classes');
      setClasses(Array.isArray(data) ? data : data.data || []);
    } catch { setClasses([]); }
  };

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get('/academic/subjects');
      setSubjects(Array.isArray(data) ? data : data.data || []);
    } catch { setSubjects([]); }
  };

  useEffect(() => { fetchData(); fetchClasses(); fetchSubjects(); }, []);

  useEffect(() => {
    const syncLang = () => {
      const lang = readStoredLanguage('adminLang', 'en');
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    };
    syncLang();
    window.addEventListener('storage', syncLang);
    return () => window.removeEventListener('storage', syncLang);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, order: form.order ? Number(form.order) : 0 };
      if (editingId) { await api.put(`/academic/syllabus/${editingId}`, payload); }
      else { await api.post('/academic/syllabus', payload); }
      setShowForm(false); setEditingId(null);
      setForm({ className: '', subject: '', topic: '', description: '', semester: '', order: '' });
      fetchData();
    } catch (err) { const msg = err.response?.data?.message || err.message; alert(t('common.serverError') + ': ' + msg); console.error('Error saving syllabus:', msg); }
  };

  const handleEdit = (item) => {
    setForm({ className: item.className || '', subject: item.subject || '', topic: item.topic || '', description: item.description || '', semester: item.semester || '', order: item.order != null ? String(item.order) : '' });
    setEditingId(item._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('academic.deleteSyllabusConfirm'))) return;
    try { await api.delete(`/academic/syllabus/${id}`); fetchData(); } catch (err) { console.error('Error deleting:', err); }
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">{t('academic.loading')}</div>;

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6"><div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('academic.syllabusManagement')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('academic.manageSyllabus')}</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ className: '', subject: '', topic: '', description: '', semester: '', order: '' }); }} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700">
          {showForm ? t('common.cancel') : '+ ' + t('academic.addSyllabusItem')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('academic.class')}</label><select value={form.className} onChange={e => setForm({ ...form, className: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required><option value="">{t('academic.select')}</option>{classes.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}</select></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('academic.subject')}</label><select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required><option value="">{t('academic.select')}</option>{subjects.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}</select></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('academic.topic')}</label><input value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('academic.semester')}</label><input value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder={t('academic.semesterPlaceholder')} /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('academic.order')}</label><input type="number" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder={t('academic.orderPlaceholder')} /></div>
            <div className="md:col-span-3"><label className="mb-1 block text-sm font-medium text-slate-700">{t('academic.description')}</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" rows={2} /></div>
          </div>
          <button type="submit" className="mt-4 rounded-lg bg-cyan-600 px-6 py-2 text-sm font-medium text-white hover:bg-cyan-700">{editingId ? t('common.update') : t('common.create')}</button>
        </form>
      )}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{t('common.error')}: {error}</div>
      )}

      {items.length === 0 && !error ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-slate-400 shadow-sm">
          <FiBook size={48} />
          <p className="text-sm">{t('academic.noSyllabus')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="px-5 py-3 font-semibold text-slate-600">{t('academic.class')}</th><th className="px-5 py-3 font-semibold text-slate-600">{t('academic.subject')}</th><th className="px-5 py-3 font-semibold text-slate-600">{t('academic.topic')}</th><th className="px-5 py-3 font-semibold text-slate-600">{t('academic.semester')}</th><th className="px-5 py-3 font-semibold text-slate-600">{t('academic.order')}</th><th className="px-5 py-3 font-semibold text-slate-600">{t('academic.description')}</th><th className="px-5 py-3 font-semibold text-slate-600">{t('academic.actions')}</th></tr></thead>
            <tbody>
              {items.map(item => (
                <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-600">{item.className || '-'}</td>
                  <td className="px-5 py-3 text-slate-600">{item.subject || '-'}</td>
                  <td className="px-5 py-3 font-medium text-slate-800">{item.topic || '-'}</td>
                  <td className="px-5 py-3 text-slate-600">{item.semester || '-'}</td>
                  <td className="px-5 py-3 text-slate-600">{item.order != null ? item.order : '-'}</td>
                  <td className="max-w-[250px] truncate px-5 py-3 text-slate-600" title={item.description}>{item.description || '-'}</td>
                  <td className="px-5 py-3"><div className="flex gap-2"><button onClick={() => handleEdit(item)} className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">{t('common.edit')}</button><button onClick={() => handleDelete(item._id)} className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">{t('common.delete')}</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </div>
  );
};

export default AdminSyllabus;
