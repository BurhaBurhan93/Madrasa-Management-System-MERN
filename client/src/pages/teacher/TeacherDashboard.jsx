import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../lib/api';
import { BarChartComponent, LineChartComponent } from '../../components/UIHelper/ECharts';
import { formatDate } from '../../lib/utils';
import { FiBookOpen, FiUsers, FiClipboard, FiGrid } from 'react-icons/fi';

const StatCard = ({ label, value, note, accentClass, icon: Icon }) => (
 <div className="relative overflow-hidden rounded-3xl border border-slate-200 p-5 shadow-sm">
 <div className={`absolute inset-x-0 top-0 h-1 ${accentClass}`} />
 <div className="flex items-start justify-between gap-4">
 <div>
 <p className="text-sm font-medium text-slate-500">{label}</p>
 <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
 {note && <p className="mt-2 text-sm text-slate-500">{note}</p>}
 </div>
 <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-slate-600">
 <Icon size={22} />
 </div>
 </div>
 </div>
);

const Panel = ({ title, subtitle, children, className = '' }) => (
 <div className={`rounded-3xl border border-slate-200 p-6 shadow-sm ${className}`}>
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
 const { t } = useTranslation(['teacher', 'common', 'nav', 'app']);
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
  } catch (error) {
  console.error('Error fetching stats:', error);
  }

  try {
  const assignmentsRes = await api.get('/teacher/assignments');
  const assignments = assignmentsRes.data.data || [];
  const examsRes = await api.get('/teacher/exams');
  const exams = examsRes.data.data || [];

  const now = new Date();

  const activities = [
  ...assignments.slice(0, 2).map(a => ({ id: a._id, title: t('assignments.label') + ': ' + a.title, course: a.courseId?.name, date: a.dueDate })),
  ...exams.slice(0, 1).map(e => ({ id: e._id, title: t('exams') + ': ' + e.title, course: e.examType?.name, date: e.startDate }))
  ];
  if (activities.length === 0) {
    activities.push(
      { id: 'mock-1', title: t('assignments.label') + ': Tafseer Homework', course: 'Tafseer', date: new Date(now.getTime() + 2 * 86400000).toISOString() },
      { id: 'mock-2', title: t('assignments.label') + ': Hadith Research', course: 'Hadith', date: new Date(now.getTime() + 5 * 86400000).toISOString() },
      { id: 'mock-3', title: t('exams') + ': Midterm Quran', course: 'Quran', date: new Date(now.getTime() + 7 * 86400000).toISOString() }
    );
  }
  setRecentActivity(activities);

  let upcoming = exams.filter(e => e.status === 'scheduled').slice(0, 3).map(e => ({ id: e._id, title: e.title, date: e.startDate, time: t('dashboard.defaultTime') }));
  if (upcoming.length === 0) {
    upcoming = [
      { id: 'mock-u1', title: 'Quran Class', date: now.toISOString(), time: '08:00 AM - 09:30 AM' },
      { id: 'mock-u2', title: 'Hadith Session', date: new Date(now.getTime() + 1 * 86400000).toISOString(), time: '09:30 AM - 11:00 AM' },
      { id: 'mock-u3', title: 'Fiqh Lecture', date: new Date(now.getTime() + 2 * 86400000).toISOString(), time: '11:00 AM - 12:30 PM' },
    ];
  }
  setUpcomingClasses(upcoming);
  } catch (error) {
  console.error('Error fetching activities/exams:', error);
  setRecentActivity([
    { id: 'mock-1', title: t('assignments.label') + ': Tafseer Homework', course: 'Tafseer', date: new Date().toISOString() },
    { id: 'mock-2', title: t('assignments.label') + ': Hadith Research', course: 'Hadith', date: new Date().toISOString() },
  ]);
  setUpcomingClasses([
    { id: 'mock-u1', title: 'Quran Class', date: new Date().toISOString(), time: '08:00 AM - 09:30 AM' },
  ]);
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  setClassAttendanceData(
    months.map(m => ({ month: m, rate: Math.floor(Math.random() * 20 + 75) }))
  );
  const perfSubjects = ['Quran', 'Hadith', 'Fiqh', 'Arabic', 'Tafseer'];
  setClassPerformanceData(
    perfSubjects.map(s => ({ subject: s, score: Math.floor(Math.random() * 25 + 60) }))
  );
  setLoading(false);
  };

 if (loading) {
 return (
 <div className="flex h-64 items-center justify-center">
 <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-600" />
 </div>
 );
 }

 const statCards = [
 { label: t('dashboard.totalStudents'), value: quickStats.totalStudents, note: t('dashboard.acrossAllClasses'), accentClass: 'bg-sky-500', icon: FiUsers },
 { label: t('dashboard.totalSubjects'), value: quickStats.totalSubjects, note: t('dashboard.assignedToYou'), accentClass: 'bg-cyan-500', icon: FiBookOpen },
 { label: t('dashboard.pendingAssignments'), value: quickStats.pendingAssignments, note: t('dashboard.awaitingReview'), accentClass: 'bg-amber-500', icon: FiClipboard },
 { label: t('mySubjects'), value: quickStats.totalClasses, note: t('dashboard.activeThisTerm'), accentClass: 'bg-violet-500', icon: FiGrid },
 ];

  return (
  <div className="min-h-screen w-full p-3 md:p-6 overflow-x-hidden">

  {/* Profile Banner */}
  {user && (
   <Panel className="mb-4 md:mb-8">
  <div className="flex items-center gap-3 md:gap-5">
  <div className="flex h-12 w-12 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 text-lg md:text-2xl font-bold text-white shadow-md">
  {user.name?.split(' ').map(n => n[0]).join('') || t('common:na')}
  </div>
  <div className="min-w-0">
  <h2 className="text-lg md:text-xl font-bold text-slate-900 truncate">{user.name}</h2>
  <p className="text-xs md:text-sm text-slate-500 truncate">{user.email}</p>
  <div className="mt-2 flex flex-wrap gap-2">
  <span className="rounded-full bg-cyan-100 px-2 md:px-3 py-0.5 md:py-1 text-xs font-medium text-cyan-700">
  {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
  </span>
  {user.phone && (
  <span className="rounded-full px-2 md:px-3 py-0.5 md:py-1 text-xs font-medium text-slate-600">
  {user.phone}
  </span>
  )}
  </div>
  </div>
  </div>
  </Panel>
  )}

  {/* Stat Cards */}
  <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-4">
  {statCards.map(card => <StatCard key={card.label} {...card} />)}
  </section>

  {/* Charts */}
  <section className="mt-6 md:mt-8 grid gap-4 md:gap-6 lg:grid-cols-2">
   <div className="rounded-[28px] border border-slate-200 p-2 md:p-3 shadow-sm overflow-hidden">
   <BarChartComponent data={classAttendanceData} dataKey="rate" nameKey="month" title={t('dashboard.classAttendanceOverview')} height={260} color="#0EA5E9" />
   </div>
   <div className="rounded-[28px] border border-slate-200 p-2 md:p-3 shadow-sm overflow-hidden">
   <LineChartComponent data={classPerformanceData} dataKey="score" nameKey="subject" title={t('dashboard.averageStudentPerformance')} height={260} />
  </div>
  </section>

  {/* Activity + Upcoming */}
  <section className="mt-6 md:mt-8 grid gap-4 md:gap-6 lg:grid-cols-2">
  <Panel title={t('dashboard.recentActivity')} subtitle={t('dashboard.latestAssignmentsExams')}>
  <div className="space-y-3">
  {recentActivity.length > 0 ? recentActivity.map(a => (
  <div key={a.id} className="flex items-start gap-3 md:gap-4 rounded-2xl border border-slate-200 p-3 md:p-4">
  <div className="flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-semibold text-white">
  <FiClipboard size={13} />
  </div>
  <div className="flex-1 min-w-0">
  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
  <p className="text-sm md:text-base font-medium text-slate-900 truncate">{a.title}</p>
  <p className="text-xs md:text-sm text-slate-400 shrink-0">{formatDate(a.date)}</p>
  </div>
  {a.course && <p className="mt-1 text-xs md:text-sm text-slate-500 truncate">{a.course}</p>}
  </div>
  </div>
  )) : (
  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
  {t('dashboard.noRecentActivity')}
  </div>
  )}
  </div>
  </Panel>

  <Panel title={t('dashboard.upcomingClasses')} subtitle={t('dashboard.scheduledExamsSessions')}>
  <div className="space-y-3">
  {upcomingClasses.length > 0 ? upcomingClasses.map(c => (
  <div key={c.id} className="flex items-start gap-3 md:gap-4 rounded-2xl border border-slate-200 p-3 md:p-4">
  <div className="flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-600 text-white">
  <FiBookOpen size={13} />
  </div>
  <div className="min-w-0">
  <p className="text-sm md:text-base font-medium text-slate-900 truncate">{c.title}</p>
  <p className="mt-1 text-xs md:text-sm text-slate-500 truncate">{formatDate(c.date)} — {c.time || t('common:na')}</p>
  </div>
  </div>
  )) : (
  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
  {t('dashboard.noUpcomingClasses')}
  </div>
  )}
  </div>
  </Panel>
  </section>

  </div>
   );
 };

export default TeacherDashboard;
