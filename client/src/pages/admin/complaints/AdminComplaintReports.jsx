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
import { FiEye, FiDownload, FiBarChart, FiPieChart, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const PAGE_SIZE = 10;

const statusBadgeColor = { pending: 'yellow', 'in-progress': 'blue', resolved: 'green' };
const priorityBadgeColor = { high: 'red', medium: 'yellow', low: 'green' };

const AdminComplaintReports = () => {
  const { t } = useTranslation('admin');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => { const lang = readStoredLanguage('adminLang', 'en'); if (i18n.language !== lang) i18n.changeLanguage(lang); }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get('/complaints');
      setComplaints(Array.isArray(res) ? res : res.data || []);
    } catch { setComplaints([]); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [searchTerm]);

  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return complaints.filter(c =>
      !s || (c.subject || c.title || '').toLowerCase().includes(s) ||
      (c.submittedBy?.name || c.userId?.name || '').toLowerCase().includes(s)
    );
  }, [complaints, searchTerm]);

  const stats = useMemo(() => {
    const pending = complaints.filter(c => c.status === 'pending').length;
    const inProgress = complaints.filter(c => c.status === 'in-progress').length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    const byCategory = {};
    complaints.forEach(c => { const cat = c.category || t('common.other'); byCategory[cat] = (byCategory[cat] || 0) + 1; });
    const byPriority = { high: 0, medium: 0, low: 0 };
    complaints.forEach(c => { if (byPriority[c.priority] !== undefined) byPriority[c.priority]++; });
    return { pending, inProgress, resolved, total: complaints.length, byCategory, byPriority };
  }, [complaints]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCSV = () => {
    const header = [t('common.id'), t('complaints.subject'), t('common.status'), t('common.category'), t('complaints.priority'), t('common.date'), t('users.student')].join(',');
    const rows = complaints.map(c => [
      c.complaintCode || c._id,
      (c.subject || '').replace(/,/g, ''),
      c.status, c.category, c.priority,
      c.createdAt?.slice(0, 10),
      (c.submittedBy?.name || '').replace(/,/g, '')
    ].join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'complaints_report.csv';
    a.click();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  const columns = [
    { key: 'complaintCode', label: t('common.id'), render: (val, row) => <span className="text-xs font-medium text-slate-500">#{val || row._id?.slice(-6)}</span> },
    { key: 'subject', label: t('complaints.subject'), render: (val) => <span className="font-medium text-slate-800">{val || '-'}</span> },
    { key: 'status', label: t('common.status'), render: (val) => <Badge color={statusBadgeColor[val]}>{t('common.' + val?.toLowerCase()) || val || '-'}</Badge> },
    { key: 'category', label: t('common.category'), render: (val) => <Badge color="gray">{t('complaints.' + val?.toLowerCase()) || val || '-'}</Badge> },
    { key: 'priority', label: t('complaints.priority'), render: (val) => <Badge color={priorityBadgeColor[val]}>{t('common.' + val?.toLowerCase()) || val || '-'}</Badge> },
    { key: 'createdAt', label: t('common.date'), render: (val) => <span className="text-xs text-slate-500">{val ? new Date(val).toLocaleDateString() : '-'}</span> },
    {
      key: 'actions', label: t('common.actions'), render: (_, row) => (
        <button onClick={() => setSelectedComplaint(row)} className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-200" title={t('common.view')}><FiEye size={16} /></button>
      )
    },
  ];

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('complaints.complaintReports')}</h1>
          <p className="text-gray-600 mt-1">{t('complaints.complaintAnalytics')}</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition-all shadow-md">
          <FiDownload size={15} /> {t('complaints.exportCSV')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 p-5 text-white shadow-lg">
          <div className="relative z-10"><p className="text-sm font-medium text-white/80">{t('complaints.totalComplaints')}</p><p className="mt-1 text-2xl font-bold">{stats.total}</p></div>
          <FiBarChart className="absolute right-3 top-3 h-12 w-12 text-white/10" />
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 p-5 text-white shadow-lg">
          <div className="relative z-10"><p className="text-sm font-medium text-white/80">{t('common.pending')}</p><p className="mt-1 text-2xl font-bold">{stats.pending}</p></div>
          <FiClock className="absolute right-3 top-3 h-12 w-12 text-white/10" />
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white shadow-lg">
          <div className="relative z-10"><p className="text-sm font-medium text-white/80">{t('complaints.inProgress')}</p><p className="mt-1 text-2xl font-bold">{stats.inProgress}</p></div>
          <FiAlertCircle className="absolute right-3 top-3 h-12 w-12 text-white/10" />
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-5 text-white shadow-lg">
          <div className="relative z-10"><p className="text-sm font-medium text-white/80">{t('common.resolved')}</p><p className="mt-1 text-2xl font-bold">{stats.resolved}</p></div>
          <FiCheckCircle className="absolute right-3 top-3 h-12 w-12 text-white/10" />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm mb-6">
        <Search value={searchTerm} onChange={setSearchTerm} placeholder={t('complaints.searchComplaints')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><FiPieChart size={15} /> {t('complaints.complaintsByCategory')}</h3>
          {Object.entries(stats.byCategory).length === 0 && <p className="text-sm text-slate-400">{t('complaints.noData')}</p>}
          {Object.entries(stats.byCategory).map(([cat, count]) => (
            <div key={cat} className="mb-2">
              <div className="flex justify-between text-xs text-slate-600 mb-1"><span>{t('complaints.' + cat?.toLowerCase()) || cat}</span><span>{count}</span></div>
              <div className="h-2.5 rounded-full bg-slate-100">
                <div className="h-2.5 rounded-full bg-gradient-to-r from-blue-400 to-blue-600" style={{ width: `${(count / (stats.total || 1)) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><FiBarChart size={15} /> {t('complaints.byPriority')}</h3>
          {Object.entries(stats.byPriority).filter(([, v]) => v > 0).length === 0 && <p className="text-sm text-slate-400">{t('complaints.noData')}</p>}
          {Object.entries(stats.byPriority).filter(([, v]) => v > 0).map(([pri, count]) => (
            <div key={pri} className="mb-2">
              <div className="flex justify-between text-xs text-slate-600 mb-1"><span className="capitalize">{t('common.' + pri?.toLowerCase()) || pri}</span><span>{count}</span></div>
              <div className="h-2.5 rounded-full bg-slate-100">
                <div className={`h-2.5 rounded-full ${pri === 'high' ? 'bg-gradient-to-r from-red-400 to-red-600' : pri === 'medium' ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'}`} style={{ width: `${(count / (stats.total || 1)) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <h3 className="px-5 py-4 text-sm font-semibold text-slate-700 border-b border-slate-100 flex items-center gap-2"><FiBarChart size={15} /> {t('complaints.detailTable')}</h3>
        <Table columns={columns} data={paginated} emptyMessage={t('complaints.noComplaints')} />
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      <ComplaintDetailModal complaint={selectedComplaint} isOpen={!!selectedComplaint} onClose={() => setSelectedComplaint(null)} onRefresh={fetchData} />
    </div>
  );
};

export default AdminComplaintReports;
