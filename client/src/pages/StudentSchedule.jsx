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
  FiCheckCircle, 
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiList,
  FiDownload,
  FiInfo
} from 'react-icons/fi';
import Card from '../components/UIHelper/Card';
import Badge from '../components/UIHelper/Badge';
import Button from '../components/UIHelper/Button';
import { PageSkeleton } from '../components/UIHelper/SkeletonLoader';
import { formatDate } from '../lib/utils';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentSchedule = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('weekly');
  const [scheduleData, setScheduleData] = useState({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchScheduleData();
  }, []);

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const coursesResponse = await axios.get(`${API_BASE}/student/courses`, config);
      const courses = coursesResponse.data || [];
      const formattedSchedule = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: []
      };
      
      courses.forEach((course, index) => {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        const day = days[index % 5];
        
        formattedSchedule[day].push({
          id: course._id || index,
          course: course.name || 'Academic Subject',
          time: course.schedule?.time || '09:00 AM - 10:30 AM',
          room: course.schedule?.room || 'Lecture Hall A',
          instructor: course.teacher?.name || 'Dr. Ahmad Sarwari',
          type: index % 2 === 0 ? 'lecture' : 'tutorial'
        });
      });
      
      setScheduleData(formattedSchedule);
    } catch (err) {
      console.error('[StudentSchedule] Error fetching schedule:', err);
      setError('Failed to fetch schedule. Please try again.');
      setSchedule([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (direction) => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'daily') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    setSelectedDate(newDate);
  };

  const getCurrentWeekDates = () => {
    const dates = [];
    const startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - startDate.getDay() + 1); 
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  if (loading) {
    return <PageSkeleton variant="table" />;
  }

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">Academic</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Class Schedule</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Manage and view your academic commitments</p>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" className="rounded-2xl bg-slate-900 hover:bg-slate-800 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center gap-2">
            <FiDownload /> Export Schedule
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 p-2 bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="flex p-1 bg-slate-50 rounded-2xl">
          <button
            onClick={() => setViewMode('weekly')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              viewMode === 'weekly' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <FiGrid /> Weekly
          </button>
          <button
            onClick={() => setViewMode('daily')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              viewMode === 'daily' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <FiList /> Daily
          </button>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => handleDateChange('prev')} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all">
            <FiChevronLeft className="text-xl" />
          </button>
          <div className="text-center min-w-[240px]">
            <p className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.3em] mb-1">
              {viewMode === 'weekly' ? 'Selected Week' : 'Selected Day'}
            </p>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              {viewMode === 'weekly' 
                ? `${formatDate(getCurrentWeekDates()[0])} — ${formatDate(getCurrentWeekDates()[4])}`
                : formatDate(selectedDate)
              }
            </h3>
          </div>
          <button onClick={() => handleDateChange('next')} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all">
            <FiChevronRight className="text-xl" />
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 pr-4">
          <Badge variant="success" className="font-black px-4 py-2">Normal Schedule</Badge>
        </div>
      </div>

      {/* Schedule Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {daysOfWeek.map((day, index) => (
          <div key={day} className={`space-y-6 ${viewMode === 'daily' && dayNames[index] !== selectedDate.toLocaleDateString('en-US', { weekday: 'long' }) ? 'hidden' : ''} ${viewMode === 'daily' ? 'lg:col-span-5' : ''}`}>
            <div className="text-center lg:text-left px-2">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{dayNames[index]}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                {getCurrentWeekDates()[index].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>

            <div className="space-y-4">
              {scheduleData[day].length > 0 ? (
                scheduleData[day].map((item) => (
                  <div key={item.id} className="group p-6 rounded-[32px] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:border-cyan-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        item.type === 'lecture' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {item.type}
                      </div>
                      <FiClock className="text-slate-200 group-hover:text-cyan-500 transition-colors" />
                    </div>
                    
                    <h4 className="text-lg font-black text-slate-900 tracking-tight leading-tight mb-2 line-clamp-1">{item.course}</h4>
                    
                    <div className="space-y-3 pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                        <FiClock className="text-cyan-500" /> {item.time}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                        <FiMapPin className="text-cyan-500" /> {item.room}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                        <FiUser className="text-cyan-500" /> {item.instructor}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200 opacity-60">
                  <FiActivity className="w-10 h-10 text-slate-200 mb-2" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Free Day</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="rounded-[32px] p-8 flex items-center gap-8">
          <div className="w-16 h-16 rounded-[24px] bg-cyan-50 text-cyan-600 flex items-center justify-center text-3xl shrink-0">
            <FiInfo />
          </div>
          <div>
            <h4 className="text-xl font-black text-slate-900 mb-1">Room Changes</h4>
            <p className="text-slate-500 font-medium">Any sudden room or schedule changes will be highlighted in orange. Stay alert for push notifications.</p>
          </div>
        </Card>

        <Card className="rounded-[32px] p-8 flex items-center gap-8">
          <div className="w-16 h-16 rounded-[24px] bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl shrink-0">
            <FiCheckCircle />
          </div>
          <div>
            <h4 className="text-xl font-black text-slate-900 mb-1">Academic Support</h4>
            <p className="text-slate-500 font-medium">Missing a class? You can find lecture recordings and materials in the Learning Resources section.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentSchedule;
