import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChartComponent, LineChartComponent } from '../../components/UIHelper/Chart';
import Card from '../../components/UIHelper/Card';
import Avatar from '../../components/UIHelper/Avatar';
import { formatDate } from '../../lib/utils';

const TeacherDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [quickStats, setQuickStats] = useState({
    totalSubjects: 0,
    totalStudents: 0,
    pendingAssignments: 0,
    totalClasses: 0
  });
  const [classAttendanceData, setClassAttendanceData] = useState([]);
  const [classPerformanceData, setClassPerformanceData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const statsRes = await axios.get('http://localhost:5000/api/teacher/dashboard', config);
      setQuickStats(statsRes.data);

      const assignmentsRes = await axios.get('http://localhost:5000/api/teacher/assignments', config);
      const assignments = assignmentsRes.data || [];
      
      const examsRes = await axios.get('http://localhost:5000/api/teacher/exams', config);
      const exams = examsRes.data || [];

      const attendanceRes = await axios.get('http://localhost:5000/api/teacher/attendance', config);
      const attendance = attendanceRes.data || [];

      const monthlyAttendance = {};
      attendance.forEach(record => {
        const month = new Date(record.date).toLocaleString('default', { month: 'short' });
        if (!monthlyAttendance[month]) {
          monthlyAttendance[month] = { total: 0, present: 0 };
        }
        monthlyAttendance[month].total++;
        if (record.status === 'present') monthlyAttendance[month].present++;
      });
      
      const attendanceChart = Object.keys(monthlyAttendance).map(month => ({
        month,
        rate: Math.round((monthlyAttendance[month].present / monthlyAttendance[month].total) * 100)
      }));
      setClassAttendanceData(attendanceChart);

      const activities = [
        ...assignments.slice(0, 2).map(a => ({
          id: a._id,
          title: 'Assignment: ' + a.title,
          course: a.subject?.name,
          date: a.dueDate
        })),
        ...exams.slice(0, 1).map(e => ({
          id: e._id,
          title: 'Exam: ' + e.name,
          course: e.subject?.name,
          date: e.date
        }))
      ];
      setRecentActivity(activities);

      const upcoming = exams.filter(e => e.status === 'upcoming').slice(0, 3).map(e => ({
        id: e._id,
        title: e.name,
        date: e.date,
        time: '10:00 AM'
      }));
      setUpcomingClasses(upcoming);

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

      {/* Header */}
      <div className="px-6 py-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Teacher Dashboard
        </h1>
        <p className="text-gray-600">
          Manage your classes and students efficiently.
        </p>
      </div>

      <div className="px-6">

        {/* Teacher Profile */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center">
            <Avatar size="xl" className="mr-4"/>
            <div>
              <h2 className="text-2xl font-bold">Ustad Abdul Rahman</h2>
              <p className="text-green-100">Teacher ID: TCH2024</p>
              <span className="bg-green-400/30 px-3 py-1 rounded-full text-sm">
                Mathematics Department
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          <Card>
            <p className="text-gray-600">Total Subjects</p>
            <p className="text-2xl font-bold">{quickStats.totalSubjects}</p>
          </Card>

          <Card>
            <p className="text-gray-600">Total Students</p>
            <p className="text-2xl font-bold">{quickStats.totalStudents}</p>
          </Card>

          <Card>
            <p className="text-gray-600">Pending Assignments</p>
            <p className="text-2xl font-bold">{quickStats.pendingAssignments}</p>
          </Card>

          <Card>
            <p className="text-gray-600">Total Classes</p>
            <p className="text-2xl font-bold">{quickStats.totalClasses}</p>
          </Card>

        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          <Card title="Class Attendance Overview">
            <BarChartComponent
              data={classAttendanceData}
              dataKey="rate"
              nameKey="month"
            />
          </Card>

          <Card title="Average Student Performance">
            <LineChartComponent
              data={classPerformanceData}
              dataKey="score"
              nameKey="subject"
            />
          </Card>

        </div>

        {/* Activity + Classes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <Card title="Recent Class Activity">
            <ul>
              {recentActivity.map(a => (
                <li key={a.id} className="py-3 border-b">
                  <p className="font-medium">{a.title}</p>
                  <p className="text-sm text-gray-500">
                    {a.student && `${a.student} • `}
                    {a.course} • {formatDate(a.date)}
                  </p>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Upcoming Classes">
            <ul>
              {upcomingClasses.map(c => (
                <li key={c.id} className="py-3 border-b">
                  <p className="font-medium">{c.title}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(c.date)} — {c.time}
                  </p>
                </li>
              ))}
            </ul>
          </Card>

        </div>

      </div>
    </div>
  );
};

export default TeacherDashboard;
