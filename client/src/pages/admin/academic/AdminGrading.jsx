import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';

const AdminGrading = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', grades: [] });
  const [gradeRow, setGradeRow] = useState({ grade: '', minMarks: '', maxMarks: '', gpa: '', remark: '' });
  const { t } = useTranslation('admin');

  useEffect(() => {
    const syncLang = () => {
      const lang = readStoredLanguage('adminLang', 'en');
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    };
    syncLang();
    window.addEventListener('storage', syncLang);
    return () => window.removeEventListener('storage', syncLang);
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/academic/grading');
      setSchemes(Array.isArray(data) ? data : data.data || []);
    } catch { setSchemes([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const addGradeRow = () => {
    if (gradeRow.grade) {
      setForm({ ...form, grades: [...form.grades, { ...gradeRow }] });
      setGradeRow({ grade: '', minMarks: '', maxMarks: '', gpa: '', remark: '' });
    }
  };

  const removeGradeRow = (i) => setForm({ ...form, grades: form.grades.filter((_, idx) => idx !== i) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) { await api.put(`/academic/grading/${editingId}`, form); }
      else { await api.post('/academic/grading', form); }
      setShowForm(false); setEditingId(null);
      setForm({ name: '', description: '', grades: [] });
      fetchData();
    } catch (err) { console.error('Error saving grading:', err); }
  };

  const handleEdit = (s) => {
    setForm({ name: s.name || '', description: s.description || '', grades: s.grades || [] });
    setEditingId(s._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('academic.deleteGradingConfirm'))) return;
    try { await api.delete(`/academic/grading/${id}`); fetchData(); } catch (err) { console.error('Error deleting:', err); }
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">{t('common.loading')}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('academic.gradingSystem')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('academic.manageGrading')}</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', description: '', grades: [] }); }} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700">
          {showForm ? t('common.cancel') : '+ ' + t('academic.addGradingScheme')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('academic.schemeName')}</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('academic.description')}</label><input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">{t('academic.gradeBoundaries')}</p>
            <div className="grid grid-cols-5 gap-2">
              <input placeholder={t('academic.gradePlaceholder')} value={gradeRow.grade} onChange={e => setGradeRow({ ...gradeRow, grade: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <input placeholder={t('academic.minPercent')} value={gradeRow.minMarks} onChange={e => setGradeRow({ ...gradeRow, minMarks: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <input placeholder={t('academic.maxPercent')} value={gradeRow.maxMarks} onChange={e => setGradeRow({ ...gradeRow, maxMarks: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <input placeholder={t('academic.gpaPlaceholder')} value={gradeRow.gpa} onChange={e => setGradeRow({ ...gradeRow, gpa: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <button type="button" onClick={addGradeRow} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">+ {t('academic.add')}</button>
            </div>
            {form.grades.length > 0 && (
              <div className="mt-3 space-y-1">
                {form.grades.map((g, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <span><strong>{g.grade}</strong> {t('common.na') || '—'} {t('academic.gradeRange', { min: g.minMarks, max: g.maxMarks, gpa: g.gpa })}</span>
                    <button type="button" onClick={() => removeGradeRow(i)} aria-label={t('common.remove')} className="text-rose-500 hover:text-rose-700">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="submit" className="mt-4 rounded-lg bg-cyan-600 px-6 py-2 text-sm font-medium text-white hover:bg-cyan-700">{editingId ? t('academic.updateScheme') : t('academic.createScheme')}</button>
        </form>
      )}

      <div className="space-y-4">
        {schemes.length === 0 && <div className="rounded-2xl border border-slate-200 bg-white py-10 text-center text-slate-400">{t('academic.noGradingSchemes')}</div>}
        {schemes.map(s => (
          <div key={s._id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{s.name}</h3>
                <p className="text-sm text-slate-500">{s.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(s)} className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">{t('common.edit')}</button>
                <button onClick={() => handleDelete(s._id)} className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">{t('common.delete')}</button>
              </div>
            </div>
            {s.grades && s.grades.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {s.grades.map((g, i) => (
                  <span key={i} className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">{g.grade}: {t('academic.gradeChip', { min: g.minMarks, max: g.maxMarks })}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminGrading;
