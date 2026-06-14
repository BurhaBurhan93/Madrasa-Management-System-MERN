import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../lib/api';
import {
  AreaChartComponent,
  BarChartComponent,
  DoughnutChartComponent,
  GaugeChartComponent,
  RadarChartComponent,
} from '../../components/UIHelper/ECharts';
import Avatar from '../../components/UIHelper/Avatar';
import { formatDate } from '../../lib/utils';

const enrollmentSeedData = [
  { month: 'Jan', students: 120 },
  { month: 'Feb', students: 138 },
  { month: 'Mar', students: 154 },
  { month: 'Apr', students: 166 },
  { month: 'May', students: 181 },
  { month: 'Jun', students: 198 },
];

const revenueSeedData = [
  { month: 'Jan', amount: 82000 },
  { month: 'Feb', amount: 91000 },
  { month: 'Mar', amount: 104000 },
  { month: 'Apr', amount: 112000 },
  { month: 'May', amount: 121000 },
  { month: 'Jun', amount: 125000 },
];

const performanceRadarData = [
  {
    value: [84, 78, 91, 88, 73, 86],
    name: 'Operations',
  },
];

const performanceIndicators = [
  { name: 'Attendance', max: 100 },
  { name: 'Fees', max: 100 },
  { name: 'Academics', max: 100 },
  { name: 'Discipline', max: 100 },
  { name: 'Satisfaction', max: 100 },
  { name: 'Growth', max: 100 },
];

const recentActivitySeed = [
  {
    id: 1,
    type: 'ST',
    title: 'New student admission completed',
    user: 'Admissions Office',
    amount: null,
    date: '2026-04-01T09:00:00.000Z',
  },
  {
    id: 2,
    type: 'FE',
    title: 'Monthly fee collection updated',
    user: 'Finance Team',
    amount: '$12,400',
    date: '2026-04-01T11:30:00.000Z',
  },
  {
    id: 3,
    type: 'HR',
    title: 'Teacher schedule published',
    user: 'Admin Office',
    amount: null,
    date: '2026-04-01T14:15:00.000Z',
  },
  {
    id: 4,
    type: 'QA',
    title: 'Complaint review marked resolved',
    user: 'Support Desk',
    amount: null,
    date: '2026-04-01T16:00:00.000Z',
  },
];

