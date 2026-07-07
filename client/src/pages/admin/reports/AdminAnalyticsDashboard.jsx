import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';

const AdminAnalyticsDashboard = () => {
  const { t } = useTranslation('admin');

  useEffect(() => {
    const syncLang = () => {
      const lang = readStoredLanguage('adminLang', 'en');
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    };
    syncLang();
  }, []);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/stats');
        setStats(data?.data || data || null);
      } catch { setStats(null); } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const cards = stats ? [
    { label: t('reports.attendanceReports'), value: stats.students || 0, color: 'cyan' },
    { label: t('reports.totalTeachers'), value: stats.teachers || 0, color: 'emerald' },
    { label: t('reports.activeClasses'), value: stats.activeClasses || 0, color: 'amber' },
    { label: t('reports.libraryBooks'), value: stats.libraryBooks || 0, color: 'violet' },
    { label: t('reports.departments'), value: stats.departments || 0, color: 'blue' },
    { label: t('reports.totalUsers'), value: stats.totalUsers || 0, color: 'rose' },
    { label: t('reports.courses'), value: stats.courses || 0, color: 'indigo' },
    { label: t('reports.satisfaction'), value: `${stats.satisfaction || 0}%`, color: 'teal' },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('reports.analyticsDashboard')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('reports.institutionAnalytics')}</p>
      </div>
      {loading ? <p className="text-slate-400">{t('common.loading')}</p> : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {cards.map((c, i) => (
              <div key={i} className={`rounded-2xl border border-${c.color}-200 bg-${c.color}-50 p-5`}>
                <p className={`text-xs font-medium text-${c.color}-600`}>{c.label}</p>
                <p className={`mt-1 text-2xl font-bold text-${c.color}-700`}>{typeof c.value === 'number' ? c.value.toLocaleString() : c.value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('reports.enrollmentTrends')}</h2>
              <p className="text-slate-400">{t('reports.enrollmentTrends')}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('reports.revenueTrends')}</h2>
              <p className="text-slate-400">{t('reports.revenueTrends')}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('reports.departmentPerformance')}</h2>
              <p className="text-slate-400">{t('reports.departmentPerformance')}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('reports.keyInsights')}</h2>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>• {t('reports.totalEnrollmentReached', { count: stats?.students || 0 })}</li>
                <li>• {t('reports.facultyStrength', { count: stats?.teachers || 0 })}</li>
                <li>• {t('reports.libraryHouses', { count: stats?.libraryBooks || 0 })}</li>
                <li>• {t('reports.satisfactionRateText', { value: stats?.satisfaction || 0 })}</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalyticsDashboard;
