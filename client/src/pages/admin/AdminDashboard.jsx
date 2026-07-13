import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import api from '../../lib/api';
import { readStoredLanguage } from '../../lib/languageStorage';
import {
  AreaChartComponent,
  BarChartComponent,
  DoughnutChartComponent,
  GaugeChartComponent,
  RadarChartComponent,
} from '../../components/UIHelper/ECharts';
import Avatar from '../../components/UIHelper/Avatar';
import { formatDate } from '../../lib/utils';

const quickActionItems = [
  { translationKey: 'reviewAdmissions', noteTranslationKey: 'applicationsNeedApproval', noteCount: '12', path: '/admin/users/register' },
  { translationKey: 'checkFeeSummary', noteTranslationKey: 'revenueUp', noteCount: '11', path: '/admin/finance/fee-structure' },
  { translationKey: 'manageClasses', noteTranslationKey: 'addNewClasses', noteCount: '', path: '/admin/academic/classes' },
  { translationKey: 'libraryBooks', noteTranslationKey: 'addNewBooks', noteCount: '', path: '/admin/library/books' },
  { translationKey: 'systemSettings', noteTranslationKey: 'updateInstitutionSettings', noteCount: '', path: '/admin/settings/general' },
  { translationKey: 'resolveComplaints', noteTranslationKey: 'casesWaiting', noteCount: '3', path: '/admin/complaints' },
];

const StatCard = ({ label, value, note, accentClass, iconText }) => (
  <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/40 backdrop-blur-xl p-5 shadow-sm">
    <div className={`absolute inset-x-0 top-0 h-1 ${accentClass}`} />
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        <p className="mt-2 text-sm text-slate-500">{note}</p>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700">
        {iconText}
      </div>
    </div>
  </div>
);

