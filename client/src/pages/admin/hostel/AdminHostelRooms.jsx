import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';
import { LoadingSpinner } from '../../../components/UIHelper/Loading';
import Pagination from '../../../components/UIHelper/Pagination';
import Modal from '../../../components/UIHelper/Modal';

const AMENITY_OPTIONS = ['wifi', 'ac', 'fan', 'study_table', 'chair', 'wardrobe', 'attached_bathroom', 'tv', 'refrigerator'];
const ROOM_TYPES = ['single', 'double', 'triple', 'quad'];
const STATUSES = ['available', 'occupied', 'maintenance', 'reserved'];

const AdminHostelRooms = () => {
  const { t } = useTranslation('admin');
  const commonT = useTranslation('common').t;

  useEffect(() => {
    const syncLang = () => {
      const lang = readStoredLanguage('adminLang', 'en');
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    };
    syncLang();
  }, []);

  const [rooms, setRooms] = useState([]);
  const [allRoomsCache, setAllRoomsCache] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('');
  const [buildings, setBuildings] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    roomNumber: '', building: '', floor: '', capacity: 2,
    roomType: 'double', status: 'available', amenities: [],
    monthlyRent: '', description: ''
  });

  const fetchRooms = async (p, searchTerm, status, building) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 10 };
      if (searchTerm) params.search = searchTerm;
      if (status) params.status = status;
      if (building) params.building = building;
      const { data } = await api.get('/hostel/rooms', { params });
      setRooms(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBuildings = async () => {
    try {
      const { data } = await api.get('/hostel/rooms', { params: { limit: 200 } });
      const all = data.data || [];
      setAllRoomsCache(all);
      const unique = [...new Set(all.map(r => r.building).filter(Boolean))].sort();
      setBuildings(unique);
    } catch {}
  };

  useEffect(() => {
    fetchRooms(page, appliedSearch, statusFilter, buildingFilter);
    fetchBuildings();
  }, []);

  const handleSearch = () => {
    setPage(1);
    setAppliedSearch(search);
    fetchRooms(1, search, statusFilter, buildingFilter);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    setPage(1);
    fetchRooms(1, appliedSearch, val, buildingFilter);
  };

  const handleBuildingChange = (val) => {
    setBuildingFilter(val);
    setPage(1);
    fetchRooms(1, appliedSearch, statusFilter, val);
  };

  const handlePageChange = (p) => {
    setPage(p);
    fetchRooms(p, appliedSearch, statusFilter, buildingFilter);
  };

  const stats = (() => {
    const total = allRoomsCache.length;
    const available = allRoomsCache.filter(r => r.status === 'available').length;
    const occupied = allRoomsCache.filter(r => r.status === 'occupied').length;
    const maintenance = allRoomsCache.filter(r => r.status === 'maintenance').length;
    return { total, available, occupied, maintenance };
  })();

  const openAddModal = () => {
    setEditingId(null);
    setForm({ roomNumber: '', building: '', floor: '', capacity: 2, roomType: 'double', status: 'available', amenities: [], monthlyRent: '', description: '' });
    setModalOpen(true);
  };

  const openEditModal = (r) => {
    setEditingId(r._id);
    setForm({
      roomNumber: r.roomNumber || '',
      building: r.building || '',
      floor: r.floor?.toString() || '',
      capacity: r.capacity || 2,
      roomType: r.roomType || 'double',
      status: r.status || 'available',
      amenities: r.amenities || [],
      monthlyRent: r.monthlyRent?.toString() || '',
      description: r.description || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        roomNumber: form.roomNumber,
        building: form.building,
        floor: +form.floor,
        capacity: +form.capacity,
        roomType: form.roomType,
        status: form.status,
        amenities: form.amenities,
        monthlyRent: +form.monthlyRent || 0,
        description: form.description
      };
      if (editingId) {
        await api.put(`/hostel/rooms/${editingId}`, payload);
      } else {
        await api.post('/hostel/rooms', payload);
      }
      setModalOpen(false);
      setEditingId(null);
      fetchRooms(page, appliedSearch, statusFilter, buildingFilter);
      fetchBuildings();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('hostel.deleteRoomConfirm'))) return;
    try {
      await api.delete(`/hostel/rooms/${id}`);
      fetchRooms(page, appliedSearch, statusFilter, buildingFilter);
      fetchBuildings();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAmenity = (amenity) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const statusBadge = (status) => {
    const map = {
      available: 'bg-emerald-50 text-emerald-700',
      occupied: 'bg-amber-50 text-amber-700',
      maintenance: 'bg-rose-50 text-rose-700',
      reserved: 'bg-blue-50 text-blue-700'
    };
    return `rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] || 'bg-slate-50 text-slate-700'}`;
  };

  const roomTypeLabel = (type) => {
    const labels = { single: t('hostel.single'), double: t('hostel.double'), triple: t('hostel.triple'), quad: t('hostel.quad') };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('hostel.hostelRooms')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('hostel.manageRooms')}</p>
        </div>
        <button onClick={openAddModal} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700">
          + {t('hostel.addRoom')}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: t('hostel.totalRooms'), value: stats.total, color: 'text-slate-700 bg-slate-100' },
          { label: t('hostel.available'), value: stats.available, color: 'text-emerald-700 bg-emerald-50' },
          { label: t('hostel.occupied'), value: stats.occupied, color: 'text-amber-700 bg-amber-50' },
          { label: t('hostel.maintenance'), value: stats.maintenance, color: 'text-rose-700 bg-rose-50' }
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
            onKeyDown={handleSearchKeyDown}
            placeholder={commonT('search') + '...'}
            className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100"
          />
        </div>
        <button onClick={handleSearch} className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700">
          {commonT('search')}
        </button>
        <select
          value={statusFilter}
          onChange={e => handleStatusChange(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100"
        >
          <option value="">{commonT('all')} {commonT('status')}</option>
          {STATUSES.map(s => (
            <option key={s} value={s}>{t(`hostel.${s}`)}</option>
          ))}
        </select>
        <select
          value={buildingFilter}
          onChange={e => handleBuildingChange(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100"
        >
          <option value="">{commonT('all')} {t('hostel.block')}</option>
          {buildings.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="whitespace-nowrap px-5 py-3 font-semibold text-slate-600">{t('hostel.roomNo')}</th>
                <th className="whitespace-nowrap px-5 py-3 font-semibold text-slate-600">{t('hostel.block')}</th>
                <th className="whitespace-nowrap px-5 py-3 font-semibold text-slate-600">{t('hostel.floor')}</th>
                <th className="whitespace-nowrap px-5 py-3 font-semibold text-slate-600">{t('hostel.capacity')}</th>
                <th className="whitespace-nowrap px-5 py-3 font-semibold text-slate-600">{t('hostel.roomType')}</th>
                <th className="whitespace-nowrap px-5 py-3 font-semibold text-slate-600">{commonT('status')}</th>
                <th className="whitespace-nowrap px-5 py-3 font-semibold text-slate-600">{commonT('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12">
                    <LoadingSpinner size="lg" />
                  </td>
                </tr>
              ) : rooms.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400">{t('hostel.noRooms')}</td></tr>
              ) : rooms.map(r => (
                <tr key={r._id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="whitespace-nowrap px-5 py-3 font-medium text-slate-800">{r.roomNumber}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-slate-600">{r.building || '-'}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-slate-600">{r.floor ?? '-'}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-slate-600">{r.capacity}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-slate-600">{roomTypeLabel(r.roomType)}</td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <span className={statusBadge(r.status)}>{t(`hostel.${r.status}`)}</span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditModal(r)} className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">{commonT('edit')}</button>
                      <button onClick={() => handleDelete(r._id)} className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">{commonT('delete')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingId(null); }} title={editingId ? commonT('edit') + ' ' + t('hostel.hostelRooms') : t('hostel.addRoom')} size="2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('hostel.roomNumber')}</label>
              <input value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('hostel.block')}</label>
              <input value={form.building} onChange={e => setForm({ ...form, building: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('hostel.floor')}</label>
              <input type="number" min="0" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('hostel.capacity')}</label>
              <input type="number" min="1" value={form.capacity} onChange={e => setForm({ ...form, capacity: +e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('hostel.roomType')}</label>
              <select value={form.roomType} onChange={e => setForm({ ...form, roomType: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100">
                {ROOM_TYPES.map(rt => (
                  <option key={rt} value={rt}>{t(`hostel.${rt}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{commonT('status')}</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100">
                {STATUSES.map(s => (
                  <option key={s} value={s}>{t(`hostel.${s}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('hostel.monthlyRent')}</label>
              <input type="number" min="0" value={form.monthlyRent} onChange={e => setForm({ ...form, monthlyRent: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">{commonT('description')}</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100" />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">{t('hostel.amenities')}</label>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map(a => (
                <label key={a} className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${form.amenities.includes(a) ? 'border-cyan-400 bg-cyan-50 text-cyan-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                  <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} className="sr-only" />
                  {a.replace(/_/g, ' ')}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => { setModalOpen(false); setEditingId(null); }} className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">{commonT('cancel')}</button>
            <button type="submit" className="rounded-lg bg-cyan-600 px-5 py-2 text-sm font-medium text-white hover:bg-cyan-700">{editingId ? commonT('update') : commonT('create')}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminHostelRooms;
