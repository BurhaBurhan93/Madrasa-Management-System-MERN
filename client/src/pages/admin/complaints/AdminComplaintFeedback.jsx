import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';
import { LoadingSpinner } from '../../../components/UIHelper/Loading';
import Table from '../../../components/UIHelper/Table';
import Search from '../../../components/UIHelper/Search';
import Pagination from '../../../components/UIHelper/Pagination';
import { FiStar, FiMessageSquare, FiSmile, FiMeh, FiFrown, FiFileText } from 'react-icons/fi';

const PAGE_SIZE = 10;

const StarRating = ({ level }) => {
  const n = typeof level === 'number' ? level : parseInt(level) || 0;
  return <div className="flex gap-0.5">{Array.from({ length: 5 }, (_, i) => <FiStar key={i} className={i < n ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} size={14} />)}</div>;
};

const AdminComplaintFeedback = () => {
  const { t } = useTranslation('admin');
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { const lang = readStoredLanguage('adminLang', 'en'); if (i18n.language !== lang) i18n.changeLanguage(lang); }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get('/complaints/feedback');
      setFeedbacks(Array.isArray(res) ? res : res.data || []);
    } catch { setFeedbacks([]); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [searchTerm]);

  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return feedbacks.filter(f =>
      !s ||
      (f.complaint?.subject || '').toLowerCase().includes(s) ||
      (f.feedbackBy?.name || '').toLowerCase().includes(s) ||
      (f.comments || '').toLowerCase().includes(s)
    );
  }, [feedbacks, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getSatisfactionIcon = (level) => {
    const n = typeof level === 'number' ? level : parseInt(level) || 0;
    if (n >= 4) return <FiSmile className="text-green-500" size={18} />;
    if (n >= 3) return <FiMeh className="text-amber-500" size={18} />;
    return <FiFrown className="text-red-500" size={18} />;
  };

  const stats = useMemo(() => {
    const total = feedbacks.length;
    const avg = total > 0 ? Math.round(feedbacks.reduce((s, f) => s + (parseInt(f.satisfactionLevel) || 0), 0) / total * 10) / 10 : 0;
    const satisfied = feedbacks.filter(f => (parseInt(f.satisfactionLevel) || 0) >= 4).length;
    const neutral = feedbacks.filter(f => { const n = parseInt(f.satisfactionLevel) || 0; return n >= 3 && n < 4; }).length;
    const unsatisfied = feedbacks.filter(f => (parseInt(f.satisfactionLevel) || 0) < 3).length;
    return { total, avg, satisfied, neutral, unsatisfied };
  }, [feedbacks]);

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  const columns = [
    { key: 'complaint', label: t('complaints.complaintTitle'), render: (val) => <span className="font-medium text-slate-800">{val?.subject || val?._id || '-'}</span> },
    { key: 'feedbackBy', label: t('complaints.feedbackBy'), render: (val) => <span className="text-slate-600">{val?.name || t('complaints.anonymous')}</span> },
    { key: 'satisfactionLevel', label: t('complaints.satisfaction'), render: (val) => <StarRating level={val} /> },
    { key: 'comments', label: t('complaints.comments'), render: (val) => <span className="text-slate-600 max-w-xs truncate block">{val || '-'}</span> },
    { key: 'adminNotes', label: t('complaints.actionNotes'), render: (val, row) => <span className="text-slate-600 max-w-xs truncate block">{row.complaint?.adminNotes || '-'}</span> },
    { key: 'feedbackDate', label: t('common.date'), render: (val) => <span className="text-xs text-slate-500">{val ? new Date(val).toLocaleDateString() : '-'}</span> },
  ];

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('complaints.complaintFeedback')}</h1>
        <p className="text-gray-600 mt-1">{t('complaints.feedbackDesc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-5 text-white shadow-lg">
          <div className="relative z-10"><p className="text-sm font-medium text-white/80">{t('complaints.totalComplaints')}</p><p className="mt-1 text-2xl font-bold">{stats.total}</p></div>
          <FiMessageSquare className="absolute right-3 top-3 h-12 w-12 text-white/10" />
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-5 text-white shadow-lg">
          <div className="relative z-10"><p className="text-sm font-medium text-white/80">{t('complaints.satisfaction')} Avg</p><p className="mt-1 text-2xl font-bold">{stats.avg}</p></div>
          <FiStar className="absolute right-3 top-3 h-12 w-12 text-white/10" />
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-5 text-white shadow-lg">
          <div className="relative z-10"><p className="text-sm font-medium text-white/80">{t('common.pending')} (4-5)</p><p className="mt-1 text-2xl font-bold">{stats.satisfied}</p></div>
          <FiSmile className="absolute right-3 top-3 h-12 w-12 text-white/10" />
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-red-600 p-5 text-white shadow-lg">
          <div className="relative z-10"><p className="text-sm font-medium text-white/80">{t('common.resolved')} (1-2)</p><p className="mt-1 text-2xl font-bold">{stats.unsatisfied}</p></div>
          <FiFrown className="absolute right-3 top-3 h-12 w-12 text-white/10" />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm mb-6">
        <Search value={searchTerm} onChange={setSearchTerm} placeholder={t('complaints.searchFeedback')} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Table columns={columns} data={paginated} emptyMessage={t('complaints.noFeedback')} />
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default AdminComplaintFeedback;
