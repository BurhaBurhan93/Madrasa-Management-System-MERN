import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';
import { LoadingSpinner } from '../../../components/UIHelper/Loading';
import Pagination from '../../../components/UIHelper/Pagination';

const AdminHostelReports = () => {
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
  const [allocations, setAllocations] = useState([]);
  const [meals, setMeals] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dataRows, setDataRows] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [roomsRes, allocRes, mealsRes, attRes] = await Promise.all([
          api.get('/hostel/rooms', { params: { limit: 200 } }),
          api.get('/hostel/allocations', { params: { limit: 200 } }),
          api.get('/hostel/meals', { params: { limit: 200 } }),
          api.get('/hostel/meal-attendance', { params: { limit: 200 } })
        ]);
        const r = roomsRes.data.data || [];
        const a = allocRes.data.data || [];
        const m = mealsRes.data.data || [];
        const at = attRes.data.data || [];
        setRooms(r);
        setAllocations(a);
        setMeals(m);
        setAttendance(at);

        const rows = [
          { label: t('hostel.totalRooms'), value: r.length, change: `${r.filter(x => x.status === 'available').length} available` },
          { label: t('hostel.occupancyRate'), value: r.length ? `${Math.round((r.filter(x => x.status === 'occupied').length / r.length) * 100)}%` : '-', change: `${r.filter(x => x.status === 'occupied').length} rooms occupied` },
          { label: t('hostel.activeResidents'), value: a.filter(x => x.status === 'active').length, change: `${a.length} total allocations` },
          { label: t('hostel.totalMeals'), value: m.length, change: `${m.filter(x => x.mealType === 'lunch').length} lunches planned` },
          { label: `${t('hostel.present')} / ${t('hostel.absent')}`, value: `${at.filter(x => x.status === 'present').length} / ${at.filter(x => x.status === 'absent').length}`, change: `${at.length} total records` },
          { label: t('hostel.totalAttendance'), value: at.length, change: `${at.filter(x => x.status === 'excused').length} excused` }
        ];
        setDataRows(rows);
        setTotalPages(Math.ceil(rows.length / 10));
      } catch {
        setDataRows([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const paginatedRows = dataRows.slice((page - 1) * 10, page * 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('hostel.hostelReports')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('hostel.hostelAnalytics')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500">{t('hostel.totalRooms')}</p>
          <p className="mt-1 text-2xl font-bold text-slate-700">{rooms.length}</p>
          <p className="mt-1 text-xs text-slate-400">{rooms.filter(r => r.status === 'available').length} available</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-medium text-emerald-600">{t('hostel.occupancyRate')}</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">
            {rooms.length ? `${Math.round((rooms.filter(r => r.status === 'occupied').length / rooms.length) * 100)}%` : '-'}
          </p>
          <p className="mt-1 text-xs text-emerald-500">{rooms.filter(r => r.status === 'occupied').length} rooms occupied</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-xs font-medium text-amber-600">{t('hostel.activeResidents')}</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{allocations.filter(a => a.status === 'active').length}</p>
          <p className="mt-1 text-xs text-amber-500">{allocations.length} total allocations</p>
        </div>
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
          <p className="text-xs font-medium text-cyan-600">{t('hostel.totalMeals')}</p>
          <p className="mt-1 text-2xl font-bold text-cyan-700">{meals.length}</p>
          <p className="mt-1 text-xs text-cyan-500">{meals.filter(m => m.mealType === 'lunch').length} lunches planned</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">{commonT('reportData')}</h2>
        {loading ? (
          <LoadingSpinner size="lg" />
        ) : dataRows.length === 0 ? (
          <p className="text-slate-400">{commonT('noData')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">{commonT('name')}</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">{commonT('value')}</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">{commonT('details')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">{row.label}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">{row.value}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">{row.change}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default AdminHostelReports;
