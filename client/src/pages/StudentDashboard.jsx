import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiBook, 
  FiCheckCircle, 
  FiClock, 
  FiCalendar, 
  FiActivity, 
  FiAward, 
  FiCreditCard, 
  FiUser,
  FiBookOpen,
  FiEdit,
  FiTrendingUp,
  FiFileText,
  FiArrowRight,
  FiDollarSign,
  FiAlertCircle
} from 'react-icons/fi';
import { 
  BarChartComponent, 
  LineChartComponent, 
  PieChartComponent 
} from '../components/UIHelper/ECharts';
import Card from '../components/UIHelper/Card';
import Progress from '../components/UIHelper/Progress';
import { PageSkeleton } from '../components/UIHelper/SkeletonLoader';
import { formatDate } from '../lib/utils';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [quickStats, setQuickStats] = useState({
    totalCourses: 0,
    attendanceRate: 0,
    assignmentsPending: 0,
    upcomingExams: 0,
    gpa: 0.0,
    totalFees: 0,
    paidFees: 0,
    pendingFees: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [feeData, setFeeData] = useState([]);
  const [courseDistribution, setCourseDistribution] = useState([]);
  const [leaveStats, setLeaveStats] = useState([]);

  useEffect(() => {
    fetchUserData();
    fetchDashboardData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const res = await axios.get(`${API_BASE}/users/${userId}`);
        if (res.data.success) {
          setUser(res.data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Fetch student profile
      try {
        const profileRes = await axios.get(`${API_BASE}/student/profile`, config);
        setStudentProfile(profileRes.data);
      } catch (err) {
        // Profile fetch failed, using default
      }

      // Fetch courses
      let coursesData = [];
      try {
        const coursesRes = await axios.get(`${API_BASE}/student/courses`, config);
        coursesData = coursesRes.data || [];
      } catch (err) {
        // Courses fetch failed
      }
      
      // Fetch attendance
      let attendanceData = [];
      try {
        const attendanceRes = await axios.get(`${API_BASE}/student/attendance`, config);
        attendanceData = attendanceRes.data || [];
      } catch (err) {
        // Attendance fetch failed
      }
      
      // Fetch assignments
      let assignmentsData = [];
      try {
        const assignmentsRes = await axios.get(`${API_BASE}/student/assignments`, config);
        assignmentsData = assignmentsRes.data || [];
      } catch (err) {
        // Assignments fetch failed
      }
      
      // Fetch exams
      let examsData = [];
      try {
        const examsRes = await axios.get(`${API_BASE}/student/exams`, config);
        examsData = examsRes.data || [];
      } catch (err) {
        // Exams fetch failed
      }

      // Fetch fee data
      let feeData = [];
      try {
        const feesRes = await axios.get(`${API_BASE}/student/fees`, config);
        feeData = feesRes.data || [];
      } catch (err) {
        // Fees fetch failed
      }

      // Calculate stats
      const totalCourses = coursesData.length || 0;
      const presentCount = attendanceData.filter(r => r.status === 'present').length;
      const attendanceRate = attendanceData.length > 0 
        ? Math.round((presentCount / attendanceData.length) * 100) 
        : 0;
      const assignmentsPending = assignmentsData.filter(a => !a.submitted || a.status === 'active' || a.status === 'pending').length || 0;
      const upcomingExams = examsData.filter(e => e.status === 'upcoming' || e.status === 'published').length || 0;

      // Calculate fee stats
      const totalFees = feeData.reduce((sum, fee) => sum + (fee.totalAmount || fee.amount || 0), 0);
      const paidFees = feeData.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);
      const pendingFees = totalFees - paidFees;

      setQuickStats({
        totalCourses,
        attendanceRate,
        assignmentsPending,
        upcomingExams,
        gpa: 3.5, // Will be calculated from results
        totalFees,
        paidFees,
        pendingFees
      });

      // Set attendance chart data
      const monthlyAttendance = {};
      attendanceData.forEach(record => {
        const date = new Date(record.date || record.createdAt);
        const month = date.toLocaleString('default', { month: 'short' });
        if (!monthlyAttendance[month]) {
          monthlyAttendance[month] = { total: 0, present: 0 };
        }
        monthlyAttendance[month].total++;
        if (record.status === 'present' || record.status === 'late') {
          monthlyAttendance[month].present++;
        }
      });
      
      const attendanceChartData = Object.keys(monthlyAttendance).map(month => ({
        month,
        rate: Math.round((monthlyAttendance[month].present / monthlyAttendance[month].total) * 100)
      }));
      setAttendanceData(attendanceChartData.length > 0 ? attendanceChartData : []);

      // Set upcoming events
      const events = [
        ...examsData.map(exam => ({
          id: exam._id || exam.id,
          title: exam.title,
          date: exam.startDate || exam.publishDate || exam.date,
          time: exam.startTime || '10:00 AM',
          type: 'exam'
        })),
        ...assignmentsData.filter(a => !a.submitted || a.status === 'active').map(assignment => ({
          id: assignment._id,
          title: assignment.title,
          course: assignment.subject?.name || assignment.courseId?.name,
          date: assignment.dueDate,
          time: '11:59 PM',
          type: 'assignment'
        }))
      ].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 4);
      setUpcomingEvents(events);

      // Set recent activity
      const activities = [
        ...assignmentsData.slice(0, 2).map(a => ({
          id: a._id,
          title: 'Assignment: ' + a.title,
          course: a.subject?.name || a.courseId?.name,
          date: a.dueDate || a.createdAt,
          type: 'assignment'
        })),
        ...attendanceData.slice(0, 2).map(r => ({
          id: r._id,
          title: `Attendance: ${r.status.charAt(0).toUpperCase() + r.status.slice(1)}`,
          date: r.date || r.createdAt,
          type: 'attendance'
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentActivity(activities);

      // Set performance data - from exam results or course grades
      const performanceChartData = [];
      
      // Try to get from exam results
      try {
        const resultsRes = await axios.get(`${API_BASE}/student/results`, config);
        const resultsData = resultsRes.data || [];
        resultsData.forEach(result => {
          if (result.score || result.percentage) {
            performanceChartData.push({
              subject: result.exam?.title?.substring(0, 15) || 'Exam',
              score: result.score || result.percentage
            });
          }
        });
      } catch (err) {
        // Could not fetch exam results for dashboard
      }
      
      // Fallback to course data if no exam results
      if (performanceChartData.length === 0) {
        coursesData.forEach(course => {
          if (course.grade || course.progress) {
            performanceChartData.push({
              subject: course.name?.substring(0, 15) || 'Course',
              score: course.grade?.score || course.progress || 0
            });
          }
        });
      }
      
      setPerformanceData(performanceChartData);

      // Set course distribution
      const courseTypes = {};
      coursesData.forEach(course => {
        const type = course.type || course.category || 'Core';
        courseTypes[type] = (courseTypes[type] || 0) + 1;
      });
      const courseDistData = Object.keys(courseTypes).map((type, idx) => ({
        name: type,
        value: courseTypes[type]
      }));
      setCourseDistribution(courseDistData.length > 0 ? courseDistData : []);

      // Set fee payment data for chart
      const feeChartData = feeData.map(fee => ({
        name: fee.title || fee.type || 'Fee',
        total: fee.totalAmount || fee.amount || 0,
        paid: fee.paidAmount || 0,
        pending: (fee.totalAmount || fee.amount || 0) - (fee.paidAmount || 0)
      }));
      setFeeData(feeChartData.length > 0 ? feeChartData : []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageSkeleton variant="dashboard" />;
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">Overview</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Student Dashboard</h1>
          <p className="text-slate-500 mt-1 font-medium">Welcome back, {user?.name || 'Student'}!</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Session</p>
            <p className="text-sm font-black text-slate-900">2023-2024 Academic Year</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-600">
            <FiCalendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Student Profile Summary Card */}
      {user && (
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl shadow-slate-200/50 group">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="h-24 w-24 rounded-[32px] bg-gradient-to-tr from-cyan-400 to-blue-500 p-1 shadow-xl">
                <div className="h-full w-full rounded-[30px] bg-slate-900 flex items-center justify-center text-3xl font-black text-white">
                  {user.name?.split(' ').map(n => n[0]).join('') || 'S'}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-emerald-500 border-4 border-slate-900 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
              </div>
            </div>
            
            <div className="text-center md:text-left flex-1">
              <h2 className="text-3xl font-black tracking-tight mb-2">{user.name}</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-400 font-bold text-xs uppercase tracking-widest">
                <span className="flex items-center gap-2"><FiUser className="text-cyan-400" /> Student ID: {studentProfile?.studentId || 'N/A'}</span>
                <span className="flex items-center gap-2"><FiActivity className="text-cyan-400" /> Status: Active</span>
                <span className="flex items-center gap-2"><FiAward className="text-cyan-400" /> Class: {studentProfile?.class?.name || 'Assigned'}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => navigate('/student/profile')}
                className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 font-black text-sm transition-all"
              >
                View Profile
              </button>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl"></div>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Courses', value: quickStats.totalCourses, icon: <FiBookOpen />, color: 'blue', path: '/student/courses' },
          { label: 'Attendance Rate', value: `${quickStats.attendanceRate}%`, icon: <FiCheckCircle />, color: 'emerald', path: '/student/attendance' },
          { label: 'Pending Tasks', value: quickStats.assignmentsPending, icon: <FiEdit />, color: 'amber', path: '/student/assignments' },
          { label: 'Upcoming Exams', value: quickStats.upcomingExams, icon: <FiTrendingUp />, color: 'rose', path: '/student/exams' }
        ].map((stat, i) => (
          <button 
            key={i} 
            onClick={() => navigate(stat.path)}
            className="group p-6 bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-cyan-100 hover:-translate-y-1 transition-all text-left"
          >
            <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900">{stat.value}</p>
          </button>
        ))}
      </div>

      {/* Fee Summary Section */}
      {(quickStats.totalFees > 0 || quickStats.paidFees > 0 || quickStats.pendingFees > 0) && (
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Fee Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-[32px] p-6 border border-blue-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-2xl">
                  <FiDollarSign />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Total Fees</p>
                  <p className="text-2xl font-black text-blue-900">${quickStats.totalFees.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-[32px] p-6 border border-emerald-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl">
                  <FiCheckCircle />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Paid</p>
                  <p className="text-2xl font-black text-emerald-900">${quickStats.paidFees.toLocaleString()}</p>
                </div>
              </div>
              <div className="w-full bg-white/50 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all" 
                  style={{ width: `${quickStats.totalFees > 0 ? (quickStats.paidFees / quickStats.totalFees) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-[32px] p-6 border border-amber-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl">
                  <FiAlertCircle />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">Pending</p>
                  <p className="text-2xl font-black text-amber-900">${quickStats.pendingFees.toLocaleString()}</p>
                </div>
              </div>
              {quickStats.pendingFees > 0 && (
                <Badge variant="warning" className="text-xs">Payment Due</Badge>
              )}
            </div>
          </div>

          {/* Fee Payment Chart */}
          {feeData.length > 0 && (
            <Card title="Fee Payment Breakdown" className="rounded-[32px] p-8">
              <BarChartComponent 
                data={feeData} 
                dataKey="paid" 
                nameKey="name" 
                height={300}
                colors={['#10b981', '#f59e0b']}
                series={[{ dataKey: 'paid', name: 'Paid' }, { dataKey: 'pending', name: 'Pending' }]}
              />
            </Card>
          )}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card title="Attendance Trend" className="rounded-[32px] p-8">
              {attendanceData.length > 0 ? (
                <BarChartComponent 
                  data={attendanceData} 
                  dataKey="rate" 
                  nameKey="month" 
                  height={250}
                />
              ) : (
                <div className="h-[250px] flex flex-col items-center justify-center text-slate-300">
                  <FiActivity className="w-12 h-12 mb-4" />
                  <p className="font-bold text-sm">No attendance records yet</p>
                </div>
              )}
            </Card>

            <Card title="Academic Performance" className="rounded-[32px] p-8">
              {performanceData.length > 0 ? (
                <LineChartComponent 
                  data={performanceData} 
                  dataKey="score" 
                  nameKey="subject" 
                  height={250}
                />
              ) : (
                <div className="h-[250px] flex flex-col items-center justify-center text-slate-300">
                  <FiTrendingUp className="w-12 h-12 mb-4" />
                  <p className="font-bold text-sm">No performance data yet</p>
                </div>
              )}
            </Card>
          </div>

          <Card title="Recent Activity" className="rounded-[32px] p-8">
            <div className="space-y-6">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-cyan-200 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                        activity.type === 'assignment' ? 'bg-blue-100 text-blue-600' : 
                        activity.type === 'attendance' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {activity.type === 'assignment' ? <FiEdit /> : <FiCheckCircle />}
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{activity.title}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          {activity.course || 'General'} • {formatDate(activity.date)}
                        </p>
                      </div>
                    </div>
                    <FiArrowRight className="text-slate-300" />
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-400 py-8 font-medium italic">No recent activity to show</p>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Side Panels */}
        <div className="space-y-8">
          <Card title="Upcoming Events" className="rounded-[32px] p-8">
            <div className="space-y-6">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, i) => (
                  <div key={i} className="group relative pl-6 border-l-2 border-slate-100 hover:border-cyan-500 transition-colors py-1">
                    <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-200 group-hover:bg-cyan-500 transition-colors"></div>
                    <p className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em] mb-1">{event.type}</p>
                    <p className="font-black text-slate-900 leading-tight mb-1">{event.title}</p>
                    <p className="text-xs font-bold text-slate-400">{formatDate(event.date)} • {event.time}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FiClock className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No upcoming events</p>
                </div>
              )}
              <button 
                onClick={() => navigate('/student/schedule')}
                className="w-full mt-4 py-4 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
              >
                View Full Schedule
              </button>
            </div>
          </Card>

          <Card title="Course Progress" className="rounded-[32px] p-8">
            <div className="space-y-6">
              {courseDistribution.length > 0 ? (
                courseDistribution.map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <p className="text-sm font-black text-slate-900">{item.name}</p>
                      <p className="text-xs font-bold text-slate-400">{item.value} Courses</p>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full" 
                        style={{ width: `${(item.value / quickStats.totalCourses) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-400 py-4 font-medium italic">No course data available</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Data Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Courses Table */}
        <Card title="Enrolled Courses" className="rounded-[32px] p-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Course</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Progress</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courseDistribution.length > 0 ? (
                  courseDistribution.slice(0, 5).map((course, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 text-sm">{course.name}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(course.value * 20, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mt-1">{course.value} courses</p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="success">Active</Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-slate-400 font-medium italic">
                      No courses enrolled yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <button 
            onClick={() => navigate('/student/courses')}
            className="w-full mt-4 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            View All Courses
          </button>
        </Card>

        {/* Recent Attendance Table */}
        <Card title="Recent Attendance" className="rounded-[32px] p-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceData.length > 0 ? (
                  attendanceData.slice(0, 5).map((record, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 text-sm">{record.month || 'N/A'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={record.rate >= 75 ? 'success' : record.rate >= 50 ? 'warning' : 'danger'}
                        >
                          {record.rate}% Present
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-slate-600 font-medium">{record.rate >= 75 ? 'On Time' : 'Late'}</p>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-slate-400 font-medium italic">
                      No attendance records yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <button 
            onClick={() => navigate('/student/attendance')}
            className="w-full mt-4 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            View Full Attendance
          </button>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
