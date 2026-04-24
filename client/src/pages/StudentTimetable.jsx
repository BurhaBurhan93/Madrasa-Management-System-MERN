import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiCalendar, 
  FiClock, 
  FiMapPin, 
  FiUser, 
  FiBookOpen, 
  FiActivity, 
  FiArrowRight,
  FiTrendingUp,
  FiDownload,
  FiInfo,
  FiCheckCircle
} from 'react-icons/fi';
import Card from '../components/UIHelper/Card';
import Badge from '../components/UIHelper/Badge';
import Button from '../components/UIHelper/Button';
import { PageSkeleton } from '../components/UIHelper/SkeletonLoader';
import { formatDate } from '../lib/utils';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentTimetable = () => {
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    class: '',
    semester: 'Current Semester'
  });

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const profileRes = await axios.get(`${API_BASE}/student/profile`, config);
      if (profileRes.data) {
        setStudentInfo({
          name: profileRes.data.name || '',
          class: profileRes.data.currentClass?.name || 'Level 1',
          semester: profileRes.data.currentSemester || 'Academic Year 2023-24'
        });
      }

      const coursesRes = await axios.get(`${API_BASE}/student/courses`, config);
      const courses = coursesRes.data || [];

      const scheduleData = courses.map((course, index) => ({
        _id: course._id,
        subject: course.name || 'Subject',
        teacher: course.teacher?.name || 'Dr. Ahmad Sarwari',
        day: getDayForCourse(course, index),
        time: course.schedule?.time || '09:00 AM - 10:30 AM',
        room: course.schedule?.room || 'Lecture Hall A',
        credits: course.credits || 3,
        type: course.type || 'Core'
      }));

      setTimetable(scheduleData);
    } catch (err) {
      console.error('[StudentTimetable] Error:', err);
      setError('Failed to fetch timetable. Please try again.');
      setTimetable([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const getDayForCourse = (course, index) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    return days[index % days.length];
  };

  const groupedTimetable = React.useMemo(() => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const grouped = {};
    days.forEach(day => {
      grouped[day] = timetable.filter(item => item.day === day);
    });
    return grouped;
  }, [timetable]);

  if (loading) {
    return <PageSkeleton variant="table" />;
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">Academic</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Weekly Timetable</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Comprehensive schedule for {studentInfo.semester}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" className="rounded-2xl bg-slate-900 hover:bg-slate-800 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center gap-2">
            <FiDownload /> Export Schedule
          </Button>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Classes', value: timetable.length, icon: <FiBookOpen />, color: 'blue' },
          { label: 'Current Class', value: studentInfo.class, icon: <FiTrendingUp />, color: 'emerald' },
          { label: 'Academic Year', value: '2023-24', icon: <FiCalendar />, color: 'purple' },
          { label: 'Active Days', value: '5 Days', icon: <FiActivity />, color: 'cyan' }
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center text-xl mb-4`}>
              {stat.icon}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Timetable View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Weekly Master Schedule" className="rounded-[32px] p-8">
            <div className="space-y-10">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                <div key={day} className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-px flex-1 bg-slate-100"></div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">{day}</h3>
                    <div className="h-px flex-1 bg-slate-100"></div>
                  </div>

                  <div className="space-y-4">
                    {groupedTimetable[day]?.length > 0 ? (
                      groupedTimetable[day].map((slot, idx) => (
                        <div key={idx} className="group flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-cyan-200 hover:bg-white transition-all duration-300">
                          <div className="flex items-center gap-6 mb-4 md:mb-0">
                            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex flex-col items-center justify-center text-cyan-600 group-hover:scale-110 transition-transform">
                              <FiClock className="text-xl" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em]">{slot.type}</p>
                                <span className="text-slate-300">•</span>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{slot.credits} Credits</p>
                              </div>
                              <h4 className="text-xl font-black text-slate-900 tracking-tight">{slot.subject}</h4>
                              <p className="text-sm font-bold text-slate-500 flex items-center gap-2 mt-1">
                                <FiUser className="text-slate-400" /> {slot.teacher}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2">
                            <div className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-200">
                              {slot.time}
                            </div>
                            <p className="text-xs font-bold text-slate-400 flex items-center gap-2">
                              <FiMapPin className="text-cyan-500" /> {slot.room}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">No classes scheduled</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <Card title="Attendance Policy" className="rounded-[32px] p-8 bg-slate-900 text-white border-none shadow-2xl shadow-slate-900/20">
            <div className="space-y-4">
              {[
                { icon: <FiClock />, text: 'Classes begin promptly at 08:30 AM.' },
                { icon: <FiInfo />, text: 'Minimum 75% attendance required for exams.' },
                { icon: <FiActivity />, text: 'Late entry (15m+) marked as half-day.' },
                { icon: <FiCheckCircle />, text: 'Notify teachers via portal for absences.' }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-cyan-400 text-lg mt-0.5">{item.icon}</div>
                  <p className="text-sm font-medium text-slate-300 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="p-8 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-[32px] text-white shadow-2xl shadow-cyan-200/50 relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-xl font-black mb-2">Academic Calendar</h4>
              <p className="text-cyan-100 text-sm font-medium mb-6">View upcoming holidays, exams, and institutional events.</p>
              <Button variant="outline" className="w-full rounded-2xl py-4 border-white/20 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-widest transition-all" onClick={() => navigate('/student/events')}>
                Open Calendar
              </Button>
            </div>
            <FiCalendar className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 transform -rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTimetable;
