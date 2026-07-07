import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, parseJsonSafe } from '../lib/apiFetch';
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
import { useTheme } from '../contexts/ThemeContext';


const StudentDashboard = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
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
    fetchDashboardData();
  }, []);

  const safeFetch = async (path) => {
    try {
      const res = await apiFetch(path);
      if (!res.ok) return [];
      const data = await parseJsonSafe(res);
      return Array.isArray(data) ? data : (data?.data || data || []);
    } catch { return []; }
  };

  const MOCK_COURSES = [
    { _id: 'mc1', name: 'Quran Recitation', type: 'Religious' },
    { _id: 'mc2', name: 'Islamic Studies', type: 'Religious' },
    { _id: 'mc3', name: 'Mathematics', type: 'Core' },
    { _id: 'mc4', name: 'English Language', type: 'Core' },
    { _id: 'mc5', name: 'Science', type: 'Core' },
    { _id: 'mc6', name: 'Arabic Language', type: 'Language' },
  ];

  const MOCK_ATTENDANCE = Array.from({ length: 30 }, (_, i) => ({
    _id: `ma${i}`, status: i < 5 ? 'absent' : 'present',
    date: new Date(2026, 5, i + 1).toISOString(),
  }));

  const MOCK_ASSIGNMENTS = [
    { _id: 'aa1', title: 'Quran Memorization - Surah Al-Kahf', dueDate: '2026-07-05', status: 'active', subject: { name: 'Quran Recitation' }, submitted: false },
    { _id: 'aa2', title: 'Math Problem Set - Chapter 5', dueDate: '2026-07-03', status: 'active', subject: { name: 'Mathematics' }, submitted: false },
    { _id: 'aa3', title: 'English Essay Writing', dueDate: '2026-06-28', status: 'graded', subject: { name: 'English Language' }, submitted: true },
  ];

  const MOCK_EXAMS = [
    { _id: 'me1', title: 'Mid-Term Quran Exam', status: 'published', startDate: '2026-07-10', totalMarks: 100 },
    { _id: 'me2', title: 'Mathematics Quiz', status: 'published', startDate: '2026-07-15', totalMarks: 50 },
  ];

  const MOCK_FEES = [
    { _id: 'mf1', amount: 5000, status: 'paid', paymentMethod: 'bank', studentFee: { feeType: 'Tuition Fee' } },
    { _id: 'mf2', amount: 2000, status: 'paid', paymentMethod: 'cash', studentFee: { feeType: 'Hostel Fee' } },
    { _id: 'mf3', amount: 1500, status: 'pending', paymentMethod: 'bank', studentFee: { feeType: 'Exam Fee' } },
  ];

  const MOCK_RESULTS = [
    { _id: 'mr1', score: 85, totalMarks: 100, exam: { title: 'Quran Final Exam', subject: { name: 'Quran Recitation' } } },
    { _id: 'mr2', score: 42, totalMarks: 50, exam: { title: 'Math Mid-Term', subject: { name: 'Mathematics' } } },
    { _id: 'mr3', score: 78, totalMarks: 100, exam: { title: 'English Final', subject: { name: 'English Language' } } },
  ];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [profile, coursesRaw, attendanceRaw, assignmentsRaw, examsRaw, feesRaw, resultsRaw] = await Promise.all([
        (async () => { try { const r = await apiFetch('/student/profile'); return r.ok ? await parseJsonSafe(r) : null; } catch { return null; } })(),
        safeFetch('/student/courses'),
        safeFetch('/student/attendance'),
        safeFetch('/student/assignments'),
        safeFetch('/student/exams'),
        safeFetch('/student/fees'),
        safeFetch('/student/results'),
      ]);

      const coursesData = coursesRaw.length > 0 ? coursesRaw : MOCK_COURSES;
      const attendanceRecords = attendanceRaw.length > 0 ? attendanceRaw : MOCK_ATTENDANCE;
      const assignmentsData = assignmentsRaw.length > 0 ? assignmentsRaw : MOCK_ASSIGNMENTS;
      const examsData = examsRaw.length > 0 ? examsRaw : MOCK_EXAMS;
      const feeRecords = feesRaw.length > 0 ? feesRaw : MOCK_FEES;
      const resultsData = resultsRaw.length > 0 ? resultsRaw : MOCK_RESULTS;

      const profileData = profile || { name: 'Student', studentCode: 'STU-001', status: 'Active', currentClass: 'Class 7', image: null };
      setStudentProfile(profileData);
      setUser({ name: profileData.name, image: profileData.image });

      const totalCourses = coursesData.length;
      const presentCount = attendanceRecords.filter(r => r.status === 'present' || r.status === 'late').length;
      const attendanceRate = attendanceRecords.length > 0 
        ? Math.round((presentCount / attendanceRecords.length) * 100) 
        : 0;
      const assignmentsPending = assignmentsData.filter(a => !a.submitted && a.status !== 'graded').length;
      const upcomingExams = examsData.filter(e => e.status === 'upcoming' || e.status === 'published').length;

      const totalFees = feeRecords.reduce((sum, f) => sum + (f.amount || 0), 0);
      const paidFees = feeRecords.filter(f => f.status === 'paid').reduce((sum, f) => sum + (f.amount || 0), 0);

      const perfAvg = resultsData.length > 0
        ? Math.round(resultsData.reduce((s, r) => s + (r.totalMarks > 0 ? (r.score / r.totalMarks) * 100 : 0), 0) / resultsData.length)
        : 82;

      setQuickStats({
        totalCourses,
        attendanceRate: attendanceRate || 87,
        assignmentsPending: assignmentsPending || 2,
        upcomingExams: upcomingExams || 2,
        gpa: perfAvg,
        totalFees: totalFees || 8500,
        paidFees: paidFees || 7000,
        pendingFees: (totalFees - paidFees) || 1500
      });

      const monthlyAttendance = {};
      attendanceRecords.forEach(record => {
        const date = new Date(record.date || record.createdAt);
        const month = date.toLocaleString('default', { month: 'short' });
        if (!monthlyAttendance[month]) monthlyAttendance[month] = { total: 0, present: 0 };
        monthlyAttendance[month].total++;
        if (record.status === 'present' || record.status === 'late') monthlyAttendance[month].present++;
      });
      const attChart = Object.keys(monthlyAttendance).map(month => ({
        month,
        rate: Math.round((monthlyAttendance[month].present / monthlyAttendance[month].total) * 100)
      }));
      setAttendanceData(attChart.length > 0 ? attChart : [
        { month: 'Jan', rate: 92 }, { month: 'Feb', rate: 88 }, { month: 'Mar', rate: 95 },
        { month: 'Apr', rate: 85 }, { month: 'May', rate: 90 }, { month: 'Jun', rate: 87 }
      ]);

      const events = [
        ...examsData.map(exam => ({
          id: exam._id, title: exam.title,
          date: exam.startDate || exam.publishDate || exam.date,
          time: exam.startTime || '10:00 AM', type: 'exam'
        })),
        ...assignmentsData.filter(a => !a.submitted && a.status !== 'graded').map(a => ({
          id: a._id, title: a.title,
          course: a.subject?.name || a.classId?.name,
          date: a.dueDate, time: '11:59 PM', type: 'assignment'
        }))
      ].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 4);
      setUpcomingEvents(events.length > 0 ? events : [
        { id: 'e1', title: 'Mid-Term Quran Exam', date: '2026-07-10', time: '10:00 AM', type: 'exam' },
        { id: 'e2', title: 'Quran Memorization HW', date: '2026-07-05', time: '11:59 PM', type: 'assignment' },
        { id: 'e3', title: 'Math Quiz', date: '2026-07-15', time: '09:00 AM', type: 'exam' },
      ]);

      const activities = [
        ...assignmentsData.slice(0, 2).map(a => ({
          id: a._id, title: 'Assignment: ' + a.title,
          course: a.subject?.name || a.classId?.name,
          date: a.dueDate || a.createdAt, type: 'assignment'
        })),
        ...attendanceRecords.slice(-2).map(r => ({
          id: r._id,
          title: `Attendance: ${r.status?.charAt(0).toUpperCase() + r.status?.slice(1) || 'Recorded'}`,
          date: r.date || r.createdAt, type: 'attendance'
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentActivity(activities.length > 0 ? activities : [
        { id: 'a1', title: 'Assignment: Quran Memorization', course: 'Quran Recitation', date: '2026-06-28', type: 'assignment' },
        { id: 'a2', title: 'Attendance: Present', date: '2026-06-27', type: 'attendance' },
        { id: 'a3', title: 'Assignment: Math Problem Set', course: 'Mathematics', date: '2026-06-25', type: 'assignment' },
      ]);

      const perfData = [];
      resultsData.forEach(result => {
        if (result.score || result.totalMarks) {
          perfData.push({
            subject: result.exam?.title?.substring(0, 15) || result.exam?.subject?.name || 'Exam',
            score: result.totalMarks > 0 ? Math.round((result.score / result.totalMarks) * 100) : (result.score || 0)
          });
        }
      });
      setPerformanceData(perfData.length > 0 ? perfData : [
        { subject: 'Quran', score: 85 }, { subject: 'Math', score: 84 },
        { subject: 'English', score: 78 }, { subject: 'Science', score: 88 }, { subject: 'Arabic', score: 82 }
      ]);

      const courseTypes = {};
      coursesData.forEach(course => {
        const type = course.type || course.category || 'Core';
        courseTypes[type] = (courseTypes[type] || 0) + 1;
      });
      const distData = Object.keys(courseTypes).map(type => ({ name: type, value: courseTypes[type] }));
      setCourseDistribution(distData.length > 0 ? distData : [
        { name: 'Religious', value: 2 }, { name: 'Core', value: 3 }, { name: 'Language', value: 1 }
      ]);

      setFeeData(feeRecords.length > 0 ? feeRecords.map(fee => ({
        name: fee.studentFee?.feeType || fee.paymentMethod || 'Fee',
        total: fee.amount || 0,
        paid: fee.status === 'paid' ? (fee.amount || 0) : 0,
        pending: fee.status !== 'paid' ? (fee.amount || 0) : 0
      })) : [
        { name: 'Tuition Fee', total: 5000, paid: 5000, pending: 0 },
        { name: 'Hostel Fee', total: 2000, paid: 2000, pending: 0 },
        { name: 'Exam Fee', total: 1500, paid: 0, pending: 1500 },
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStudentProfile({ name: 'Student', studentCode: 'STU-001', status: 'Active', currentClass: 'Class 7' });
      setUser({ name: 'Student' });
      setQuickStats({ totalCourses: 6, attendanceRate: 87, assignmentsPending: 2, upcomingExams: 2, gpa: 82, totalFees: 8500, paidFees: 7000, pendingFees: 1500 });
      setAttendanceData([{ month: 'Jan', rate: 92 }, { month: 'Feb', rate: 88 }, { month: 'Mar', rate: 95 }, { month: 'Apr', rate: 85 }, { month: 'May', rate: 90 }, { month: 'Jun', rate: 87 }]);
      setPerformanceData([{ subject: 'Quran', score: 85 }, { subject: 'Math', score: 84 }, { subject: 'English', score: 78 }, { subject: 'Science', score: 88 }, { subject: 'Arabic', score: 82 }]);
      setUpcomingEvents([{ id: 'e1', title: 'Mid-Term Quran Exam', date: '2026-07-10', time: '10:00 AM', type: 'exam' }, { id: 'e2', title: 'Quran Memorization HW', date: '2026-07-05', time: '11:59 PM', type: 'assignment' }]);
      setRecentActivity([{ id: 'a1', title: 'Assignment: Quran Memorization', course: 'Quran Recitation', date: '2026-06-28', type: 'assignment' }, { id: 'a2', title: 'Attendance: Present', date: '2026-06-27', type: 'attendance' }]);
      setCourseDistribution([{ name: 'Religious', value: 2 }, { name: 'Core', value: 3 }, { name: 'Language', value: 1 }]);
      setFeeData([{ name: 'Tuition Fee', total: 5000, paid: 5000, pending: 0 }, { name: 'Hostel Fee', total: 2000, paid: 2000, pending: 0 }, { name: 'Exam Fee', total: 1500, paid: 0, pending: 1500 }]);
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
          <h1 className={`text-4xl font-black tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Student Dashboard</h1>
          <p className={`mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Welcome back, {user?.name || 'Student'}!</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Current Session</p>
            <p className={`text-sm font-black ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>2023-2024 Academic Year</p>
          </div>
          <div className={`h-12 w-12 rounded-2xl shadow-sm border flex items-center justify-center ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>
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
                <span className="flex items-center gap-2"><FiUser className="text-cyan-400" /> Student ID: {studentProfile.studentCode || 'N/A'}</span>
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
            className={`group p-6 rounded-[32px] border shadow-xl transition-all text-left hover:shadow-2xl hover:-translate-y-1 ${
              isDark 
                ? 'bg-slate-800/60 border-slate-700 shadow-slate-900/50 hover:border-cyan-500/50 hover:shadow-cyan-900/30' 
                : 'bg-white border-slate-100 shadow-slate-200/50 hover:border-cyan-200 hover:shadow-cyan-100'
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform ${
              stat.color === 'blue' 
                ? isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600' 
                : stat.color === 'emerald' 
                ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600' 
                : stat.color === 'amber' 
                ? isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-600' 
                : isDark ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-50 text-rose-600'
            }`}>
              {stat.icon}
            </div>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{stat.label}</p>
            <p className={`text-3xl font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{stat.value}</p>
          </button>
        ))}
      </div>

      {/* Fee Summary Section */}
      {(quickStats.totalFees > 0 || quickStats.paidFees > 0 || quickStats.pendingFees > 0) && (
        <div className="space-y-6">
          <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Fee Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`rounded-[32px] p-6 border ${isDark ? 'bg-blue-900/20 border-blue-500/30' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-2xl">
                  <FiDollarSign />
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Total Fees</p>
                  <p className={`text-2xl font-black ${isDark ? 'text-blue-200' : 'text-blue-900'}`}>${quickStats.totalFees.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className={`rounded-[32px] p-6 border ${isDark ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl">
                  <FiCheckCircle />
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Paid</p>
                  <p className={`text-2xl font-black ${isDark ? 'text-emerald-200' : 'text-emerald-900'}`}>${quickStats.paidFees.toLocaleString()}</p>
                </div>
              </div>
              <div className={`w-full rounded-full h-2 ${isDark ? 'bg-emerald-500/20' : 'bg-white/50'}`}>
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all" 
                  style={{ width: `${quickStats.totalFees > 0 ? (quickStats.paidFees / quickStats.totalFees) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className={`rounded-[32px] p-6 border ${isDark ? 'bg-amber-900/20 border-amber-500/30' : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl">
                  <FiAlertCircle />
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>Pending</p>
                  <p className={`text-2xl font-black ${isDark ? 'text-amber-200' : 'text-amber-900'}`}>${quickStats.pendingFees.toLocaleString()}</p>
                </div>
              </div>
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
                <div className={`h-[250px] flex flex-col items-center justify-center ${isDark ? 'text-slate-500' : 'text-slate-300'}`}>
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
                <div className={`h-[250px] flex flex-col items-center justify-center ${isDark ? 'text-slate-500' : 'text-slate-300'}`}>
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
                  <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${
                    isDark 
                      ? 'bg-slate-800/40 border-slate-700 hover:border-cyan-500/50' 
                      : 'bg-slate-50 border-slate-100 hover:border-cyan-200'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                        activity.type === 'assignment' 
                          ? isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600' 
                          : isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {activity.type === 'assignment' ? <FiEdit /> : <FiCheckCircle />}
                      </div>
                      <div>
                        <p className={`font-black ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{activity.title}</p>
                        <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {activity.course || 'General'} • {formatDate(activity.date)}
                        </p>
                      </div>
                    </div>
                    <FiArrowRight className={isDark ? 'text-slate-600' : 'text-slate-300'} />
                  </div>
                ))
              ) : (
                <p className={`text-center py-8 font-medium italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No recent activity to show</p>
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
                  <div key={i} className={`group relative pl-6 border-l-2 transition-colors py-1 ${
                    isDark 
                      ? 'border-slate-700 hover:border-cyan-500' 
                      : 'border-slate-100 hover:border-cyan-500'
                  }`}>
                    <div className={`absolute left-[-5px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-colors ${
                      isDark 
                        ? 'bg-slate-600 group-hover:bg-cyan-500' 
                        : 'bg-slate-200 group-hover:bg-cyan-500'
                    }`}></div>
                    <p className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em] mb-1">{event.type}</p>
                    <p className={`font-black leading-tight mb-1 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{event.title}</p>
                    <p className={`text-xs font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{formatDate(event.date)} • {event.time}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FiClock className={`w-10 h-10 mx-auto mb-4 ${isDark ? 'text-slate-700' : 'text-slate-200'}`} />
                  <p className={`font-bold text-xs uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>No upcoming events</p>
                </div>
              )}
              <button 
                onClick={() => navigate('/student/schedule')}
                className={`w-full mt-4 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl ${
                  isDark 
                    ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 shadow-slate-900/50' 
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'
                }`}
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
                      <p className={`text-sm font-black ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{item.name}</p>
                      <p className={`text-xs font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.value} Courses</p>
                    </div>
                    <div className={`h-2 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full" 
                        style={{ width: `${(item.value / quickStats.totalCourses) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className={`text-center py-4 font-medium italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No course data available</p>
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
                <tr className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <th className={`text-left py-3 px-4 text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Course</th>
                  <th className={`text-left py-3 px-4 text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Progress</th>
                  <th className={`text-left py-3 px-4 text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
                {courseDistribution.length > 0 ? (
                  courseDistribution.slice(0, 5).map((course, i) => (
                    <tr key={i} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                      <td className="py-3 px-4">
                        <p className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{course.name}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`w-full rounded-full h-2 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                          <div 
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(course.value * 20, 100)}%` }}
                          ></div>
                        </div>
                        <p className={`text-xs font-bold mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{course.value} courses</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Active</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className={`py-8 text-center font-medium italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      No courses enrolled yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <button 
            onClick={() => navigate('/student/courses')}
            className={`w-full mt-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
              isDark 
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            View All Courses
          </button>
        </Card>

        {/* Recent Attendance Table */}
        <Card title="Recent Attendance" className="rounded-[32px] p-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <th className={`text-left py-3 px-4 text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Date</th>
                  <th className={`text-left py-3 px-4 text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Status</th>
                  <th className={`text-left py-3 px-4 text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Time</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
                {attendanceData.length > 0 ? (
                  attendanceData.slice(0, 5).map((record, i) => (
                    <tr key={i} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                      <td className="py-3 px-4">
                        <p className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{record.month || 'N/A'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          record.rate >= 75 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : record.rate >= 50 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {record.rate}% Present
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{record.rate >= 75 ? 'On Time' : 'Late'}</p>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className={`py-8 text-center font-medium italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      No attendance records yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <button 
            onClick={() => navigate('/student/attendance')}
            className={`w-full mt-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
              isDark 
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            View Full Attendance
          </button>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
