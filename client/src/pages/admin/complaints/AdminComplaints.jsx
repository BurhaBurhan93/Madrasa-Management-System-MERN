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
import { FiEye, FiMessageSquare } from 'react-icons/fi';

const PAGE_SIZE = 10;

const statusBadgeColor = { pending: 'yellow', 'in-progress': 'blue', resolved: 'green' };
const priorityBadgeColor = { high: 'red', medium: 'yellow', low: 'green' };

const AdminComplaints = () => {
  const { t } = useTranslation('admin');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const categories = ['all', 'catAcademic', 'catDiscipline', 'catFacilities', 'catHostel', 'catKitchen', 'catFinance', 'catLibrary', 'catOther'];

  useEffect(() => { const lang = readStoredLanguage('adminLang', 'en'); if (i18n.language !== lang) i18n.changeLanguage(lang); }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get('/complaints');
      setComplaints(Array.isArray(res) ? res : res.data || []);
    } catch { setComplaints([]); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [searchTerm, statusFilter, categoryFilter]);

  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return complaints.filter(c => {
      if (s && !(c.subject || c.title || '').toLowerCase().includes(s) && !(c.submittedBy?.name || c.userId?.name || '').toLowerCase().includes(s)) return false;
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && (c.category || '').toLowerCase() !== categoryFilter.toLowerCase()) return false;
      return true;
    });
  }, [complaints, searchTerm, statusFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'in-progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;

  const handleStatusChange = async (id, newStatus) => {
    try { await api.put(`/complaints/${id}`, { status: newStatus }); fetchData(); } catch (err) { console.error(err); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  const columns = [
    { key: 'complaintCode', label: t('common.id'), render: (val, row) => <span className="text-xs font-medium text-slate-500">{t('common.hash')}{val || row._id?.slice(-6)}</span> },
    { key: 'subject', label: t('complaints.complaintTitle'), render: (val) => <span className="font-medium text-slate-800">{val || '-'}</span> },
    { key: 'category', label: t('common.category'), render: (val) => <Badge color="gray">{val || t('complaints.other')}</Badge> },
    { key: 'submittedBy', label: t('complaints.complaintStudent'), render: (val) => <span className="text-slate-600">{val?.name || '-'}</span> },
    { key: 'createdAt', label: t('common.date'), render: (val) => <span className="text-xs text-slate-500">{val ? new Date(val).toLocaleDateString() : '-'}</span> },
    { key: 'priority', label: t('complaints.priority'), render: (val) => <Badge color={priorityBadgeColor[val]}>{val || '-'}</Badge> },
    {
      key: 'status', label: t('common.status'), render: (val, row) => (
        <select value={val} onChange={e => handleStatusChange(row._id, e.target.value)}
          className={`text-xs font-semibold rounded-full px-2 py-1 border-0 focus:ring-0 ${val === 'pending' ? 'bg-yellow-100 text-yellow-800' : val === 'in-progress' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
          <option value="pending">{t('common.pending')}</option>
          <option value="in-progress">{t('complaints.inProgress')}</option>
          <option value="resolved">{t('common.resolved')}</option>
        </select>
      )
    },
    {
      key: 'actions', label: t('common.actions'), render: (_, row) => (
        <div className="flex gap-1.5 whitespace-nowrap" style={{ minWidth: 80 }}>
          <button onClick={() => setSelectedComplaint(row)} className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-200" title={t('common.view')}>
            <FiEye size={16} />
          </button>
          <button onClick={() => setSelectedComplaint(row)} className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-all border border-transparent hover:border-green-200" title={t('complaints.actionNotes')}>
            <FiMessageSquare size={16} />
          </button>
        </div>
      )
    },
  ];

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('complaints.complaintsManagement')}</h1>
          <p className="text-gray-600 mt-1">{t('complaints.manageComplaints')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 p-5 text-white shadow-lg">
          <div className="relative z-10"><p className="text-sm font-medium text-white/80">{t('common.pending')}</p><p className="mt-1 text-2xl font-bold">{pendingCount}</p></div>
          <FiMessageSquare className="absolute right-3 top-3 h-12 w-12 text-white/10" />
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white shadow-lg">
          <div className="relative z-10"><p className="text-sm font-medium text-white/80">{t('complaints.inProgress')}</p><p className="mt-1 text-2xl font-bold">{inProgressCount}</p></div>
          <FiEye className="absolute right-3 top-3 h-12 w-12 text-white/10" />
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-5 text-white shadow-lg">
          <div className="relative z-10"><p className="text-sm font-medium text-white/80">{t('common.resolved')}</p><p className="mt-1 text-2xl font-bold">{resolvedCount}</p></div>
          <FiEye className="absolute right-3 top-3 h-12 w-12 text-white/10" />
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-5 text-white shadow-lg">
          <div className="relative z-10"><p className="text-sm font-medium text-white/80">{t('complaints.totalComplaints')}</p><p className="mt-1 text-2xl font-bold">{complaints.length}</p></div>
          <FiEye className="absolute right-3 top-3 h-12 w-12 text-white/10" />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Search value={searchTerm} onChange={setSearchTerm} placeholder={t('complaints.searchComplaints')} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm">
            <option value="all">{t('common.allStatus')}</option>
            <option value="pending">{t('common.pending')}</option>
            <option value="in-progress">{t('complaints.inProgress')}</option>
            <option value="resolved">{t('common.resolved')}</option>
          </select>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm">
            <option value="all">{t('complaints.allCategories')}</option>
            {categories.filter(c => c !== 'all').map(cat => (
              <option key={cat} value={cat.replace('cat', '').toLowerCase()}>{t('complaints.' + cat)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Table columns={columns} data={paginated} emptyMessage={t('complaints.noComplaints')} />
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ComplaintDetailModal complaint={selectedComplaint} isOpen={!!selectedComplaint} onClose={() => setSelectedComplaint(null)} onRefresh={fetchData} />
    </div>
  );
};

export default AdminComplaints;
