import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';
import Card from '../../../components/UIHelper/Card';
import { FiCalendar, FiBook, FiUsers, FiClipboard, FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi';
import CalendarDatePicker from "../../../components/UIHelper/CalendarDatePicker";

const AdminExams = () => {
  const [exams, setExams] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '', examType: '', class: '', academicYear: '', duration: 60, totalMarks: 100, startDate: '', endDate: '', status: 'draft'
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

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [examsRes, typesRes, classesRes] = await Promise.all([
        api.get('/academic/exams'),
        api.get('/academic/examtypes'),
        api.get('/academic/classes')
      ]);
      const e = examsRes.data; setExams(Array.isArray(e) ? e : e.data || []);
      const t = typesRes.data; setExamTypes(Array.isArray(t) ? t : t.data || []);
      const c = classesRes.data; setClasses(Array.isArray(c) ? c : c.data || []);
    } catch {
      setExams([]); setExamTypes([]); setClasses([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const examTypeName = exam.examType?.name || '';
    const matchesType = typeFilter === 'all' || examTypeName === typeFilter || (exam.examType && exam.examType._id === typeFilter);
    const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const examCounts = {
    draft: exams.filter(e => e.status === 'draft').length,
    published: exams.filter(e => e.status === 'published').length,
    ongoing: exams.filter(e => e.status === 'ongoing').length,
    finished: exams.filter(e => e.status === 'finished').length,
    cancelled: exams.filter(e => e.status === 'cancelled').length,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        academicYear: form.academicYear,
        duration: parseInt(form.duration) || 60,
        totalMarks: parseInt(form.totalMarks) || 0,
        status: form.status
      };
      if (form.examType) payload.examType = form.examType;
      if (form.class) payload.class = form.class;
      if (form.startDate) payload.startDate = form.startDate;
      if (form.endDate) payload.endDate = form.endDate;

      if (editingId) {
        await api.put(`/academic/exams/${editingId}`, payload);
      } else {
        await api.post('/academic/exams', payload);
      }
      setShowAddModal(false); setEditingId(null);
      setForm({ title: '', examType: '', class: '', academicYear: '', duration: 60, totalMarks: 100, startDate: '', endDate: '', status: 'draft' });
      fetchAll();
    } catch (err) { console.error('Error saving exam:', err); }
  };

  const handleEdit = (exam) => {
    setForm({
      title: exam.title || '',
      examType: exam.examType?._id || '',
      class: exam.class?._id || '',
      academicYear: exam.academicYear || '',
      duration: exam.duration || 60,
      totalMarks: exam.totalMarks || 0,
      startDate: exam.startDate ? (typeof exam.startDate === 'string' ? exam.startDate.slice(0, 10) : new Date(exam.startDate).toISOString().slice(0, 10)) : '',
      endDate: exam.endDate ? (typeof exam.endDate === 'string' ? exam.endDate.slice(0, 10) : new Date(exam.endDate).toISOString().slice(0, 10)) : '',
      status: exam.status || 'draft'
    });
    setEditingId(exam._id); setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('academic.deleteExamConfirm'))) return;
    try { await api.delete(`/academic/exams/${id}`); fetchAll(); } catch (err) { console.error(err); }
  };

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-yellow-100 text-yellow-800',
    finished: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const typeColors = {
    Midterm: 'bg-purple-100 text-purple-800',
    Final: 'bg-red-100 text-red-800',
    Quiz: 'bg-orange-100 text-orange-800',
    Monthly: 'bg-green-100 text-green-800',
    Practical: 'bg-teal-100 text-teal-800',
    Revision: 'bg-indigo-100 text-indigo-800'
  };

  const getStatusBadge = (status) => (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {t('academic.' + status)}
    </span>
  );

  const getTypeBadge = (name) => (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${typeColors[name] || 'bg-gray-100 text-gray-800'}`}>
      {name}
    </span>
  );

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">{t('common.loading')}</div>;

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('academic.examsManagement')}</h1>
          <p className="text-gray-600 mt-1">{t('academic.manageExams')}</p>
        </div>
        <button
          onClick={() => { setShowAddModal(true); setEditingId(null); setForm({ title: '', examType: '', class: '', academicYear: '', duration: 60, totalMarks: 100, startDate: '', endDate: '', status: 'draft' }); }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg"
        >
          <FiPlus size={18} /> {t('academic.scheduleNewExam')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">{t('academic.totalExams')}</p>
              <p className="text-2xl font-bold">{exams.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiClipboard size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">{t('academic.draft')}</p>
              <p className="text-2xl font-bold">{examCounts.draft}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiBook size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">{t('academic.published')}</p>
              <p className="text-2xl font-bold">{examCounts.published}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiBook size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">{t('academic.ongoing')}</p>
              <p className="text-2xl font-bold">{examCounts.ongoing}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiCalendar size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">{t('academic.finished')}</p>
              <p className="text-2xl font-bold">{examCounts.finished}</p>
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
              placeholder={t('academic.searchExam')}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">{t('academic.allTypes')}</option>
                {examTypes.map(et => (
                  <option key={et._id} value={et._id}>{et.name}</option>
                ))}
              </select>
            </div>
            <select
              className="px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">{t('academic.allStatus')}</option>
              {['draft', 'published', 'ongoing', 'finished', 'cancelled'].map(s => (
                <option key={s} value={s}>{t('academic.' + s)}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.map(exam => (
          <div key={exam._id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{exam.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {exam.examType?.name && getTypeBadge(exam.examType.name)}
                  {getStatusBadge(exam.status)}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(exam)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                  <FiEdit2 size={18} />
                </button>
                <button onClick={() => handleDelete(exam._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{t('academic.class')}:</span>
                <span className="font-medium text-gray-900">{exam.class?.name || '-'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{t('academic.date')}:</span>
                <span className="font-medium text-gray-900">
                  {exam.startDate
                    ? new Date(exam.startDate).toLocaleDateString(i18n.language === 'ps' ? 'ps-AF' : i18n.language === 'prs' ? 'prs-AF' : 'en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })
                    : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{t('academic.duration')}:</span>
                <span className="font-medium text-gray-900">{exam.duration || '-'} min</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{t('academic.totalMarks')}:</span>
                <span className="font-medium text-gray-900">{exam.totalMarks || '-'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{t('academic.year')}:</span>
                <span className="font-medium text-gray-900">{exam.academicYear || '-'}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiCalendar size={16} />
                <span>{t('common.createdAt')}: {exam.createdAt ? new Date(exam.createdAt).toLocaleDateString() : '-'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingId ? t('common.edit') : t('academic.scheduleNewExam')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('academic.examName')} *</label>
                <input
                  type="text" required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  placeholder={t('academic.examNamePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('academic.examType')}</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={form.examType}
                  onChange={(e) => setForm({...form, examType: e.target.value})}
                >
                  <option value="">{t('academic.selectType')}</option>
                  {examTypes.map(et => (
                    <option key={et._id} value={et._id}>{et.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('academic.class')}</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={form.class}
                  onChange={(e) => setForm({...form, class: e.target.value})}
                >
                  <option value="">{t('academic.selectClass')}</option>
                  {classes.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('academic.year')}</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={form.academicYear}
                  onChange={(e) => setForm({...form, academicYear: e.target.value})}
                  placeholder={t('settings.academicYearPlaceholder')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('academic.duration')} (min)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    value={form.duration}
                    onChange={(e) => setForm({...form, duration: e.target.value})}
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('academic.totalMarks')}</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    value={form.totalMarks}
                    onChange={(e) => setForm({...form, totalMarks: e.target.value})}
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('academic.startDate')}</label>
                  <CalendarDatePicker value={form.startDate} onChange={(date) => setForm({...form, startDate: date })} placeholder={t('academic.selectDate')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('academic.endDate')}</label>
                  <CalendarDatePicker value={form.endDate} onChange={(date) => setForm({...form, endDate: date })} placeholder={t('academic.selectDate')} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('academic.status')}</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={form.status}
                  onChange={(e) => setForm({...form, status: e.target.value})}
                >
                  {['draft', 'published', 'ongoing', 'finished', 'cancelled'].map(s => (
                    <option key={s} value={s}>{t('academic.' + s)}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-semibold">
                  {editingId ? t('common.update') : t('academic.scheduleExam')}
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

export default AdminExams;
