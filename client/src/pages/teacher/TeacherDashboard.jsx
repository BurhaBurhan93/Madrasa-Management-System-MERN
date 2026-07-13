import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../lib/api';
import { BarChartComponent, LineChartComponent } from '../../components/UIHelper/ECharts';
import { formatDate } from '../../lib/utils';
import { FiBookOpen, FiUsers, FiClipboard, FiGrid } from 'react-icons/fi';
import { PANEL_PAGE_BG } from '../../Constatns/pageStyles';

const StatCard = ({ label, value, note, accentClass, icon: Icon }) => (
  <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className={`absolute inset-x-0 top-0 h-1 ${accentClass}`} />
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        {note && <p className="mt-2 text-sm text-slate-500">{note}</p>}
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
        <Icon size={22} />
      </div>
    </div>
  </div>
);

const Panel = ({ title, subtitle, children, className = '' }) => (
  <div className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
    {(title || subtitle) && (
      <div className="mb-5">
        {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
    )}
    {children}
  </div>
);

const TeacherDashboard = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [quickStats, setQuickStats] = useState({ totalSubjects: 0, totalStudents: 0, pendingAssignments: 0, totalClasses: 0 });
  const [classAttendanceData, setClassAttendanceData] = useState([]);
  const [classPerformanceData, setClassPerformanceData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);

  useEffect(() => { fetchUserData(); fetchDashboardData(); }, []);

  const fetchUserData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const res = await api.get(`/users/${userId}`);
        if (res.data.success) setUser(res.data.data);
      }
    } catch (error) { console.error('Error fetching user:', error); }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const statsRes = await api.get('/teacher/dashboard');
      setQuickStats(statsRes.data.data || statsRes.data);

      const assignmentsRes = await api.get('/teacher/assignments');
      const assignments = assignmentsRes.data.data || [];

      const examsRes = await api.get('/teacher/exams');
      const exams = examsRes.data.data || [];

      const activities = [
        ...assignments.slice(0, 2).map(a => ({ id: a._id, title: t('teacher.common.assignments') + ': ' + a.title, course: a.courseId?.name, date: a.dueDate })),
        ...exams.slice(0, 1).map(e => ({ id: e._id, title: t('teacher.common.exams') + ': ' + e.title, course: e.examType?.name, date: e.startDate }))
      ];
      setRecentActivity(activities);

      const upcoming = exams.filter(e => e.status === 'scheduled').slice(0, 3).map(e => ({ id: e._id, title: e.title, date: e.startDate, time: t('teacher.dashboard.defaultTime') }));
      setUpcomingClasses(upcoming);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-600" />
      </div>
    );
  }

  const statCards = [
    { label: t('teacher.dashboard.totalStudents'), value: quickStats.totalStudents, note: t('teacher.dashboard.acrossAllClasses'), accentClass: 'bg-sky-500', icon: FiUsers },
    { label: t('teacher.dashboard.totalSubjects'), value: quickStats.totalSubjects, note: t('teacher.dashboard.assignedToYou'), accentClass: 'bg-cyan-500', icon: FiBookOpen },
    { label: t('teacher.dashboard.pendingAssignments'), value: quickStats.pendingAssignments, note: t('teacher.dashboard.awaitingReview'), accentClass: 'bg-amber-500', icon: FiClipboard },
    { label: t('teacher.common.subjects'), value: quickStats.totalClasses, note: t('teacher.dashboard.activeThisTerm'), accentClass: 'bg-violet-500', icon: FiGrid },
  ];

  return (
    <div className={PANEL_PAGE_BG}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Profile Banner */}
        {user && (
          <Panel className="mb-8 border-cyan-100 bg-[linear-gradient(135deg,#f0fdfa_0%,#ecfeff_45%,#f8fafc_100%)]">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 text-2xl font-bold text-white shadow-md">
                {user.name?.split(' ').map(n => n[0]).join('') || t('common.na')}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                <p className="text-sm text-slate-500">{user.email}</p>
                <div className="mt-2 flex gap-2">
                  <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-700">
                    {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                  </span>
                  {user.phone && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {user.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Panel>
        )}

        {/* Stat Cards */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map(card => <StatCard key={card.label} {...card} />)}
        </section>

        {/* Charts */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
            <BarChartComponent data={classAttendanceData} dataKey="rate" nameKey="month" title={t('teacher.dashboard.classAttendanceOverview')} height={300} color="#0EA5E9" />
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
            <LineChartComponent data={classPerformanceData} dataKey="score" nameKey="subject" title={t('teacher.dashboard.averageStudentPerformance')} height={300} />
          </div>
        </section>

        {/* Activity + Upcoming */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <Panel title={t('teacher.dashboard.recentActivity')} subtitle={t('teacher.dashboard.latestAssignmentsExams')}>
            <div className="space-y-3">
              {recentActivity.length > 0 ? recentActivity.map(a => (
                <div key={a.id} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-xs font-semibold text-white">
                    <FiClipboard size={15} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-medium text-slate-900">{a.title}</p>
                      <p className="text-sm text-slate-400">{formatDate(a.date)}</p>
                    </div>
                    {a.course && <p className="mt-1 text-sm text-slate-500">{a.course}</p>}
                  </div>
                </div>
              )) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                  {t('teacher.dashboard.noRecentActivity')}
                </div>
              )}
            </div>
          </Panel>

          <Panel title={t('teacher.dashboard.upcomingClasses')} subtitle={t('teacher.dashboard.scheduledExamsSessions')}>
            <div className="space-y-3">
              {upcomingClasses.length > 0 ? upcomingClasses.map(c => (
                <div key={c.id} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-600 text-white">
                    <FiBookOpen size={15} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{c.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{formatDate(c.date)} — {c.time || t('common.na')}</p>
                  </div>
                </div>
              )) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                  {t('teacher.dashboard.noUpcomingClasses')}
                </div>
              )}
            </div>
          </Panel>
        </section>

      </div>
    </div>
  );
};

export default TeacherDashboard;