const Panel = ({ title, subtitle, children, className = '', dark = false }) => (
  <div className={`rounded-3xl border p-6 shadow-sm ${dark ? 'border-slate-700 bg-slate-900/60 backdrop-blur-xl' : 'border-white/60 bg-white/40 backdrop-blur-xl'} ${className}`}>
    {(title || subtitle) && (
      <div className="mb-5">
        {title && (
          <h3 className={`text-lg font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
            {title}
          </h3>
        )}
        {subtitle && (
          <p className={`mt-1 text-sm ${dark ? 'text-slate-300' : 'text-slate-500'}`}>
            {subtitle}
          </p>
        )}
      </div>
    )}
    {children}
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('admin');

  // Sync i18n language with AdminPanel's language selection
  useEffect(() => {
    const syncLang = () => {
      const lang = readStoredLanguage('adminLang', 'en');
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    };
    syncLang();
    window.addEventListener('storage', syncLang);
    return () => window.removeEventListener('storage', syncLang);
  }, []);

  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalStaff: 0,
    totalClasses: 0,
    totalSubjects: 0,
    totalUsers: 0,
    pendingComplaints: 0,
    monthlyRevenue: 0,
    totalIncome: 0,
    totalExpense: 0,
    enrollmentTrend: [],
    revenueTrend: [],
    recentActivity: [],
    upcomingEvents: [],
    performanceRadarData: [],
    performanceIndicators: [],
    occupancyCapacity: 240,
  });

  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setDashboardData(res.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const { totalStudents, totalTeachers, totalStaff, monthlyRevenue, pendingComplaints, totalUsers, enrollmentTrend, revenueTrend, recentActivity, upcomingEvents, performanceRadarData, performanceIndicators, occupancyCapacity } = dashboardData;

  const userDistributionData = [
    { name: t('dash.totalStudents'), value: totalStudents, color: '#2563EB' },
    { name: t('dash.teachers'), value: totalTeachers, color: '#14B8A6' },
    { name: t('dash.supportStaff'), value: totalStaff, color: '#F97316' },
  ];

  const combinedUsers = totalStudents + totalTeachers + totalStaff;

  const occupancyRate = Math.min(
    100,
    Math.round((totalStudents / (occupancyCapacity || 240)) * 100) || 0
  );

  const statCards = [
    {
      label: t('dash.totalStudents'),
      value: totalStudents,
      note: t('dash.activeEnrollments'),
      accentClass: 'bg-blue-500',
      iconText: 'STD',
    },
    {
      label: t('dash.teachers'),
      value: totalTeachers,
      note: t('dash.facultyAssigned'),
      accentClass: 'bg-teal-500',
      iconText: 'TCH',
    },
    {
      label: t('dash.supportStaff'),
      value: totalStaff,
      note: t('dash.operationsTeam'),
      accentClass: 'bg-orange-500',
      iconText: 'STF',
    },
    {
      label: t('dash.monthlyRevenue'),
      value: `$${(monthlyRevenue / 1000).toFixed(0)}k`,
      note: t('dash.collectedThisMonth'),
      accentClass: 'bg-emerald-500',
      iconText: 'REV',
    },
  ];

  const displayActivity = recentActivity.length > 0 ? recentActivity : [];
  const displayEvents = upcomingEvents.length > 0 ? upcomingEvents : [];
  const displayEnrollment = enrollmentTrend.length > 0 ? enrollmentTrend : [];
  const displayRevenue = revenueTrend.length > 0 ? revenueTrend : [];

  const hasRadarData = performanceRadarData.length > 0;
  const hasIndicators = performanceIndicators.length > 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
          <p className="mt-4 text-sm text-slate-500">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[32px] bg-slate-950 text-white shadow-2xl">
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.4fr,0.9fr] lg:px-8">
            <div className="relative">
              <div className="absolute -left-16 top-0 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
              <div className="absolute left-40 top-10 h-32 w-32 rounded-full bg-blue-500/20 blur-3xl" />
              <div className="relative">
                <div className="mb-5 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-200 backdrop-blur">
                  {t('dash.overview')}
                </div>
                <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                  {t('dash.title')}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  {t('dash.subtitle')}
                </p>

                  <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{t('dash.activeUsers')}</p>
                    <p className="mt-2 text-2xl font-semibold">{combinedUsers || totalUsers}</p>
                    <p className="mt-1 text-sm text-slate-300">{t('dash.combinedUsers')}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{t('dash.capacityUsed')}</p>
                    <p className="mt-2 text-2xl font-semibold">{occupancyRate}%</p>
                    <p className="mt-1 text-sm text-slate-300">{t('dash.basedOnTarget')}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{t('dash.sessionDate')}</p>
                    <p className="mt-2 text-2xl font-semibold">{formatDate(new Date().toISOString())}</p>
                    <p className="mt-1 text-sm text-slate-300">{t('dash.snapshot')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-white/10 p-2">
                  <Avatar size="xl" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">{t('dash.administrator')}</p>
                  <h2 className="text-2xl font-semibold">{t('dash.superAdmin')}</h2>
                  <p className="text-sm text-slate-400">{t('dash.administrator')}: ADM2024001</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {quickActionItems.map((item) => (
                  <button
                    key={item.translationKey}
                    onClick={() => navigate(item.path)}
                    className="w-full text-left rounded-2xl border border-white/10 bg-slate-900/60 p-4 hover:bg-slate-800/60 transition-colors"
                  >
                    <p className="font-medium text-white">{t(`dash.${item.translationKey}`)}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {item.noteCount 
                        ? `${item.noteCount} ${t(`dash.${item.noteTranslationKey}`)}`
                        : t(`dash.${item.noteTranslationKey}`)
                      }
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.45fr,0.95fr]">
          <div className="rounded-[28px] border border-white/60 bg-white/40 backdrop-blur-xl p-3 shadow-sm">
            <AreaChartComponent
              title={t('dash.enrollmentGrowth')}
              data={displayEnrollment}
              dataKey="students"
              nameKey="month"
              height={360}
              color="#0F766E"
            />
          </div>

          <Panel
            title={t('dash.operationalSnapshot')}
            subtitle={t('dash.institutionHealth')}
            className="bg-slate-900 text-white"
            dark
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-300">{t('dash.revenueTarget')}</p>
                <p className="mt-2 text-3xl font-semibold">{t('dash.revenueCollected')}</p>
                <p className="mt-2 text-sm text-emerald-300">{t('dash.targetAchieved', { value: 89 })}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-300">{t('dash.pendingComplaints')}</p>
                <p className="mt-2 text-3xl font-semibold">{pendingComplaints}</p>
                <p className="mt-2 text-sm text-slate-300">{t('dash.serviceDeskWorkload')}</p>
              </div>
            </div>
            <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-medium text-white">{t('dash.weeklyFocus')}</p>
                <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-medium text-cyan-200">
                  {t('common.healthy')}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500" />
              </div>
              <p className="mt-3 text-sm text-slate-300">
                {t('dash.operationsStable')}
              </p>
            </div>
          </Panel>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-[28px] border border-white/60 bg-white/40 backdrop-blur-xl p-3 shadow-sm">
            <DoughnutChartComponent
              title={t('dash.userDistribution')}
              data={userDistributionData}
              height={330}
              showLegend={false}
            />
          </div>

          <div className="rounded-[28px] border border-white/60 bg-white/40 backdrop-blur-xl p-3 shadow-sm">
            <BarChartComponent
              title={t('dash.monthlyRevenueChart')}
              data={displayRevenue}
              dataKey="amount"
              nameKey="month"
              height={330}
              color="#2563EB"
            />
          </div>

          <Panel title={t('dash.distributionDetails')} subtitle={t('dash.userMix')}>
            <div className="space-y-4">
              {userDistributionData.map((item) => {
                const percent = combinedUsers ? Math.round((item.value / combinedUsers) * 100) : 0;

                return (
                  <div key={item.name}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium text-slate-700">{item.name}</span>
                      </div>
                      <span className="text-sm text-slate-500">
                        {item.value} {t('common.users')}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${percent}%`, backgroundColor: item.color }}
                      />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{percent}% {t('dash.ofTotal')}</p>
                  </div>
                );
              })}
            </div>
          </Panel>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[28px] border border-white/60 bg-white/40 backdrop-blur-xl p-3 shadow-sm">
              <RadarChartComponent
                title={t('dash.performanceRadar')}
                data={hasRadarData ? performanceRadarData : [{ value: [84, 78, 91, 88, 73, 86], name: t('dash.operations') }]}
                indicators={hasIndicators ? performanceIndicators : [
                  { name: t('dash.radarAttendance'), max: 100 },
                  { name: t('dash.radarFees'), max: 100 },
                  { name: t('dash.radarAcademics'), max: 100 },
                  { name: t('dash.radarDiscipline'), max: 100 },
                  { name: t('dash.radarSatisfaction'), max: 100 },
                  { name: t('dash.radarGrowth'), max: 100 },
                ]}
                height={330}
              />
            </div>

            <div className="rounded-[28px] border border-white/60 bg-white/40 backdrop-blur-xl p-3 shadow-sm">
              <GaugeChartComponent
                title={t('dash.capacityUsage')}
                value={occupancyRate}
                height={330}
              />
            </div>
          </div>

          <Panel title={t('dash.recentActivity')} subtitle={t('dash.adminOperations')}>
            <div className="space-y-4">
              {(displayActivity.length > 0 ? displayActivity : []).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-xs font-semibold text-white">
                    {activity.type}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-medium text-slate-900">{activity.title}</p>
                      <p className="text-sm text-slate-400">{formatDate(activity.date)}</p>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {activity.user}
                      {activity.amount ? ` - $${typeof activity.amount === 'number' ? activity.amount.toLocaleString() : activity.amount}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <section className="mt-8">
          <Panel title={t('dash.upcomingEvents')} subtitle={t('dash.importantDates')}>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {(displayEvents.length > 0 ? displayEvents : []).map((event) => (
                <div
                  key={event.id}
                  className="rounded-3xl border border-white/60 bg-white/40 backdrop-blur-xl p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                      {event.type}
                    </span>
                    <span className="text-sm text-slate-400">{event.time}</span>
                  </div>
                  <h4 className="mt-5 text-lg font-semibold text-slate-900">{event.title}</h4>
                  <p className="mt-2 text-sm text-slate-500">{formatDate(event.date)}</p>
                </div>
              ))}
            </div>
          </Panel>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
