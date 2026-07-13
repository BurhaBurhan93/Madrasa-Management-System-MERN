import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';
import { LoadingSpinner } from '../../../components/UIHelper/Loading';
import Pagination from '../../../components/UIHelper/Pagination';
import Modal from '../../../components/UIHelper/Modal';
import CalendarDatePicker from "../../../components/UIHelper/CalendarDatePicker";

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

const AdminHostelMeals = () => {
  const { t } = useTranslation('admin');
  const commonT = useTranslation('common').t;

  useEffect(() => {
    const syncLang = () => {
      const lang = readStoredLanguage('adminLang', 'en');
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    };
    syncLang();
  }, []);

  const [meals, setMeals] = useState([]);
  const [allMeals, setAllMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mealTypeFilter, setMealTypeFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ mealType: 'breakfast', mainDish: '', sideDish: '', dessert: '', beverage: '', date: '', costPerPerson: '', notes: '' });

  const menuDisplay = (m) => {
    if (!m) return '-';
    if (typeof m === 'string') return m;
    return Object.values(m).filter(Boolean).join(', ') || '-';
  };

  const fetchMeals = async (p, mealType) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 10 };
      if (mealType) params.mealType = mealType;
      const { data } = await api.get('/hostel/meals', { params });
      setMeals(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      setMeals([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMeals = async () => {
    try {
      const { data } = await api.get('/hostel/meals', { params: { limit: 200 } });
      setAllMeals(data.data || []);
    } catch {}
  };

  useEffect(() => {
    fetchMeals(1, '');
    fetchAllMeals();
  }, []);

  const stats = (() => {
    const total = allMeals.length;
    return { total };
  })();

  const handleMealTypeChange = (val) => {
    setMealTypeFilter(val);
    setPage(1);
    fetchMeals(1, val);
  };

  const handlePageChange = (p) => {
    setPage(p);
    fetchMeals(p, mealTypeFilter);
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm({ mealType: 'breakfast', mainDish: '', sideDish: '', dessert: '', beverage: '', date: '', costPerPerson: '', notes: '' });
    setModalOpen(true);
  };

  const openEditModal = (m) => {
    setEditingId(m._id);
    const menu = m.menu || {};
    setForm({
      mealType: m.mealType || 'breakfast',
      mainDish: menu.mainDish || '',
      sideDish: menu.sideDish || '',
      dessert: menu.dessert || '',
      beverage: menu.beverage || '',
      date: m.date ? new Date(m.date).toISOString().split('T')[0] : '',
      costPerPerson: m.costPerPerson?.toString() || '',
      notes: m.notes || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        mealType: form.mealType,
        menu: { mainDish: form.mainDish, sideDish: form.sideDish, dessert: form.dessert, beverage: form.beverage },
        date: form.date,
        costPerPerson: +form.costPerPerson || 0,
        notes: form.notes
      };
      if (editingId) {
        await api.put(`/hostel/meals/${editingId}`, payload);
      } else {
        await api.post('/hostel/meals', payload);
      }
      setModalOpen(false);
      setEditingId(null);
      fetchMeals(page, mealTypeFilter);
      fetchAllMeals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('hostel.deleteMealConfirm'))) return;
    try {
      await api.delete(`/hostel/meals/${id}`);
      fetchMeals(page, mealTypeFilter);
      fetchAllMeals();
    } catch (err) {
      console.error(err);
    }
  };

  const mealTypeLabel = (type) => {
    const labels = { breakfast: t('kitchen.breakfast'), lunch: t('kitchen.lunch'), dinner: t('kitchen.dinner'), snack: t('kitchen.snacks') };
    return labels[type] || type || t('common.na');
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '-';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('hostel.meals')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('hostel.planHostelMeals')}</p>
        </div>
        <button onClick={openAddModal} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700">
          + {t('hostel.addMeal')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">{t('hostel.totalMeals')}</p>
          <p className="mt-1 text-2xl font-bold text-slate-700">{stats.total}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={mealTypeFilter}
          onChange={e => handleMealTypeChange(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100"
        >
          <option value="">{t('hostel.allMealTypes')}</option>
          {MEAL_TYPES.map(mt => (
            <option key={mt} value={mt}>{mealTypeLabel(mt)}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="whitespace-nowrap px-5 py-3 font-semibold text-slate-600">{t('kitchen.mealType')}</th>
                <th className="whitespace-nowrap px-5 py-3 font-semibold text-slate-600">{t('hostel.menu')}</th>
                <th className="whitespace-nowrap px-5 py-3 font-semibold text-slate-600">{t('common.date')}</th>
                <th className="whitespace-nowrap px-5 py-3 font-semibold text-slate-600">{t('kitchen.cost')}</th>
                <th className="whitespace-nowrap px-5 py-3 font-semibold text-slate-600">{t('hostel.notes')}</th>
                <th className="whitespace-nowrap px-5 py-3 font-semibold text-slate-600">{commonT('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-12"><LoadingSpinner size="lg" /></td></tr>
              ) : meals.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">{t('hostel.noMeals')}</td></tr>
              ) : meals.map(m => (
                <tr key={m._id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="whitespace-nowrap px-5 py-3 font-medium text-slate-800 capitalize">{mealTypeLabel(m.mealType)}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-slate-600">{menuDisplay(m.menu)}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-slate-600">{formatDate(m.date)}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-slate-600">{m.costPerPerson ?? m.cost ?? '-'}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-slate-600 max-w-[200px] truncate">{m.notes || '-'}</td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditModal(m)} className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">{commonT('edit')}</button>
                      <button onClick={() => handleDelete(m._id)} className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">{commonT('delete')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingId(null); }} title={editingId ? commonT('edit') + ' ' + t('hostel.meals') : t('hostel.addMeal')} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('kitchen.mealType')}</label>
              <select value={form.mealType} onChange={e => setForm({ ...form, mealType: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100">
                {MEAL_TYPES.map(mt => (
                  <option key={mt} value={mt}>{mealTypeLabel(mt)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('kitchen.mainDish')}</label>
              <input value={form.mainDish} onChange={e => setForm({ ...form, mainDish: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('kitchen.sideDish')}</label>
              <input value={form.sideDish} onChange={e => setForm({ ...form, sideDish: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('kitchen.dessert')}</label>
              <input value={form.dessert} onChange={e => setForm({ ...form, dessert: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('kitchen.beverage')}</label>
              <input value={form.beverage} onChange={e => setForm({ ...form, beverage: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('common.date')}</label>
              <CalendarDatePicker value={form.date} onChange={(date) => setForm({ ...form, date: date })} placeholder={t('hostel.selectDate')} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('kitchen.cost')}</label>
              <input type="number" min="0" value={form.costPerPerson} onChange={e => setForm({ ...form, costPerPerson: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('hostel.notes')}</label>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => { setModalOpen(false); setEditingId(null); }} className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">{commonT('cancel')}</button>
            <button type="submit" className="rounded-lg bg-cyan-600 px-5 py-2 text-sm font-medium text-white hover:bg-cyan-700">{editingId ? commonT('update') : t('hostel.saveMeal')}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminHostelMeals;
