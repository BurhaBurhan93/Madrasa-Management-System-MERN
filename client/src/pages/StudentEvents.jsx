import React, { useState } from 'react';
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiPlus, FiFilter } from 'react-icons/fi';

const StudentEvents = () => {
  const [events] = useState([
    {
      id: 1,
      title: 'Annual Quran Competition',
      date: '2024-03-15',
      time: '09:00 AM - 02:00 PM',
      location: 'Main Hall',
      type: 'Competition',
      attendees: 120,
      description: 'Annual inter-school Quran recitation and memorization competition.',
      status: 'upcoming',
    },
    {
      id: 2,
      title: 'Islamic History Workshop',
      date: '2024-03-20',
      time: '10:00 AM - 12:00 PM',
      location: 'Conference Room B',
      type: 'Workshop',
      attendees: 45,
      description: 'Learn about the Golden Age of Islam and its contributions to science.',
      status: 'upcoming',
    },
    {
      id: 3,
      title: 'Parent-Teacher Meeting',
      date: '2024-03-25',
      time: '02:00 PM - 05:00 PM',
      location: 'Classroom 101',
      type: 'Meeting',
      attendees: 80,
      description: 'Discuss student progress and academic performance.',
      status: 'upcoming',
    },
    {
      id: 4,
      title: 'Eid Celebration',
      date: '2024-04-10',
      time: '10:00 AM - 04:00 PM',
      location: 'School Ground',
      type: 'Celebration',
      attendees: 500,
      description: 'Annual Eid celebration with food, games, and activities.',
      status: 'upcoming',
    },
    {
      id: 5,
      title: 'Arabic Calligraphy Workshop',
      date: '2024-02-28',
      time: '11:00 AM - 01:00 PM',
      location: 'Art Room',
      type: 'Workshop',
      attendees: 30,
      description: 'Learn the art of Arabic calligraphy from master calligraphers.',
      status: 'completed',
    },
  ]);

  const [filter, setFilter] = useState('all');

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.status === filter;
  });

  const getTypeColor = (type) => {
    const colors = {
      'Competition': 'bg-purple-100 text-purple-700',
      'Workshop': 'bg-blue-100 text-blue-700',
      'Meeting': 'bg-orange-100 text-orange-700',
      'Celebration': 'bg-green-100 text-green-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Events & Activities</h2>
          <p className="text-gray-500 mt-1">Stay updated with school events and activities</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
          <button className="px-4 py-2 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-md transition-shadow flex items-center gap-2">
            <FiPlus size={16} />
            Add to Calendar
          </button>
        </div>
      </div>

      {/* Events Calendar View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                {/* Date Box */}
                <div className="shrink-0">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 text-white flex flex-col items-center justify-center shadow-md">
                    <span className="text-xs font-medium uppercase">
                      {new Date(event.date).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="text-xl font-bold">
                      {new Date(event.date).getDate()}
                    </span>
                  </div>
                </div>

                {/* Event Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">{event.title}</h3>
                      <p className="text-gray-500 text-sm mt-1">{event.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(event.type)}`}>
                      {event.type}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <FiClock size={14} className="text-sky-500" />
                      {event.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiMapPin size={14} className="text-sky-500" />
                      {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiUsers size={14} className="text-sky-500" />
                      {event.attendees} attending
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar - Quick Stats */}
        <div className="space-y-4">
          {/* Upcoming Events Count */}
          <div className="bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl p-6 text-white shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <FiCalendar size={24} />
              </div>
              <div>
                <p className="text-white/80 text-sm">Upcoming Events</p>
                <p className="text-3xl font-bold">{events.filter(e => e.status === 'upcoming').length}</p>
              </div>
            </div>
            <p className="text-sm text-white/80">You have events this month</p>
          </div>

          {/* Event Types */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Event Categories</h3>
            <div className="space-y-3">
              {['Competition', 'Workshop', 'Meeting', 'Celebration'].map((type) => {
                const count = events.filter(e => e.type === type).length;
                return (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">{type}</span>
                    <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-600">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Date */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
            <p className="text-gray-500 text-sm mb-2">Today</p>
            <p className="text-3xl font-bold text-gray-800">
              {new Date().getDate()}
            </p>
            <p className="text-gray-600">
              {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentEvents;
