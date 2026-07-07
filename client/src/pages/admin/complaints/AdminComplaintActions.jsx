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
import { FiEye, FiSend, FiClock, FiAlertCircle, FiCheckCircle, FiMessageSquare } from 'react-icons/fi';

const PAGE_SIZE = 10;

const statusBadgeColor = { pending: 'yellow', 'in-progress': 'blue' };

const AdminComplaintActions = () => {
  const { t } = useTranslation('admin');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [viewComplaint, setViewComplaint] = useState(null);
  const [actionComplaint, setActionComplaint] = useState(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = ['all', 'Academic', 'Discipline', 'Facilities', 'Hostel', 'Kitchen', 'Finance', 'Library', 'Other'];

  useEffect(() => { const lang = readStoredLanguage('adminLang', 'en'); if (i18n.language !== lang) i18n.changeLanguage(lang); }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get('/complaints');
      const list = Array.isArray(res) ? res : res.data || [];
      setComplaints(list.filter(c => c.status !== 'resolved'));
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
  const highCount = complaints.filter(c => c.priority === 'high').length;

  const handleSubmitAction = async () => {
    if (!actionComplaint || !note.trim()) return;
    setSubmitting(true);
    try {
      await api.put(`/complaints/${actionComplaint._id}`, { adminNotes: note, status: 'in-progress' });
      setNote('');
      setActionComplaint(null);
      fetchData();
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  const handleResolve = async (id) => {
    try { await api.put(`/complaints/${id}`, { status: 'resolved' }); fetchData(); } catch (err) { console.error(err); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  const columns = [
    { key: 'subject', label: t('complaints.subject'), render: (val) => <span className="font-medium text-slate-800">{val || '-'}</span> },
    { key: 'submittedBy', label: t('complaints.submittedBy'), render: (val) => <span className="text-slate-600">{val?.name || '-'}</span> },
    { key: 'category', label: t('common.category'), render: (val) => <Badge color="gray">{val || t('complaints.other')}</Badge> },
    { key: 'priority', label: t('complaints.priority'), render: (val) => <Badge color={val === 'high' ? 'red' : val === 'medium' ? 'yellow' : 'green'}>{val || 'normal'}</Badge> },
    { key: 'status', label: t('common.status'), render: (val) => <Badge color={statusBadgeColor[val]}>{val}</Badge> },
    {
      key: 'actions', label: t('common.actions'), render: (_, row) => (
        <div className="flex gap-2 items-center">
          <button onClick={() => setViewComplaint(row)} className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-200" title={t('common.view')}><FiEye size={16} /></button>
          <button onClick={() => { setActionComplaint(row); setNote(''); }} className="rounded-lg bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 hover:bg-violet-100">{t('complaints.action')}</button>
          <button onClick={() => handleResolve(row._id)} className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100">{t('complaints.resolve')}</button>
        </div>
      )
    },
  ];

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('complaints.takeActions')}</h1>
        <p className="text-gray-600 mt-1">{t('complaints.processComplaints')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-500 to-slate-600 p-5 text-white shadow-lg">
          <div className="relative z-10"><p className="text-sm font-medium text-white/80">{t('complaints.totalComplaints')}</p><p className="mt-1 text-2xl font-bold">{complaints.length}</p></div>
          <FiMessageSquare className="absolute right-3 top-3 h-12 w-12 text-white/10" />
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 p-5 text-white shadow-lg">
          <div className="relative z-10"><p className="text-sm font-medium text-white/80">{t('common.pending')}</p><p className="mt-1 text-2xl font-bold">{pendingCount}</p></div>
          <FiClock className="absolute right-3 top-3 h-12 w-12 text-white/10" />
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white shadow-lg">
          <div className="relative z-10"><p className="text-sm font-medium text-white/80">{t('complaints.inProgress')}</p><p className="mt-1 text-2xl font-bold">{inProgressCount}</p></div>
          <FiAlertCircle className="absolute right-3 top-3 h-12 w-12 text-white/10" />
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-red-600 p-5 text-white shadow-lg">
          <div className="relative z-10"><p className="text-sm font-medium text-white/80">{t('complaints.priority')} High</p><p className="mt-1 text-2xl font-bold">{highCount}</p></div>
          <FiCheckCircle className="absolute right-3 top-3 h-12 w-12 text-white/10" />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1"><Search value={searchTerm} onChange={setSearchTerm} placeholder={t('complaints.searchComplaints')} /></div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm">
            <option value="all">{t('common.allStatus')}</option>
            <option value="pending">{t('common.pending')}</option>
            <option value="in-progress">{t('complaints.inProgress')}</option>
          </select>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm">
            <option value="all">{t('complaints.allCategories')}</option>
            {categories.filter(c => c !== 'all').map(cat => (<option key={cat} value={cat.toLowerCase()}>{t('complaints.' + cat.toLowerCase())}</option>))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Table columns={columns} data={paginated} emptyMessage={t('complaints.noActions')} />
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {actionComplaint && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-800 mb-3">{t('complaints.actionNotes')}</h3>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm"
            placeholder={t('complaints.enterActionDetails')} />
          <div className="mt-3 flex gap-3">
            <button onClick={handleSubmitAction} disabled={submitting || !note.trim()}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-all">
              <FiSend size={15} /> {t('complaints.submitAction')}
            </button>
            <button onClick={() => { setActionComplaint(null); setNote(''); }}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">{t('common.cancel')}</button>
          </div>
        </div>
      )}

      <ComplaintDetailModal complaint={viewComplaint} isOpen={!!viewComplaint} onClose={() => { setViewComplaint(null); }} onRefresh={fetchData} />
    </div>
  );
};

export default AdminComplaintActions;
