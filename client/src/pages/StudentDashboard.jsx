import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChartComponent, LineChartComponent } from '../components/UIHelper/Chart';
import Card from '../components/UIHelper/Card';
import Avatar from '../components/UIHelper/Avatar';
import Progress from '../components/UIHelper/Progress';
import { formatDate, formatGrade, calculatePercentage } from '../lib/utils';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState(null);
  const [quickStats, setQuickStats] = useState({
    totalCourses: 0,
    attendanceRate: 0,
    assignmentsPending: 0,
    upcomingExams: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Fetch student profile
      const profileRes = await axios.get('http://localhost:5000/api/student/profile', config);
      setStudentProfile(profileRes.data);

      // Fetch courses
      const coursesRes = await axios.get('http://localhost:5000/api/student/courses', config);
      
      // Fetch attendance
      const attendanceRes = await axios.get('http://localhost:5000/api/student/attendance', config);
      
      // Fetch assignments
      const assignmentsRes = await axios.get('http://localhost:5000/api/student/assignments', config);
      
      // Fetch exams
      const examsRes = await axios.get('http://localhost:5000/api/student/exams', config);

      // Calculate stats
      const totalCourses = coursesRes.data?.length || 0;
      const attendanceRecords = attendanceRes.data || [];
      const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
      const attendanceRate = attendanceRecords.length > 0 
        ? Math.round((presentCount / attendanceRecords.length) * 100) 
        : 0;
      const assignmentsPending = assignmentsRes.data?.filter(a => a.status === 'active').length || 0;
      const upcomingExams = examsRes.data?.filter(e => e.status === 'upcoming').length || 0;

      setQuickStats({
        totalCourses,
        attendanceRate,
        assignmentsPending,
        upcomingExams
      });

      // Set attendance chart data
      const monthlyAttendance = {};
      attendanceRecords.forEach(record => {
        const month = new Date(record.date).toLocaleString('default', { month: 'short' });
        if (!monthlyAttendance[month]) {
          monthlyAttendance[month] = { total: 0, present: 0 };
        }
        monthlyAttendance[month].total++;
        if (record.status === 'present') {
          monthlyAttendance[month].present++;
        }
      });
      
      const attendanceChartData = Object.keys(monthlyAttendance).map(month => ({
        month,
        rate: Math.round((monthlyAttendance[month].present / monthlyAttendance[month].total) * 100)
      }));
      setAttendanceData(attendanceChartData);

      // Set upcoming events from exams and assignments
      const events = [
        ...(examsRes.data || []).map(exam => ({
          id: exam._id,
          title: exam.name,
          date: exam.date,
          time: '10:00 AM',
          type: 'exam'
        })),
        ...(assignmentsRes.data || []).map(assignment => ({
          id: assignment._id,
          title: assignment.title,
          course: assignment.subject?.name,
          date: assignment.dueDate,
          time: '11:59 PM',
          type: 'assignment'
        }))
      ].slice(0, 4);
      setUpcomingEvents(events);

      // Set recent activity
      const activities = [
        ...(assignmentsRes.data || []).slice(0, 2).map(a => ({
          id: a._id,
          title: 'Assignment: ' + a.title,
          course: a.subject?.name,
          date: a.dueDate,
          type: 'assignment'
        })),
        ...(attendanceRecords || []).slice(0, 2).map(r => ({
          id: r._id,
          title: `Attendance: ${r.status}`,
          date: r.date,
          type: 'attendance'
        }))
      ];
      setRecentActivity(activities);

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your studies.</p>
      </div>

      <div>
      {/* Student Header */}
      <div className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl p-6 mb-8 text-white">
        <div className="flex items-center">
          <Avatar alt={studentProfile?.userId?.name || 'Student'} size="xl" className="mr-4" />
          <div>
            <h2 className="text-2xl font-bold">{studentProfile?.userId?.name || 'Student'}</h2>
            <p className="text-blue-100">Student ID: {studentProfile?.studentId || 'N/A'}</p>
            <div className="mt-2 flex items-center space-x-4">
              <span className="bg-white bg-opacity-30 px-3 py-1 rounded-full text-sm">{studentProfile?.status || 'Active'}</span>
              <span className="bg-white bg-opacity-30 px-3 py-1 rounded-full text-sm">{studentProfile?.class || 'Class N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.247 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{quickStats.totalCourses}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
              <div className="mt-1">
                <p className="text-2xl font-bold text-gray-900">{quickStats.attendanceRate}%</p>
                <Progress value={quickStats.attendanceRate} max={100} className="mt-2" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 mr-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{quickStats.assignmentsPending}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming Exams</p>
              <p className="text-2xl font-bold text-gray-900">{quickStats.upcomingExams}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Attendance Trend Chart */}
        <Card title="Attendance Trend">
          <BarChartComponent 
            data={attendanceData} 
            dataKey="rate" 
            nameKey="month" 
            title="Monthly Attendance Rate"
          />
        </Card>

        {/* Performance Chart */}
        <Card title="Performance by Subject">
          <LineChartComponent 
            data={performanceData} 
            dataKey="score" 
            nameKey="subject" 
            title="Subject-wise Performance"
          />
        </Card>
      </div>

      {/* Recent Activity and Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card title="Recent Activity">
          <ul className="divide-y divide-gray-200">
            {recentActivity.map(activity => (
              <li key={activity.id} className="py-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {activity.type === 'assignment' && (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                      </div>
                    )}
                    {activity.type === 'exam' && (
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                    )}
                    {activity.type === 'payment' && (
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                    )}
                    {activity.type === 'attendance' && (
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">
                      {activity.course && <span>{activity.course} • </span>}
                      {activity.grade && <span>Grade: {activity.grade} • </span>}
                      {activity.amount && <span>{activity.amount} • </span>}
                      {formatDate(activity.date)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* Upcoming Events */}
        <Card title="Upcoming Events">
          <ul className="divide-y divide-gray-200">
            {upcomingEvents.map(event => (
              <li key={event.id} className="py-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-1">
                    {event.type === 'exam' && (
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                        </svg>
                      </div>
                    )}
                    {event.type === 'assignment' && (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                      </div>
                    )}
                    {event.type === 'quiz' && (
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                    )}
                    {event.type === 'meeting' && (
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                    {event.course && <p className="text-sm text-gray-500">Course: {event.course}</p>}
                    <p className="text-sm text-gray-500">{formatDate(event.date)} at {event.time}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
