import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';

const AdminDegrees = () => {
  const [degrees, setDegrees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', duration: '', level: '', department: '', description: '' });
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

  const fetchDegrees = async () => {
    try {
      const { data } = await api.get('/academic/degrees');
      setDegrees(Array.isArray(data) ? data : data.data || []);
    } catch {
      setDegrees([]);
    } finally { setLoading(false); }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/hr/departments');
      setDepartments(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch { setDepartments([]); }
  };

  useEffect(() => { fetchDegrees(); fetchDepartments(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: form.name, code: form.code, duration: form.duration, level: form.level, department: form.department || undefined, description: form.description };
      if (editingId) {
        await api.put(`/academic/degrees/${editingId}`, payload);
      } else {
        await api.post('/academic/degrees', payload);
      }
      setShowForm(false); setEditingId(null);
      setForm({ name: '', code: '', duration: '', level: '', department: '', description: '' });
      fetchDegrees();
    } catch (err) { const msg = err.response?.data?.message || err.message; alert(msg); console.error('Error saving degree:', msg); }
  };

  const handleEdit = (deg) => {
    setForm({ name: deg.name || '', code: deg.code || '', duration: deg.duration || '', level: deg.level || '', department: deg.department?._id || deg.department || '', description: deg.description || '' });
    setEditingId(deg._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('academic.deleteDegreeConfirm'))) return;
    try { await api.delete(`/academic/degrees/${id}`); fetchDegrees(); } catch (err) { console.error('Error deleting:', err); }
  };

  const getDeptName = (dept) => {
    if (!dept) return '-';
    if (typeof dept === 'object') return dept.departmentName || dept.name || '-';
    const found = departments.find(d => d._id === dept);
    return found ? found.departmentName || found.name : dept;
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">{t('common.loading')}</div>;

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6"><div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('academic.degreesManagement')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('academic.manageDegrees')}</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', code: '', duration: '', level: '', department: '', description: '' }); }} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700">
          {showForm ? t('common.cancel') : '+ ' + t('academic.addDegree')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('academic.degreeName')}</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('academic.code')}</label><input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('academic.duration')}</label><input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder={t('academic.durationPlaceholder')} /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('academic.level')}</label><select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="">{t('academic.select')}</option><option>{t('academic.secondary')}</option><option>{t('academic.higherSecondary')}</option><option>{t('academic.bachelor')}</option><option>{t('academic.master')}</option><option>{t('academic.phd')}</option><option>{t('academic.diploma')}</option><option>{t('academic.certificate')}</option></select></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">{t('academic.department')}</label><select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="">{t('academic.select')}</option>{departments.map(d => <option key={d._id} value={d._id}>{d.departmentName}</option>)}</select></div>
            <div className="md:col-span-3"><label className="mb-1 block text-sm font-medium text-slate-700">{t('academic.description')}</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" rows={2} /></div>
          </div>
          <button type="submit" className="mt-4 rounded-lg bg-cyan-600 px-6 py-2 text-sm font-medium text-white hover:bg-cyan-700">{editingId ? t('academic.updateDegree') : t('academic.createDegree')}</button>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="px-5 py-3 font-semibold text-slate-600">{t('academic.degreeName')}</th><th className="px-5 py-3 font-semibold text-slate-600">{t('academic.code')}</th><th className="px-5 py-3 font-semibold text-slate-600">{t('academic.duration')}</th><th className="px-5 py-3 font-semibold text-slate-600">{t('academic.level')}</th><th className="px-5 py-3 font-semibold text-slate-600">{t('academic.department')}</th><th className="px-5 py-3 font-semibold text-slate-600">{t('academic.description')}</th><th className="px-5 py-3 font-semibold text-slate-600">{t('academic.createdAt')}</th><th className="px-5 py-3 font-semibold text-slate-600">{t('academic.actions')}</th></tr></thead>
          <tbody>
            {degrees.length === 0 && <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-400">{t('academic.noDegrees')}</td></tr>}
            {degrees.map(d => (
              <tr key={d._id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{d.name}</td>
                <td className="px-5 py-3 text-slate-600">{d.code || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{d.duration || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{d.level || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{getDeptName(d.department)}</td>
                <td className="max-w-[200px] truncate px-5 py-3 text-slate-600" title={d.description}>{d.description || '-'}</td>
                <td className="whitespace-nowrap px-5 py-3 text-slate-600">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '-'}</td>
                <td className="px-5 py-3"><div className="flex gap-2"><button onClick={() => handleEdit(d)} className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">{t('common.edit')}</button><button onClick={() => handleDelete(d._id)} className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">{t('common.delete')}</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};

export default AdminDegrees;
