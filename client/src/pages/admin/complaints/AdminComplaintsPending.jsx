import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';
import { LoadingSpinner } from '../../../components/UIHelper/Loading';
import Badge from '../../../components/UIHelper/Badge';
import Table from '../../../components/UIHelper/Table';
import Search from '../../../components/UIHelper/Search';
import Pagination from '../../../components/UIHelper/Pagination';
import ComplaintDetailModal from './ComplaintDetailModal';
import { FiEye, FiClock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const PAGE_SIZE = 10;

const AdminComplaintsPending = () => {
  const { t } = useTranslation('admin');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const categories = ['all', 'Academic', 'Discipline', 'Facilities', 'Hostel', 'Kitchen', 'Finance', 'Library', 'Other'];

  useEffect(() => { const lang = readStoredLanguage('adminLang', 'en'); if (i18n.language !== lang) i18n.changeLanguage(lang); }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get('/complaints?status=pending');
      setComplaints(Array.isArray(res) ? res : res.data || []);
    } catch { setComplaints([]); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [searchTerm, categoryFilter]);

  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return complaints.filter(c => {
      if (s && !(c.subject || c.title || '').toLowerCase().includes(s) && !(c.submittedBy?.name || c.userId?.name || '').toLowerCase().includes(s)) return false;
      if (categoryFilter !== 'all' && (c.category || '').toLowerCase() !== categoryFilter.toLowerCase()) return false;
      return true;
    });
  }, [complaints, searchTerm, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const highCount = complaints.filter(c => c.priority === 'high').length;
  const mediumCount = complaints.filter(c => c.priority === 'medium').length;
  const lowCount = complaints.filter(c => c.priority === 'low').length;

  const handleAssign = async (id) => {
    try { await api.put(`/complaints/${id}`, { status: 'in-progress' }); fetchData(); } catch (err) { console.error(err); }
  };
  const handleResolve = async (id) => {
    try { await api.put(`/complaints/${id}`, { status: 'resolved' }); fetchData(); } catch (err) { console.error(err); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  const columns = [
    { key: 'subject', label: t('complaints.subject'), render: (val) => <span className="font-medium text-slate-800">{val || '-'}</span> },
    { key: 'submittedBy', label: t('complaints.submittedBy'), render: (val) => <span className="text-slate-600">{val?.name || '-'}</span> },
    { key: 'createdAt', label: t('common.date'), render: (val) => <span className="text-slate-600">{val ? new Date(val).toLocaleDateString() : '-'}</span> },
    { key: 'category', label: t('common.category'), render: (val) => <Badge color="gray">{val || t('complaints.other')}</Badge> },
    { key: 'priority', label: t('complaints.priority'), render: (val) => <Badge color={val === 'high' ? 'red' : val === 'medium' ? 'yellow' : 'green'}>{val || 'normal'}</Badge> },
    {
      key: 'actions', label: t('common.actions'), render: (_, row) => (
        <div className="flex gap-2 items-center">
          <button onClick={() => setSelectedComplaint(row)} className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-200" title={t('common.view')}><FiEye size={16} /></button>
          <button onClick={() => handleAssign(row._id)} className="rounded-lg bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700 hover:bg-cyan-100">{t('complaints.markInProgress')}</button>
          <button onClick={() => handleResolve(row._id)} className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100">{t('complaints.resolve')}</button>
        </div>
      )
    },
  ];

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('complaints.pendingComplaints')}</h1>
        <p className="text-gray-600 mt-1">{t('complaints.awaitingReview')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 p-5 text-white shadow-lg">
          <div className="relative z-10"><p className="text-sm font-medium text-white/80">{t('common.pending')}</p><p className="mt-1 text-2xl font-bold">{complaints.length}</p></div>
          <FiClock className="absolute right-3 top-3 h-12 w-12 text-white/10" />
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-red-600 p-5 text-white shadow-lg">
          <div className="relative z-10"><p className="text-sm font-medium text-white/80">{t('complaints.priority')} High</p><p className="mt-1 text-2xl font-bold">{highCount}</p></div>
          <FiAlertCircle className="absolute right-3 top-3 h-12 w-12 text-white/10" />
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-5 text-white shadow-lg">
          <div className="relative z-10"><p className="text-sm font-medium text-white/80">{t('complaints.priority')} Medium</p><p className="mt-1 text-2xl font-bold">{mediumCount}</p></div>
          <FiClock className="absolute right-3 top-3 h-12 w-12 text-white/10" />
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-5 text-white shadow-lg">
          <div className="relative z-10"><p className="text-sm font-medium text-white/80">{t('complaints.priority')} Low</p><p className="mt-1 text-2xl font-bold">{lowCount}</p></div>
          <FiCheckCircle className="absolute right-3 top-3 h-12 w-12 text-white/10" />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1"><Search value={searchTerm} onChange={setSearchTerm} placeholder={t('complaints.searchComplaints')} /></div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm">
            <option value="all">{t('complaints.allCategories')}</option>
            {categories.filter(c => c !== 'all').map(cat => (<option key={cat} value={cat.toLowerCase()}>{t('complaints.' + cat.toLowerCase())}</option>))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Table columns={columns} data={paginated} emptyMessage={t('complaints.noPending')} />
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      <ComplaintDetailModal complaint={selectedComplaint} isOpen={!!selectedComplaint} onClose={() => setSelectedComplaint(null)} onRefresh={fetchData} />
    </div>
  );
};

export default AdminComplaintsPending;