const upcomingEventsSeed = [
  {
    id: 1,
    title: 'Parent Meeting',
    type: 'Meeting',
    date: '2026-04-04T08:30:00.000Z',
    time: '08:30 AM',
  },
  {
    id: 2,
    title: 'Midterm Review',
    type: 'Academic',
    date: '2026-04-05T10:00:00.000Z',
    time: '10:00 AM',
  },
  {
    id: 3,
    title: 'Staff Training',
    type: 'Training',
    date: '2026-04-06T01:30:00.000Z',
    time: '01:30 PM',
  },
  {
    id: 4,
    title: 'Fee Deadline',
    type: 'Finance',
    date: '2026-04-07T09:00:00.000Z',
    time: '09:00 AM',
  },
];

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
  const { t } = useTranslation();
  const [quickStats, setQuickStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalStaff: 0,
    totalCourses: 48,
    monthlyRevenue: 125000,
    pendingComplaints: 12,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/users');
      const users = res.data.data;

      setQuickStats((prev) => ({
        ...prev,
        totalStudents: users.filter((u) => u.role === 'student').length,
        totalTeachers: users.filter((u) => u.role === 'teacher').length,
        totalStaff: users.filter((u) => u.role === 'staff').length,
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const userDistributionData = [
    { name: 'Students', value: quickStats.totalStudents, color: '#2563EB' },
    { name: 'Teachers', value: quickStats.totalTeachers, color: '#14B8A6' },
    { name: 'Staff', value: quickStats.totalStaff, color: '#F97316' },
  ];

  const totalUsers =
    quickStats.totalStudents + quickStats.totalTeachers + quickStats.totalStaff;

  const occupancyRate = Math.min(
    100,
    Math.round((quickStats.totalStudents / 240) * 100) || 0
  );

  const statCards = [
    {
      label: t('admin.dashboard.totalStudents'),
      value: quickStats.totalStudents,
      note: t('admin.dashboard.activeEnrollments'),
      accentClass: 'bg-blue-500',
      iconText: 'STD',
    },
    {
      label: t('admin.dashboard.teachers'),
      value: quickStats.totalTeachers,
      note: t('admin.dashboard.facultyAssigned'),
      accentClass: 'bg-teal-500',
      iconText: 'TCH',
    },
    {
      label: t('admin.dashboard.supportStaff'),
      value: quickStats.totalStaff,
      note: t('admin.dashboard.operationsTeam'),
      accentClass: 'bg-orange-500',
      iconText: 'STF',
    },
    {
      label: t('admin.dashboard.monthlyRevenue'),
      value: `$${(quickStats.monthlyRevenue / 1000).toFixed(0)}k`,
      note: t('admin.dashboard.collectedThisMonth'),
      accentClass: 'bg-emerald-500',
      iconText: 'REV',
    },
  ];

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
                  {t('admin.dashboard.overview')}
                </div>
                <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                  {t('admin.dashboard.title')}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  {t('admin.dashboard.subtitle')}
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{t('admin.dashboard.activeUsers')}</p>
                    <p className="mt-2 text-2xl font-semibold">{totalUsers}</p>
                    <p className="mt-1 text-sm text-slate-300">{t('admin.dashboard.combinedUsers')}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{t('admin.dashboard.capacityUsed')}</p>
                    <p className="mt-2 text-2xl font-semibold">{occupancyRate}%</p>
                    <p className="mt-1 text-sm text-slate-300">{t('admin.dashboard.basedOnTarget')}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{t('admin.dashboard.sessionDate')}</p>
                    <p className="mt-2 text-2xl font-semibold">{formatDate(new Date().toISOString())}</p>
                    <p className="mt-1 text-sm text-slate-300">{t('admin.dashboard.snapshot')}</p>
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
                  <p className="text-sm text-slate-300">{t('admin.dashboard.administrator')}</p>
                  <h2 className="text-2xl font-semibold">{t('admin.dashboard.superAdmin')}</h2>
                  <p className="text-sm text-slate-400">ADM2024001</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {quickActionItems.map((item) => (
                  <button
                    key={item.translationKey}
                    onClick={() => navigate(item.path)}
                    className="w-full text-left rounded-2xl border border-white/10 bg-slate-900/60 p-4 hover:bg-slate-800/60 transition-colors"
                  >
                    <p className="font-medium text-white">{t(`admin.dashboard.${item.translationKey}`)}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {item.noteCount 
                        ? `${item.noteCount} ${t(`admin.dashboard.${item.noteTranslationKey}`)}`
                        : t(`admin.dashboard.${item.noteTranslationKey}`)
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
              title={t('admin.dashboard.enrollmentGrowth')}
              data={enrollmentSeedData}
              dataKey="students"
              nameKey="month"
              height={360}
              color="#0F766E"
            />
          </div>

          <Panel
            title={t('admin.dashboard.operationalSnapshot')}
            subtitle={t('admin.dashboard.institutionHealth')}
            className="bg-slate-900 text-white"
            dark
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-300">{t('admin.dashboard.revenueTarget')}</p>
                <p className="mt-2 text-3xl font-semibold">$140k</p>
                <p className="mt-2 text-sm text-emerald-300">89 {t('admin.common.percent')} of target achieved</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-300">{t('admin.dashboard.pendingComplaints')}</p>
                <p className="mt-2 text-3xl font-semibold">{quickStats.pendingComplaints}</p>
                <p className="mt-2 text-sm text-slate-300">{t('admin.dashboard.serviceDeskWorkload')}</p>
              </div>
            </div>
            <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-medium text-white">{t('admin.dashboard.weeklyFocus')}</p>
                <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-medium text-cyan-200">
                  {t('admin.common.healthy')}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500" />
              </div>
              <p className="mt-3 text-sm text-slate-300">
                {t('admin.dashboard.operationsStable')}
              </p>
            </div>
          </Panel>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-[28px] border border-white/60 bg-white/40 backdrop-blur-xl p-3 shadow-sm">
            <DoughnutChartComponent
              title={t('admin.dashboard.userDistribution')}
              data={userDistributionData}
              height={330}
              showLegend={false}
            />
          </div>

          <div className="rounded-[28px] border border-white/60 bg-white/40 backdrop-blur-xl p-3 shadow-sm">
            <BarChartComponent
              title={t('admin.dashboard.monthlyRevenueChart')}
              data={revenueSeedData}
              dataKey="amount"
              nameKey="month"
              height={330}
              color="#2563EB"
            />
          </div>

          <Panel title={t('admin.dashboard.distributionDetails')} subtitle={t('admin.dashboard.userMix')}>
            <div className="space-y-4">
              {userDistributionData.map((item) => {
                const percent = totalUsers ? Math.round((item.value / totalUsers) * 100) : 0;

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
                        {item.value} {t('admin.common.users')}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${percent}%`, backgroundColor: item.color }}
                      />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{percent}% {t('admin.dashboard.ofTotal')}</p>
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
                title={t('admin.dashboard.performanceRadar')}
                data={performanceRadarData}
                indicators={performanceIndicators}
                height={330}
              />
            </div>

            <div className="rounded-[28px] border border-white/60 bg-white/40 backdrop-blur-xl p-3 shadow-sm">
              <GaugeChartComponent
                title={t('admin.dashboard.capacityUsage')}
                value={occupancyRate}
                height={330}
              />
            </div>
          </div>

          <Panel title={t('admin.dashboard.recentActivity')} subtitle={t('admin.dashboard.adminOperations')}>
            <div className="space-y-4">
              {recentActivitySeed.map((activity) => (
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
                      {activity.amount ? ` - ${activity.amount}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <section className="mt-8">
          <Panel title={t('admin.dashboard.upcomingEvents')} subtitle={t('admin.dashboard.importantDates')}>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {upcomingEventsSeed.map((event) => (
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
