import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';

const AdminKitchenReports = () => {
  const { t } = useTranslation('admin');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    const syncLang = () => { const lang = readStoredLanguage('adminLang', 'en'); if (i18n.language !== lang) i18n.changeLanguage(lang); };
    syncLang();
    window.addEventListener('storage', syncLang);
    return () => window.removeEventListener('storage', syncLang);
  }, []);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/kitchen/reports', { params: { period } });
        const d = data?.data || {};
        setReport(d);
      } catch { setReport(null); } finally { setLoading(false); }
    };
    fetchReport();
  }, [period]);

  if (loading && !report) return <div className="flex items-center justify-center py-20 text-slate-500">{t('common.loading')}</div>;

  return (
    <div className="w-full min-h-screen p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('kitchen.kitchenReports')}</h1>
          <p className="text-slate-500 mt-1">{t('kitchen.kitchenAnalytics')}</p>
        </div>
        <select value={period} onChange={e => setPeriod(e.target.value)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
          <option value="daily">{t('common.daily')}</option>
          <option value="weekly">{t('common.weekly')}</option>
          <option value="monthly">{t('common.monthly')}</option>
          <option value="yearly">{t('common.yearly')}</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{t('kitchen.totalMeals')}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{report?.totalMeals || 0}</p>
          <p className="mt-1 text-xs text-slate-400">{report?.totalStudentMeals || 0} {t('kitchen.students')} / {report?.totalStaffMeals || 0} {t('kitchen.staff')}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">{t('kitchen.totalPurchases')}</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">{(report?.totalPurchases || 0).toLocaleString()} AFN</p>
          <p className="mt-1 text-xs text-emerald-500">{report?.purchaseCount || 0} {t('kitchen.transactions')}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">{t('kitchen.totalWaste')}</p>
          <p className="mt-2 text-3xl font-bold text-amber-700">{report?.totalWasteQuantity || 0}</p>
          <p className="mt-1 text-xs text-amber-500">{report?.totalWasteRecords || 0} {t('kitchen.records')}</p>
        </div>
        <div className="rounded-2xl border border-cyan-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-cyan-600 uppercase tracking-wider">{t('kitchen.inventoryStatus')}</p>
          <p className="mt-2 text-3xl font-bold text-cyan-700">{report?.totalInventoryItems || 0}</p>
          <p className="mt-1 text-xs text-cyan-500">{report?.lowStockItems || 0} {t('kitchen.lowStock')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-4">{t('kitchen.consumptionSummary')}</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600">{t('kitchen.totalMeals')}</span><span className="text-sm font-semibold text-slate-800">{report?.totalMeals || 0}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600">{t('kitchen.studentMeals')}</span><span className="text-sm font-semibold text-slate-800">{report?.totalStudentMeals || 0}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600">{t('kitchen.staffMeals')}</span><span className="text-sm font-semibold text-slate-800">{report?.totalStaffMeals || 0}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600">{t('kitchen.consumptionCount')}</span><span className="text-sm font-semibold text-slate-800">{report?.consumptionCount || 0}</span></div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-4">{t('kitchen.financialSummary')}</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600">{t('kitchen.totalPurchases')}</span><span className="text-sm font-semibold text-slate-800">{(report?.totalPurchases || 0).toLocaleString()} AFN</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600">{t('kitchen.purchaseCount')}</span><span className="text-sm font-semibold text-slate-800">{report?.purchaseCount || 0}</span></div>
            <div className="border-t border-slate-100 pt-2 mt-2 flex items-center justify-between"><span className="text-sm font-medium text-slate-700">{t('kitchen.inventoryItems')}</span><span className="text-sm font-semibold text-slate-800">{report?.totalInventoryItems || 0}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600">{t('kitchen.lowStockItems')}</span><span className={`text-sm font-semibold ${report?.lowStockItems > 0 ? 'text-amber-600' : 'text-green-600'}`}>{report?.lowStockItems || 0}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminKitchenReports;
