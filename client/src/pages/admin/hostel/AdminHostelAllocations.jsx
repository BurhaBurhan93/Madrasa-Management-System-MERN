import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';
import { LoadingSpinner } from '../../../components/UIHelper/Loading';
import Pagination from '../../../components/UIHelper/Pagination';
import Modal from '../../../components/UIHelper/Modal';

const STATUSES = ['active', 'checked-out'];
const ALLOCATION_STATUSES = ['active', 'checked-out'];

const AdminHostelAllocations = () => {
  const { t } = useTranslation('admin');
  const commonT = useTranslation('common').t;

  useEffect(() => {
    const syncLang = () => {
      const lang = readStoredLanguage('adminLang', 'en');
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    };
    syncLang();
  }, []);

  const [allocations, setAllocations] = useState([]);
  const [allAllocations, setAllAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchAllocations = async (p, searchTerm, status) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 10 };
      if (searchTerm) params.search = searchTerm;
      if (status) params.status = status;
      const { data } = await api.get('/hostel/allocations', { params });
      setAllocations(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      setAllocations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAllocations = async () => {
    try {
      const { data } = await api.get('/hostel/allocations', { params: { limit: 200 } });
      setAllAllocations(data.data || []);
    } catch {}
  };

  useEffect(() => {
    fetchAllocations(page, '', '');
    fetchAllAllocations();
  }, []);

  const stats = (() => {
    const total = allAllocations.length;
    const active = allAllocations.filter(a => a.status === 'active').length;
    const checkedOut = allAllocations.filter(a => a.status === 'checked-out').length;
    return { total, active, checkedOut };
  })();

  const handleSearch = () => {
    setPage(1);
    fetchAllocations(1, search, statusFilter);
  };

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    setPage(1);
    fetchAllocations(1, search, val);
  };

  const handlePageChange = (p) => {
    setPage(p);
    fetchAllocations(p, search, statusFilter);
  };

  const handleCheckout = async (id) => {
    try {
      await api.put(`/hostel/allocations/${id}/checkout`);
      fetchAllocations(page, search, statusFilter);
      fetchAllAllocations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('hostel.removeAllocationConfirm'))) return;
    try {
      await api.delete(`/hostel/allocations/${id}`);
      fetchAllocations(page, search, statusFilter);
      fetchAllAllocations();
    } catch (err) {
      console.error(err);
    }
  };

  const statusBadge = (status) => {
    const map = {
      active: 'bg-emerald-50 text-emerald-700',
      'checked-out': 'bg-slate-100 text-slate-600'
    };
    return `rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] || 'bg-slate-50 text-slate-700'}`;
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '-';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('hostel.roomAllocations')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('hostel.allocateRooms')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: t('hostel.totalAllocations'), value: stats.total, color: 'text-slate-700 bg-slate-100' },
          { label: t('hostel.active'), value: stats.active, color: 'text-emerald-700 bg-emerald-50' },
          { label: t('hostel.checkedOut'), value: stats.checkedOut, color: 'text-slate-600 bg-slate-50' }
        ].map((card, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className={`mt-1 text-2xl font-bold ${card.color.split(' ')[0]}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder={t('hostel.searchAllocations')}
            className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100"
          />
        </div>
        <button onClick={handleSearch} className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700">{commonT('search')}</button>
        <select
          value={statusFilter}
          onChange={e => handleStatusChange(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100"
        >
          <option value="">{t('hostel.allStatus')}</option>
          {ALLOCATION_STATUSES.map(s => (
            <option key={s} value={s}>{t(`hostel.${s === 'checked-out' ? 'checkedOut' : s}`)}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="whitespace-nowrap px-5 py-3 font-semibold text-slate-600">{t('hostel.resident')}</th>
                <th className="whitespace-nowrap px-5 py-3 font-semibold text-slate-600">{t('hostel.room')}</th>
                <th className="whitespace-nowrap px-5 py-3 font-semibold text-slate-600">{t('hostel.block')}</th>
                <th className="whitespace-nowrap px-5 py-3 font-semibold text-slate-600">{t('hostel.checkInDate')}</th>
                <th className="whitespace-nowrap px-5 py-3 font-semibold text-slate-600">{t('common.status')}</th>
                <th className="whitespace-nowrap px-5 py-3 font-semibold text-slate-600">{commonT('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-12"><LoadingSpinner size="lg" /></td></tr>
              ) : allocations.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">{t('hostel.noAllocations')}</td></tr>
              ) : allocations.map(a => (
                <tr key={a._id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="whitespace-nowrap px-5 py-3 font-medium text-slate-800">
                    {a.student?.firstName && a.student?.lastName ? `${a.student.firstName} ${a.student.lastName}` : a.student?.name || '-'}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-slate-600">{a.room?.roomNumber || '-'}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-slate-600">{a.room?.building || '-'}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-slate-600">{formatDate(a.checkInDate)}</td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <span className={statusBadge(a.status)}>{a.status === 'checked-out' ? t('hostel.checkedOut') : t('hostel.active')}</span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <div className="flex items-center gap-2">
                      {a.status === 'active' && (
                        <button onClick={() => handleCheckout(a._id)} className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100">{t('hostel.checkOut')}</button>
                      )}
                      <button onClick={() => handleDelete(a._id)} className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">{t('hostel.remove')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  );
};

export default AdminHostelAllocations;
