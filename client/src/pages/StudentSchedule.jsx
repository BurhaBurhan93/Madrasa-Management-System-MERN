import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, parseJsonSafe } from '../lib/apiFetch';
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
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTranslation } from 'react-i18next';



const StudentSchedule = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['student', 'common']);
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

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await apiFetch('/student/courses');
      const data = await parseJsonSafe(res);
      const courses = Array.isArray(data) ? data : [];
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
          course: course.name || course.subjectName || t('academic'),
          time: course.startTime && course.endTime
            ? `${course.startTime} - ${course.endTime}`
            : t('schedule.defaultTime'),
          room: t('common:na'),
          instructor: course.teacher?.name || course.teacherName || t('instructor'),
          type: index % 2 === 0 ? 'lecture' : 'tutorial'
        });
      });
      
      if (courses.length === 0) {
        // Use mock schedule data when API returns empty
        const mockDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        const mockSchedule = {
          monday: [{ id: 'm1', course: 'Advanced Mathematics', time: t('schedule.mockTime1'), room: 'Lecture Hall A', instructor: 'Dr. Ahmed', type: 'lecture' }, { id: 'm2', course: 'Quranic Studies', time: t('schedule.mockTime2'), room: 'Room 203', instructor: 'Sheikh Abdullah', type: 'tutorial' }],
          tuesday: [{ id: 't1', course: 'Arabic Literature', time: t('schedule.mockTime3'), room: 'Lecture Hall B', instructor: 'Prof. Fatima', type: 'lecture' }],
          wednesday: [{ id: 'w1', course: 'Islamic History', time: t('schedule.mockTime4'), room: 'Room 105', instructor: 'Dr. Hassan', type: 'lecture' }, { id: 'w2', course: 'Computer Science', time: t('schedule.mockTime5'), room: 'Lab 3', instructor: 'Ms. Aisha', type: 'tutorial' }],
          thursday: [{ id: 'th1', course: 'English Language', time: t('schedule.mockTime6'), room: 'Lecture Hall C', instructor: 'Mr. John', type: 'lecture' }],
          friday: [{ id: 'f1', course: 'Advanced Mathematics', time: t('schedule.mockTime7'), room: 'Lecture Hall A', instructor: 'Dr. Ahmed', type: 'tutorial' }]
        };
        setScheduleData(mockSchedule);
      } else {
        setScheduleData(formattedSchedule);
      }
    } catch (err) {
      console.error('[StudentSchedule] Error fetching schedule:', err);
      setError(t('schedule.offlineError'));
      setScheduleData({ monday: [{ id: 'm1', course: 'Advanced Mathematics', time: t('schedule.defaultTime'), room: 'Lecture Hall A', instructor: 'Dr. Ahmed', type: 'lecture' }], tuesday: [], wednesday: [], thursday: [], friday: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduleData();
  }, []);

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

  const handleExport = () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const tableData = [];

    days.forEach((day, i) => {
      (scheduleData[day] || []).forEach(item => {
        tableData.push([t('common:' + day), item.course, item.time, item.room, item.instructor, t('schedule.' + item.type, item.type)]);
      });
    });

    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(18);
    doc.text(t('schedule.pdfTitle'), 14, 20);
    doc.setFontSize(10);
    doc.text(`${t('schedule.pdfGenerated')}: ${new Date().toLocaleDateString()}`, 14, 28);
    autoTable(doc, {
      startY: 34,
      head: [[t('common:day'), t('common:course'), t('common:time'), t('schedule.pdfRoom'), t('instructor'), t('schedule.pdfType')]],
      body: tableData,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [14, 165, 233] },
    });
    doc.save(t('schedule.pdfFileName'));
  };

  if (loading) {
    return <PageSkeleton variant="table" />;
  }

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const dayNames = [t('common:monday'), t('common:tuesday'), t('common:wednesday'), t('common:thursday'), t('common:friday')];

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 dark:text-gray-100">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">{t('academic')}</p>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('schedule.title')}</h1>
          <p className="text-slate-500 dark:text-gray-400 mt-1 font-medium italic">{t('schedule.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" className="rounded-2xl bg-slate-900 hover:bg-slate-800 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center gap-2" onClick={handleExport}>
            <FiDownload /> {t('exportSchedule')}
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 p-2 bg-white dark:bg-gray-800 rounded-[32px] border border-slate-100 dark:border-gray-700 shadow-xl shadow-slate-200/50">
          <div className="flex p-1 bg-slate-50 dark:bg-gray-700 rounded-2xl">
          <button
            onClick={() => setViewMode('weekly')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              viewMode === 'weekly' ? 'bg-white dark:bg-gray-700 text-slate-900 dark:text-white shadow-lg' : 'text-slate-400 dark:text-gray-500 hover:text-slate-600'
            }`}
          >
            <FiGrid /> {t('schedule.weekly')}
          </button>
          <button
            onClick={() => setViewMode('daily')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              viewMode === 'daily' ? 'bg-white dark:bg-gray-700 text-slate-900 dark:text-white shadow-lg' : 'text-slate-400 dark:text-gray-500 hover:text-slate-600'
            }`}
          >
            <FiList /> {t('schedule.daily')}
          </button>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => handleDateChange('prev')} className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-gray-700 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all">
            <FiChevronLeft className="text-xl" />
          </button>
          <div className="text-center min-w-[240px]">
            <p className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.3em] mb-1">
              {viewMode === 'weekly' ? t('schedule.selectedWeek') : t('schedule.selectedDay')}
            </p>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {viewMode === 'weekly' 
                ? `${formatDate(getCurrentWeekDates()[0])} — ${formatDate(getCurrentWeekDates()[4])}`
                : formatDate(selectedDate)
              }
            </h3>
          </div>
          <button onClick={() => handleDateChange('next')} className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-gray-700 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all">
            <FiChevronRight className="text-xl" />
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 pr-4">
          <Badge variant="success" className="font-black px-4 py-2">{t('schedule.normalSchedule')}</Badge>
        </div>
      </div>

      {/* Schedule Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {daysOfWeek.map((day, index) => (
          <div key={day} className={`space-y-6 ${viewMode === 'daily' && dayNames[index] !== selectedDate.toLocaleDateString('en-US', { weekday: 'long' }) ? 'hidden' : ''} ${viewMode === 'daily' ? 'lg:col-span-5' : ''}`}>
            <div className="text-center lg:text-left px-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t('common:' + daysOfWeek[index])}</h3>
              <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mt-1">
                {getCurrentWeekDates()[index].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>

            <div className="space-y-4">
              {scheduleData[day].length > 0 ? (
                scheduleData[day].map((item) => (
                  <div key={item.id} className="group p-6 rounded-[32px] bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 shadow-xl shadow-slate-200/50 dark:shadow-gray-900/50 hover:border-cyan-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        item.type === 'lecture' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {t('schedule.' + item.type, item.type)}
                      </div>
                      <FiClock className="text-slate-200 group-hover:text-cyan-500 transition-colors" />
                    </div>
                    
                    <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-2 line-clamp-1">{item.course}</h4>
                    
                    <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-gray-700">
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-gray-400">
                        <FiClock className="text-cyan-500" /> {item.time}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-gray-400">
                        <FiMapPin className="text-cyan-500" /> {item.room}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-gray-400">
                        <FiUser className="text-cyan-500" /> {item.instructor}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-gray-800/50 rounded-[32px] border border-dashed border-slate-200 dark:border-gray-700 opacity-60">
                  <FiActivity className="w-10 h-10 text-slate-200 dark:text-gray-600 mb-2" />
                  <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">{t('schedule.freeDay')}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="rounded-[32px] p-8 flex items-center gap-8 dark:bg-gray-800 dark:border-gray-700">
          <div className="w-16 h-16 rounded-[24px] bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 flex items-center justify-center text-3xl shrink-0">
            <FiInfo />
          </div>
          <div>
            <h4 className="text-xl font-black text-slate-900 dark:text-white mb-1">{t('schedule.roomChanges')}</h4>
            <p className="text-slate-500 dark:text-gray-400 font-medium">{t('schedule.roomChangesDesc')}</p>
          </div>
        </Card>

        <Card className="rounded-[32px] p-8 flex items-center gap-8 dark:bg-gray-800 dark:border-gray-700">
          <div className="w-16 h-16 rounded-[24px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center text-3xl shrink-0">
            <FiCheckCircle />
          </div>
          <div>
            <h4 className="text-xl font-black text-slate-900 dark:text-white mb-1">{t('schedule.academicSupport')}</h4>
            <p className="text-slate-500 dark:text-gray-400 font-medium">{t('schedule.academicSupportDesc')}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentSchedule;
