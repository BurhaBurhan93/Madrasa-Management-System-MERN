import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChartComponent, LineChartComponent } from '../../components/UIHelper/ECharts';
import { formatDate } from '../../lib/utils';
import { FiBookOpen, FiUsers, FiClipboard, FiGrid } from 'react-icons/fi';

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
        const res = await axios.get(`http://localhost:5000/api/users/${userId}`);
        if (res.data.success) setUser(res.data.data);
      }
    } catch (error) { console.error('Error fetching user:', error); }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const statsRes = await axios.get('http://localhost:5000/api/teacher/dashboard', config);
      setQuickStats(statsRes.data.data || statsRes.data);

      const assignmentsRes = await axios.get('http://localhost:5000/api/teacher/assignments', config);
      const assignments = assignmentsRes.data.data || [];

      const examsRes = await axios.get('http://localhost:5000/api/teacher/exams', config);
      const exams = examsRes.data.data || [];

      const activities = [
        ...assignments.slice(0, 2).map(a => ({ id: a._id, title: 'Assignment: ' + a.title, course: a.courseId?.name, date: a.dueDate })),
        ...exams.slice(0, 1).map(e => ({ id: e._id, title: 'Exam: ' + e.title, course: e.examType?.name, date: e.startDate }))
      ];
      setRecentActivity(activities);

      const upcoming = exams.filter(e => e.status === 'scheduled').slice(0, 3).map(e => ({ id: e._id, title: e.title, date: e.startDate, time: '10:00 AM' }));
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
    { label: 'Total Subjects', value: quickStats.totalSubjects, note: 'Assigned to you', accentClass: 'bg-cyan-500', icon: FiBookOpen },
    { label: 'Total Students', value: quickStats.totalStudents, note: 'Across all classes', accentClass: 'bg-sky-500', icon: FiUsers },
    { label: 'Pending Assignments', value: quickStats.pendingAssignments, note: 'Awaiting review', accentClass: 'bg-amber-500', icon: FiClipboard },
    { label: 'Total Classes', value: quickStats.totalClasses, note: 'Active this term', accentClass: 'bg-violet-500', icon: FiGrid },
  ];

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef7f7_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Profile Banner */}
        {user && (
          <Panel className="mb-8 border-cyan-100 bg-[linear-gradient(135deg,#f0fdfa_0%,#ecfeff_45%,#f8fafc_100%)]">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 text-2xl font-bold text-white shadow-md">
                {user.name?.split(' ').map(n => n[0]).join('') || 'T'}
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
            <BarChartComponent data={classAttendanceData} dataKey="rate" nameKey="month" title="Class Attendance Overview" height={300} color="#0EA5E9" />
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
            <LineChartComponent data={classPerformanceData} dataKey="score" nameKey="subject" title="Average Student Performance" height={300} />
          </div>
        </section>

        {/* Activity + Upcoming */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <Panel title="Recent Class Activity" subtitle="Latest assignments and exams">
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
                  No recent activity available yet.
                </div>
              )}
            </div>
          </Panel>

          <Panel title="Upcoming Classes" subtitle="Scheduled exams and sessions">
            <div className="space-y-3">
              {upcomingClasses.length > 0 ? upcomingClasses.map(c => (
                <div key={c.id} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-600 text-white">
                    <FiBookOpen size={15} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{c.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{formatDate(c.date)} — {c.time}</p>
                  </div>
                </div>
              )) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                  No upcoming classes scheduled.
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
