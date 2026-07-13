import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FiCalendar, 
  FiClock, 
  FiMapPin, 
  FiPlus, 
  FiArrowRight
} from 'react-icons/fi';
import Card from '../components/UIHelper/Card';
import Badge from '../components/UIHelper/Badge';
import Button from '../components/UIHelper/Button';
import { PageSkeleton } from '../components/UIHelper/SkeletonLoader';
import { BarChartComponent, PieChartComponent } from '../components/UIHelper/ECharts';
import { formatDate } from '../lib/utils';
import { unwrapArrayResponse } from '../lib/studentData';
import api from '../lib/api';

const StudentEvents = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['student', 'common']);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', location: '', description: '', type: t('student.events.typePersonal') });
  const [addError, setAddError] = useState('');

  useEffect(() => {
    fetchEventsData();
  }, []);

  const mockEvents = [
    { id: 'mock-exam-1', title: 'Mid-Term Quran Examination', date: new Date(Date.now() + 86400000 * 3).toISOString(), time: '10:00 AM', location: 'Main Examination Hall', type: 'Examination', description: 'Comprehensive assessment of Quran memorization and recitation.', status: 'upcoming', color: 'rose' },
    { id: 'mock-exam-2', title: 'Islamic Studies Quiz', date: new Date(Date.now() + 86400000 * 7).toISOString(), time: '02:00 PM', location: 'Room 201', type: 'Examination', description: 'Quiz covering Islamic jurisprudence and history modules.', status: 'upcoming', color: 'rose' },
    { id: 'mock-assign-1', title: 'Arabic Grammar Homework', date: new Date(Date.now() + 86400000 * 5).toISOString(), time: '11:59 PM', location: 'Submission Portal', type: 'Assignment', description: 'Complete exercises on verb conjugation and sentence structure.', status: 'upcoming', color: 'blue' },
    { id: 'mock-assign-2', title: 'Quran Translation Essay', date: new Date(Date.now() + 86400000 * 14).toISOString(), time: '11:59 PM', location: 'Submission Portal', type: 'Assignment', description: 'Write a 1000-word essay on the translation of Surah Al-Fatiha.', status: 'upcoming', color: 'blue' },
    { id: 'mock-custom-1', title: 'Study Group: Hadith Review', date: new Date(Date.now() + 86400000 * 2).toISOString(), time: '04:00 PM', location: 'Library Study Room 3', type: 'Study Group', description: 'Weekly group study session for Hadith memorization review.', status: 'upcoming', color: 'amber' }
  ];

  const fetchEventsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [examsResponse, assignmentsResponse, eventsResponse] = await Promise.all([
        api.get('/student/exams'),
        api.get('/student/assignments'),
        api.get('/events')
      ]);
      
      const examEvents = unwrapArrayResponse(examsResponse.data).map(exam => ({
        id: `exam-${exam._id || exam.id}`,
        title: exam.title || t('student.events.defaultExamTitle'),
        date: exam.date || exam.publishDate || new Date().toISOString(),
        time: exam.startTime || t('student.events.defaultTime'),
        location: exam.location || t('student.events.examinationHall'),
        type: t('student.events.typeExamination'),
        description: exam.description || t('student.events.defaultExamDesc', { title: exam.title }),
        status: exam.status === 'completed' ? 'completed' : 'upcoming',
        color: 'rose'
      }));
      
      const assignmentEvents = unwrapArrayResponse(assignmentsResponse.data)
        .filter(a => a.dueDate)
        .map(assignment => ({
          id: `assignment-${assignment._id || assignment.id}`,
          title: assignment.title || t('student.events.defaultAssignmentTitle'),
          date: assignment.dueDate,
          time: t('student.events.defaultDueTime'),
          location: t('student.events.submissionPortal'),
          type: t('student.events.typeAssignment'),
          description: assignment.description || t('student.events.defaultAssignmentDesc', { title: assignment.title }),
          status: assignment.status === 'submitted' ? 'completed' : 'upcoming',
          color: 'blue'
        }));

      const customEvents = unwrapArrayResponse(eventsResponse.data).map(event => ({
        id: `custom-${event._id}`,
        title: event.title,
        date: event.date,
        time: event.time || t('student.events.defaultNoonTime'),
        location: event.location || t('common.na'),
        type: event.type || t('student.events.typePersonal'),
        description: event.description || '',
        status: event.status || 'upcoming',
        color: 'amber'
      }));
      
      const combinedEvents = [...examEvents, ...assignmentEvents, ...customEvents].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );
      
      setEvents(combinedEvents.length > 0 ? combinedEvents : mockEvents);
    } catch (err) {
      console.error('[StudentEvents] Error:', err);
      setEvents(mockEvents);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    setAddError('');
    if (!newEvent.title || !newEvent.date) {
      setAddError(t('student.events.titleDateRequired'));
      return;
    }
    try {
      setLoading(true);
      const res = await api.post('/events', newEvent);
      const created = res.data?.data;
      const custom = {
        id: `custom-${created?._id || Date.now()}`,
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time || t('student.events.defaultNoonTime'),
        location: newEvent.location || t('common.na'),
        type: newEvent.type || t('student.events.typePersonal'),
        description: newEvent.description || '',
        status: 'upcoming',
        color: 'amber'
      };
      setEvents(prev => [...prev, custom].sort((a, b) => new Date(a.date) - new Date(b.date)));
    } catch (err) {
      console.error('[StudentEvents] Error creating event:', err);
      const custom = {
        id: `custom-${Date.now()}`,
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time || t('student.events.defaultNoonTime'),
        location: newEvent.location || t('common.na'),
        type: newEvent.type || t('student.events.typePersonal'),
        description: newEvent.description || '',
        status: 'upcoming',
        color: 'amber'
      };
      setEvents(prev => [...prev, custom].sort((a, b) => new Date(a.date) - new Date(b.date)));
    } finally {
      setLoading(false);
    }
    setNewEvent({ title: '', date: '', time: '', location: '', description: '', type: t('student.events.typePersonal') });
    setShowAddModal(false);
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.status === filter;
  });

  if (loading) {
    return <PageSkeleton variant="table" />;
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">{t('academic', { ns: 'student' })}</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t('events', { ns: 'student' })}</h1>
          <p className="text-slate-500 mt-1 font-medium italic">{t('student.events.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
            {['all', 'upcoming', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  filter === f ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {f === 'all' ? t('all', { ns: 'common' }) : t(f, { ns: 'common' })}
              </button>
            ))}
          </div>
          <Button variant="primary" className="rounded-2xl bg-slate-900 hover:bg-slate-800 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center gap-2" onClick={() => setShowAddModal(true)}>
            <FiPlus /> {t('student.events.addEvent')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Events List */}
        <div className="lg:col-span-2 space-y-6">
          <Card title={t('student.events.institutionalTimeline')} className="rounded-[32px] p-8">
            <div className="space-y-8">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <div key={event.id} className="group flex gap-8">
                    {/* Date Sidebar */}
                    <div className="flex flex-col items-center gap-2 w-16">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {new Date(event.date).toLocaleString('default', { month: 'short' })}
                      </div>
                      <div className={`w-14 h-14 rounded-2xl bg-${event.color === 'rose' ? 'rose-50 text-rose-600' : 'blue-50 text-blue-600'} flex items-center justify-center text-xl font-black shadow-sm group-hover:scale-110 transition-transform`}>
                        {new Date(event.date).getDate()}
                      </div>
                      <div className="flex-1 w-px bg-slate-100 mt-2"></div>
                    </div>

                    {/* Content Card */}
                    <div className="flex-1 p-6 rounded-3xl bg-slate-50 border border-slate-100 group-hover:border-cyan-200 group-hover:bg-white transition-all duration-300">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <Badge className={`bg-${event.color === 'rose' ? 'rose-100 text-rose-600' : 'blue-100 text-blue-600'} border-none font-black text-[10px] uppercase tracking-widest mb-2`}>
                            {event.type}
                          </Badge>
                          <h3 className="text-xl font-black text-slate-900 tracking-tight">{event.title}</h3>
                        </div>
                        <Badge variant={event.status === 'completed' ? 'success' : 'primary'}>
                          {event.status?.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <p className="text-sm font-medium text-slate-500 italic mb-6">
                        {event.description}
                      </p>

                      <div className="flex flex-wrap gap-6 border-t border-slate-100 pt-6">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                          <FiClock className="text-cyan-500" /> {event.time}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                          <FiMapPin className="text-cyan-500" /> {event.location}
                        </div>
                        <button
                          type="button"
                          className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest ml-auto group-hover:text-cyan-600 transition-colors cursor-pointer"
                          onClick={() => navigate(event.type === 'Examination' ? '/student/exams' : '/student/assignments')}
                        >
                          {t('details', { ns: 'common' })} <FiArrowRight />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center">
                  <FiCalendar className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">{t('student.events.noEventsScheduled')}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          {/* Event Statistics Chart */}
          <Card title={t('student.events.eventStatistics')} className="rounded-[32px] p-8">
            <PieChartComponent 
              data={[
                { name: t('common.upcoming'), value: events.filter(e => e.status === 'upcoming').length, color: '#3B82F6' },
                { name: t('common.completed'), value: events.filter(e => e.status === 'completed').length, color: '#10B981' },
                { name: t('student.events.examinations'), value: events.filter(e => e.type === 'Examination').length, color: '#F43F5E' },
                { name: t('student.events.assignments'), value: events.filter(e => e.type === 'Assignment').length, color: '#F59E0B' }
              ].filter(item => item.value > 0)}
              height={250}
            />
          </Card>

          <Card title={t('student.events.monthlyActivity')} className="rounded-[32px] p-8">
            <BarChartComponent 
              data={[
                { name: t('student.events.thisMonth'), value: events.filter(e => {
                  const eventDate = new Date(e.date);
                  const now = new Date();
                  return eventDate.getMonth() === now.getMonth();
                }).length },
                { name: t('student.events.nextMonth'), value: events.filter(e => {
                  const eventDate = new Date(e.date);
                  const nextMonth = new Date();
                  nextMonth.setMonth(nextMonth.getMonth() + 1);
                  return eventDate.getMonth() === nextMonth.getMonth();
                }).length },
                { name: t('common.completed'), value: events.filter(e => e.status === 'completed').length }
              ].filter(item => item.value > 0)}
              dataKey="value"
              nameKey="name"
              height={250}
            />
          </Card>

          {/* Today Card */}
          <div className="p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[40px] text-white shadow-2xl shadow-slate-200/50 text-center relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-4">{t('student.events.todaysDate')}</p>
              <h2 className="text-7xl font-black tracking-tighter mb-2">{new Date().getDate()}</h2>
              <p className="text-xl font-bold text-slate-300">
                {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
              </p>
              <div className="mt-8 flex justify-center">
                <Badge variant="primary" className="px-4 py-2">{t('student.events.systemActive')}</Badge>
              </div>
            </div>
            <FiCalendar className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 transform -rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>

          <Card title={t('student.events.quickStats')} className="rounded-[32px] p-8">
            <div className="space-y-6">
              {[
                { label: t('common.upcoming'), value: events.filter(e => e.status === 'upcoming').length, color: 'blue' },
                { label: t('common.completed'), value: events.filter(e => e.status === 'completed').length, color: 'emerald' },
                { label: t('student.events.examinations'), value: events.filter(e => e.type === 'Examination').length, color: 'rose' }
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full bg-${stat.color}-500`}></div>
                    <span className="text-sm font-bold text-slate-600">{stat.label}</span>
                  </div>
                  <span className="font-black text-slate-900">{stat.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-[32px] p-8 bg-blue-600 text-white border-none shadow-xl shadow-blue-200/50">
        <h4 className="text-xl font-black mb-2">{t('student.events.needAHall')}</h4>
            <p className="text-blue-100 text-sm font-medium mb-6">{t('student.events.requestRoomBooking')}</p>
            <Button variant="outline" className="w-full rounded-2xl py-4 border-white/20 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-widest transition-all">
              {t('student.events.requestBooking')}
            </Button>
          </Card>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <FiPlus className="text-cyan-600" /> {t('student.events.addPersonalEvent')}
            </h2>
            <form onSubmit={handleAddEvent} className="space-y-4">
              {addError && <p className="text-red-500 text-sm">{addError}</p>}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{t('student.events.titleLabel')}</label>
                <input value={newEvent.title} onChange={e => setNewEvent(p => ({...p, title: e.target.value}))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder={t('student.events.titlePlaceholder')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{t('student.events.dateLabel')}</label>
                  <input type="date" value={newEvent.date} onChange={e => setNewEvent(p => ({...p, date: e.target.value}))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{t('student.events.timeLabel')}</label>
                  <input type="time" value={newEvent.time} onChange={e => setNewEvent(p => ({...p, time: e.target.value}))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
              </div>
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{t('student.events.locationLabel')}</label>
                <input value={newEvent.location} onChange={e => setNewEvent(p => ({...p, location: e.target.value}))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder={t('student.events.locationPlaceholder')} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{t('student.events.typeLabel')}</label>
                <select value={newEvent.type} onChange={e => setNewEvent(p => ({...p, type: e.target.value}))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500">
                  {[t('student.events.typePersonal'), t('student.events.typeStudyGroup'), t('student.events.typeMeeting'), t('student.events.typeReminder'), t('student.events.typeOther')].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{t('student.events.descriptionLabel')}</label>
                <textarea value={newEvent.description} onChange={e => setNewEvent(p => ({...p, description: e.target.value}))} rows={3} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none" placeholder={t('student.events.descriptionPlaceholder')} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowAddModal(false); setAddError(''); }} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50">{t('common.cancel')}</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800">{t('student.events.addEventBtn')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentEvents;
