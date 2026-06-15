import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiCalendar, 
  FiClock, 
  FiMapPin, 
  FiUsers, 
  FiPlus, 
  FiActivity, 
  FiArrowRight,
  FiFilter,
  FiAward,
  FiInfo
} from 'react-icons/fi';
import Card from '../components/UIHelper/Card';
import Badge from '../components/UIHelper/Badge';
import Button from '../components/UIHelper/Button';
import { PageSkeleton } from '../components/UIHelper/SkeletonLoader';
import { BarChartComponent, PieChartComponent } from '../components/UIHelper/ECharts';
import { formatDate } from '../lib/utils';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', location: '', description: '', type: 'Personal' });
  const [addError, setAddError] = useState('');

  useEffect(() => {
    fetchEventsData();
  }, []);

  const fetchEventsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const examsResponse = await axios.get(`${API_BASE}/student/exams`, config);
      const assignmentsResponse = await axios.get(`${API_BASE}/student/assignments`, config);
      
      const examEvents = (examsResponse.data || []).map(exam => ({
        id: `exam-${exam._id || exam.id}`,
        title: exam.title || 'Examination',
        date: exam.date || exam.publishDate || new Date().toISOString(),
        time: exam.startTime || '09:00 AM',
        location: exam.location || 'Examination Hall',
        type: 'Examination',
        description: exam.description || `Module assessment: ${exam.title}`,
        status: exam.status === 'completed' ? 'completed' : 'upcoming',
        color: 'rose'
      }));
      
      const assignmentEvents = (assignmentsResponse.data || [])
        .filter(a => a.dueDate)
        .map(assignment => ({
          id: `assignment-${assignment._id || assignment.id}`,
          title: assignment.title || 'Assignment Due',
          date: assignment.dueDate,
          time: '11:59 PM',
          location: 'Submission Portal',
          type: 'Assignment',
          description: assignment.description || `Submission deadline: ${assignment.title}`,
          status: assignment.status === 'submitted' ? 'completed' : 'upcoming',
          color: 'blue'
        }));
      
      const combinedEvents = [...examEvents, ...assignmentEvents].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );
      
      setEvents(combinedEvents);
    } catch (err) {
      console.error('[StudentEvents] Error:', err);
      setError('Failed to fetch events. Please try again.');
      setEvents([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    setAddError('');
    if (!newEvent.title || !newEvent.date) {
      setAddError('Title and date are required.');
      return;
    }
    const custom = {
      id: `custom-${Date.now()}`,
      title: newEvent.title,
      date: newEvent.date,
      time: newEvent.time || '12:00 PM',
      location: newEvent.location || 'N/A',
      type: newEvent.type || 'Personal',
      description: newEvent.description || '',
      status: 'upcoming',
      color: 'amber'
    };
    setEvents(prev => [...prev, custom].sort((a, b) => new Date(a.date) - new Date(b.date)));
    setNewEvent({ title: '', date: '', time: '', location: '', description: '', type: 'Personal' });
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
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">Academic</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Calendar & Events</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Stay synchronized with institutional activities</p>
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
                {f}
              </button>
            ))}
          </div>
          <Button variant="primary" className="rounded-2xl bg-slate-900 hover:bg-slate-800 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center gap-2" onClick={() => setShowAddModal(true)}>
            <FiPlus /> Add Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Events List */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Institutional Timeline" className="rounded-[32px] p-8">
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
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest ml-auto group-hover:text-cyan-600 transition-colors cursor-pointer">
                          Details <FiArrowRight />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center">
                  <FiCalendar className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No events scheduled</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          {/* Event Statistics Chart */}
          <Card title="Event Statistics" className="rounded-[32px] p-8">
            <PieChartComponent 
              data={[
                { name: 'Upcoming', value: events.filter(e => e.status === 'upcoming').length, color: '#3B82F6' },
                { name: 'Completed', value: events.filter(e => e.status === 'completed').length, color: '#10B981' },
                { name: 'Examinations', value: events.filter(e => e.type === 'Examination').length, color: '#F43F5E' },
                { name: 'Assignments', value: events.filter(e => e.type === 'Assignment').length, color: '#F59E0B' }
              ].filter(item => item.value > 0)}
              height={250}
            />
          </Card>

          <Card title="Monthly Activity" className="rounded-[32px] p-8">
            <BarChartComponent 
              data={[
                { name: 'This Month', value: events.filter(e => {
                  const eventDate = new Date(e.date);
                  const now = new Date();
                  return eventDate.getMonth() === now.getMonth();
                }).length },
                { name: 'Next Month', value: events.filter(e => {
                  const eventDate = new Date(e.date);
                  const nextMonth = new Date();
                  nextMonth.setMonth(nextMonth.getMonth() + 1);
                  return eventDate.getMonth() === nextMonth.getMonth();
                }).length },
                { name: 'Completed', value: events.filter(e => e.status === 'completed').length }
              ].filter(item => item.value > 0)}
              dataKey="value"
              nameKey="name"
              height={250}
            />
          </Card>

          {/* Today Card */}
          <div className="p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[40px] text-white shadow-2xl shadow-slate-200/50 text-center relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-4">Today's Date</p>
              <h2 className="text-7xl font-black tracking-tighter mb-2">{new Date().getDate()}</h2>
              <p className="text-xl font-bold text-slate-300">
                {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
              </p>
              <div className="mt-8 flex justify-center">
                <Badge variant="primary" className="px-4 py-2">System Active</Badge>
              </div>
            </div>
            <FiCalendar className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 transform -rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>

          <Card title="Quick Stats" className="rounded-[32px] p-8">
            <div className="space-y-6">
              {[
                { label: 'Upcoming', value: events.filter(e => e.status === 'upcoming').length, color: 'blue' },
                { label: 'Completed', value: events.filter(e => e.status === 'completed').length, color: 'emerald' },
                { label: 'Examinations', value: events.filter(e => e.type === 'Examination').length, color: 'rose' }
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
            <h4 className="text-xl font-black mb-2">Need a Hall?</h4>
            <p className="text-blue-100 text-sm font-medium mb-6">Planning a study group or event? Request room booking through Student Affairs.</p>
            <Button variant="outline" className="w-full rounded-2xl py-4 border-white/20 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-widest transition-all">
              Request Booking
            </Button>
          </Card>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <FiPlus className="text-cyan-600" /> Add Personal Event
            </h2>
            <form onSubmit={handleAddEvent} className="space-y-4">
              {addError && <p className="text-red-500 text-sm">{addError}</p>}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Title *</label>
                <input value={newEvent.title} onChange={e => setNewEvent(p => ({...p, title: e.target.value}))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Event title" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Date *</label>
                  <input type="date" value={newEvent.date} onChange={e => setNewEvent(p => ({...p, date: e.target.value}))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Time</label>
                  <input type="time" value={newEvent.time} onChange={e => setNewEvent(p => ({...p, time: e.target.value}))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Location</label>
                <input value={newEvent.location} onChange={e => setNewEvent(p => ({...p, location: e.target.value}))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="e.g., Library, Room 12" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Type</label>
                <select value={newEvent.type} onChange={e => setNewEvent(p => ({...p, type: e.target.value}))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500">
                  {['Personal', 'Study Group', 'Meeting', 'Reminder', 'Other'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Description</label>
                <textarea value={newEvent.description} onChange={e => setNewEvent(p => ({...p, description: e.target.value}))} rows={3} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none" placeholder="Optional notes..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowAddModal(false); setAddError(''); }} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800">Add Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentEvents;
