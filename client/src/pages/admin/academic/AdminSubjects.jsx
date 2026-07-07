import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';
import Card from '../../../components/UIHelper/Card';
import { FiBook, FiPlus, FiEdit2, FiTrash2, FiSearch, FiTag } from 'react-icons/fi';

const AdminSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', field: '' });

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

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get('/academic/subjects');
      setSubjects(Array.isArray(data) ? data : data.data || []);
    } catch {
      setSubjects([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchSubjects(); }, []);

  const filteredSubjects = subjects.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.field?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/academic/subjects/${editingId}`, form);
      } else {
        await api.post('/academic/subjects', form);
      }
      setShowAddModal(false); setEditingId(null);
      setForm({ name: '', field: '' });
      fetchSubjects();
    } catch (err) { console.error('Error saving subject:', err); }
  };

  const handleEdit = (s) => {
    setForm({ name: s.name || '', field: s.field || '' });
    setEditingId(s._id); setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('academic.deleteSubjectConfirm'))) return;
    try { await api.delete(`/academic/subjects/${id}`); fetchSubjects(); } catch (err) { console.error(err); }
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">{t('common.loading')}</div>;

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('academic.subjectsManagement')}</h1>
          <p className="text-gray-600 mt-1">{t('academic.manageSubjects')}</p>
        </div>
        <button
          onClick={() => { setShowAddModal(true); setEditingId(null); setForm({ name: '', field: '' }); }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg"
        >
          <FiPlus size={18} /> {t('academic.addNewSubject')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">{t('academic.totalSubjects')}</p>
              <p className="text-2xl font-bold">{subjects.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiBook size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">{t('academic.totalFields')}</p>
              <p className="text-2xl font-bold">{new Set(subjects.map(s => s.field).filter(Boolean)).size}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiTag size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">{t('common.createdAt')}</p>
              <p className="text-2xl font-bold text-sm">
                {subjects.length > 0
                  ? new Date(Math.max(...subjects.map(s => new Date(s.createdAt))))?.toLocaleDateString()
                  : '-'}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiBook size={24} />
            </div>
          </div>
        </Card>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('academic.searchSubjects')}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map(s => (
          <div key={s._id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{s.name}</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(s)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                  <FiEdit2 size={18} />
                </button>
                <button onClick={() => handleDelete(s._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{t('academic.field')}:</span>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {s.field || '-'}
                </span>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiBook size={16} />
                <span>{t('common.createdAt')}: {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '-'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingId ? t('common.edit') : t('academic.addNewSubject')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('academic.subjectName')} *</label>
                <input
                  type="text" required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  placeholder={t('academic.subjectNamePlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('academic.field')}</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={form.field}
                  onChange={(e) => setForm({...form, field: e.target.value})}
                  placeholder={t('academic.fieldPlaceholder')}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-semibold">
                  {editingId ? t('common.update') : t('common.add')}
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 font-semibold">
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubjects;
