import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';
import Card from '../../../components/UIHelper/Card';
import { FiUsers, FiBook, FiCalendar, FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

const AdminClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '', code: '', type: 'mixed', maxStudents: '', status: 'active'
  });

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

  const fetchClasses = async () => {
    try {
      const { data } = await api.get('/academic/classes');
      setClasses(Array.isArray(data) ? data : data.data || []);
    } catch {
      setClasses([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchClasses(); }, []);

  const filteredClasses = classes.filter(cls =>
    cls.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (payload.maxStudents) payload.maxStudents = parseInt(payload.maxStudents);
      if (editingId) {
        await api.put(`/academic/classes/${editingId}`, payload);
      } else {
        await api.post('/academic/classes', payload);
      }
      setShowAddModal(false); setEditingId(null);
      setForm({ name: '', code: '', type: 'mixed', maxStudents: '', status: 'active' });
      fetchClasses();
    } catch (err) { console.error('Error saving class:', err); }
  };

  const handleEdit = (cls) => {
    setForm({
      name: cls.name || '', code: cls.code || '', type: cls.type || 'mixed',
      maxStudents: cls.maxStudents?.toString() || '', status: cls.status || 'active'
    });
    setEditingId(cls._id); setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('academic.deleteClassConfirm'))) return;
    try { await api.delete(`/academic/classes/${id}`); fetchClasses(); } catch (err) { console.error(err); }
  };

  const typeColors = { boys: 'bg-blue-100 text-blue-800', girls: 'bg-pink-100 text-pink-800', mixed: 'bg-purple-100 text-purple-800' };
  const statusColors = { active: 'bg-green-100 text-green-800', inactive: 'bg-gray-100 text-gray-800' };

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">{t('common.loading')}</div>;

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('academic.classManagement')}</h1>
          <p className="text-gray-600 mt-1">{t('academic.manageClasses')}</p>
        </div>
        <button
          onClick={() => { setShowAddModal(true); setEditingId(null); setForm({ name: '', code: '', type: 'mixed', maxStudents: '', status: 'active' }); }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg"
        >
          <FiPlus size={18} /> {t('academic.addNewClass')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">{t('academic.totalClasses')}</p>
              <p className="text-2xl font-bold">{classes.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiBook size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">{t('common.active')}</p>
              <p className="text-2xl font-bold">{classes.filter(c => c.status === 'active').length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiUsers size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">{t('common.inactive')}</p>
              <p className="text-2xl font-bold">{classes.filter(c => c.status === 'inactive').length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiUsers size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">{t('academic.totalStudents')}</p>
              <p className="text-2xl font-bold">{classes.reduce((sum, c) => sum + (c.maxStudents || 0), 0)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiUsers size={24} />
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
              placeholder={t('academic.searchClass')}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map(cls => (
          <div key={cls._id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{cls.name}</h3>
                {cls.code && <p className="text-gray-500 text-sm">{t('academic.code')}: {cls.code}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(cls)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                  <FiEdit2 size={18} />
                </button>
                <button onClick={() => handleDelete(cls._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
            <div className="flex gap-2 mb-4">
              {cls.type && (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${typeColors[cls.type] || 'bg-gray-100 text-gray-800'}`}>
                  {t('academic.' + cls.type)}
                </span>
              )}
              {cls.status && (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[cls.status] || 'bg-gray-100 text-gray-800'}`}>
                  {t('academic.' + cls.status)}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                  <FiUsers size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('academic.maximumStudents')}</p>
                  <p className="font-semibold text-gray-900">{cls.maxStudents || t('common.na') || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                  <FiCalendar size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('common.createdAt')}</p>
                  <p className="font-semibold text-gray-900 text-sm">
                    {cls.createdAt ? new Date(cls.createdAt).toLocaleDateString() : t('common.na') || '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingId ? t('common.edit') : t('academic.addNewClass')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('academic.className')} *</label>
                <input
                  type="text" required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  placeholder={t('academic.classNamePlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('academic.code')}</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={form.code}
                  onChange={(e) => setForm({...form, code: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.type')}</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={form.type}
                  onChange={(e) => setForm({...form, type: e.target.value})}
                >
                  <option value="mixed">{t('academic.mixed')}</option>
                  <option value="boys">{t('academic.boys')}</option>
                  <option value="girls">{t('academic.girls')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('academic.maximumStudents')}</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={form.maxStudents}
                  onChange={(e) => setForm({...form, maxStudents: e.target.value})}
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.status')}</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={form.status}
                  onChange={(e) => setForm({...form, status: e.target.value})}
                >
                  <option value="active">{t('academic.active')}</option>
                  <option value="inactive">{t('academic.inactive')}</option>
                </select>
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

export default AdminClasses;
