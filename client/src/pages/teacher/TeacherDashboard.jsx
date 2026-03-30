import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChartComponent } from '../../components/UIHelper/Chart';
import Card from '../../components/UIHelper/Card';
import { formatDate } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [quickStats, setQuickStats] = useState({ totalSubjects: 0, totalStudents: 0, pendingAssignments: 0, totalClasses: 0, mySessions: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [subjectChartData, setSubjectChartData] = useState([]);

  useEffect(() => {
    fetchUserData();
    fetchDashboardData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const res = await axios.get(`http://localhost:5000/api/users/${userId}`);
        if (res.data.success) setUser(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [statsRes, assignmentsRes, examsRes, subjectsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/teacher/dashboard', config),
        axios.get('http://localhost:5000/api/teacher/assignments', config),
        axios.get('http://localhost:5000/api/teacher/exams', config),
        axios.get('http://localhost:5000/api/teacher/subjects', config),
      ]);

      setQuickStats(statsRes.data.data || statsRes.data);

      const assignments = assignmentsRes.data.data || [];
      const exams = examsRes.data.data || [];
      const subjects = subjectsRes.data.data || [];

      // Chart — subjects by student count
      setSubjectChartData(subjects.map(s => ({ name: s.name?.substring(0, 10), students: s.students || 0 })));

      // Recent activity
      const activities = [
        ...assignments.slice(0, 3).map(a => ({
          id: a._id,
          title: 'Assignment: ' + a.title,
          course: a.courseId?.name,
          date: a.dueDate,
          type: 'assignment'
        })),
        ...exams.slice(0, 2).map(e => ({
          id: e._id,
          title: 'Exam: ' + e.title,
          course: e.subject?.name,
          date: e.startDate,
          type: 'exam'
        }))
      ];
      setRecentActivity(activities);

      // Upcoming exams
      setUpcomingExams(
        exams.filter(e => e.status === 'published' || e.status === 'draft').slice(0, 3).map(e => ({
          id: e._id,
          title: e.title,
          subject: e.subject?.name,
          date: e.startDate,
          status: e.status
        }))
      );

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen">

      <div className="px-6 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-600">Manage your classes and students efficiently.</p>
      </div>

      <div className="px-6 space-y-8">

        {/* Teacher Profile */}
        {user && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold mr-4">
                  {user.name?.split(' ').map(n => n[0]).join('') || 'T'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <p className="text-green-100">{user.email}</p>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <span className="bg-green-400/30 px-3 py-1 rounded-full text-sm capitalize">{user.role}</span>
                    {user.phone && <span className="bg-green-400/30 px-3 py-1 rounded-full text-sm">📞 {user.phone}</span>}
                  </div>
                </div>
              </div>
              <button onClick={() => navigate('/teacher/profile')} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-all">
                Edit Profile
              </button>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Subjects', value: quickStats.totalSubjects, color: 'text-blue-600', icon: '📚', path: '/teacher/subjects' },
            { label: 'Students', value: quickStats.totalStudents, color: 'text-green-600', icon: '🎓', path: '/teacher/students' },
            { label: 'Assignments', value: quickStats.pendingAssignments, color: 'text-orange-600', icon: '📝', path: '/teacher/assignments' },
            { label: 'Classes', value: quickStats.totalClasses, color: 'text-purple-600', icon: '🏫', path: null },
            { label: 'Sessions', value: quickStats.mySessions, color: 'text-cyan-600', icon: '📅', path: '/teacher/attendance' },
          ].map(stat => (
            <div key={stat.label} onClick={() => stat.path && navigate(stat.path)}
              className={`bg-white rounded-xl shadow p-4 text-center ${stat.path ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}>
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Chart + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Subjects Chart */}
          <Card title="Students per Subject">
            {subjectChartData.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                <p>No subjects data yet</p>
                <button onClick={() => navigate('/teacher/subjects')} className="mt-2 text-green-600 text-sm hover:underline">Add subjects →</button>
              </div>
            ) : (
              <BarChartComponent data={subjectChartData} dataKey="students" nameKey="name" />
            )}
          </Card>

          {/* Quick Actions */}
          <Card title="Quick Actions">
            <div className="grid grid-cols-2 gap-3 p-2">
              {[
                { label: 'Mark Attendance', icon: '✅', path: '/teacher/attendance', color: 'bg-green-50 hover:bg-green-100 text-green-700' },
                { label: 'Create Assignment', icon: '📝', path: '/teacher/create-assignments', color: 'bg-blue-50 hover:bg-blue-100 text-blue-700' },
                { label: 'Create Exam', icon: '📋', path: '/teacher/exams/create', color: 'bg-purple-50 hover:bg-purple-100 text-purple-700' },
                { label: 'Enter Marks', icon: '🎯', path: '/teacher/results/enter-marks', color: 'bg-orange-50 hover:bg-orange-100 text-orange-700' },
                { label: 'View Results', icon: '📊', path: '/teacher/results/view-results', color: 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700' },
                { label: 'Complaints', icon: '📣', path: '/teacher/complaints', color: 'bg-red-50 hover:bg-red-100 text-red-700' },
              ].map(action => (
                <button key={action.label} onClick={() => navigate(action.path)}
                  className={`${action.color} p-3 rounded-xl text-left transition-all`}>
                  <div className="text-xl mb-1">{action.icon}</div>
                  <div className="text-sm font-medium">{action.label}</div>
                </button>
              ))}
            </div>
          </Card>

        </div>

        {/* Recent Activity + Upcoming Exams */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <Card title="Recent Activity">
            {recentActivity.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                <p>No recent activity</p>
                <p className="text-sm mt-1">Create assignments or exams to see activity here</p>
              </div>
            ) : (
              <ul className="divide-y">
                {recentActivity.map(a => (
                  <li key={a.id} className="py-3 flex items-start gap-3">
                    <span className="text-lg">{a.type === 'assignment' ? '📝' : '📋'}</span>
                    <div>
                      <p className="font-medium text-sm">{a.title}</p>
                      <p className="text-xs text-gray-500">{a.course} {a.date ? `• ${formatDate(a.date)}` : ''}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Upcoming Exams">
            {upcomingExams.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                <p>No upcoming exams</p>
                <button onClick={() => navigate('/teacher/exams/create')} className="mt-2 text-green-600 text-sm hover:underline">Create an exam →</button>
              </div>
            ) : (
              <ul className="divide-y">
                {upcomingExams.map(e => (
                  <li key={e.id} onClick={() => navigate(`/teacher/exams/${e.id}`)}
                    className="py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 px-2 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{e.title}</p>
                      <p className="text-xs text-gray-500">{e.subject} {e.date ? `• ${formatDate(e.date)}` : ''}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${e.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {e.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

        </div>

      </div>
    </div>
  );
};

export default TeacherDashboard;
