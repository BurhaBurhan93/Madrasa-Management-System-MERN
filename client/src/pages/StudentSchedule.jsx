import React from 'react';
import { useState } from 'react';

const StudentSchedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('weekly'); // weekly, daily, monthly

  // Sample schedule data
  const scheduleData = {
    monday: [
      { id: 1, course: 'MATH201', time: '9:00 AM - 10:30 AM', room: 'Room 201', instructor: 'Dr. Ali Hassan', type: 'lecture' },
      { id: 2, course: 'ARAB101', time: '11:00 AM - 12:30 PM', room: 'Room 105', instructor: 'Prof. Fatima Ahmed', type: 'lecture' },
      { id: 3, course: 'ISLM202', time: '2:00 PM - 3:30 PM', room: 'Room 301', instructor: 'Sheikh Omar Farooq', type: 'seminar' }
    ],
    tuesday: [
      { id: 4, course: 'ENG102', time: '10:00 AM - 11:30 AM', room: 'Room 103', instructor: 'Ms. Sarah Johnson', type: 'lecture' },
      { id: 5, course: 'PHYS101', time: '1:00 PM - 2:30 PM', room: 'Lab 2', instructor: 'Dr. Muhammad Khan', type: 'lab' },
      { id: 6, course: 'MATH201', time: '3:00 PM - 4:30 PM', room: 'Room 201', instructor: 'Dr. Ali Hassan', type: 'tutorial' }
    ],
    wednesday: [
      { id: 7, course: 'ARAB101', time: '9:30 AM - 11:00 AM', room: 'Room 105', instructor: 'Prof. Fatima Ahmed', type: 'tutorial' },
      { id: 8, course: 'ISLM202', time: '12:00 PM - 1:30 PM', room: 'Room 301', instructor: 'Sheikh Omar Farooq', type: 'lecture' },
      { id: 9, course: 'ENG102', time: '3:00 PM - 4:30 PM', room: 'Room 103', instructor: 'Ms. Sarah Johnson', type: 'seminar' }
    ],
    thursday: [
      { id: 10, course: 'PHYS101', time: '10:00 AM - 11:30 AM', room: 'Room 205', instructor: 'Dr. Muhammad Khan', type: 'lecture' },
      { id: 11, course: 'MATH201', time: '1:00 PM - 2:30 PM', room: 'Room 201', instructor: 'Dr. Ali Hassan', type: 'lecture' },
      { id: 12, course: 'ISLM202', time: '3:00 PM - 4:30 PM', room: 'Room 301', instructor: 'Sheikh Omar Farooq', type: 'tutorial' }
    ],
    friday: [
      { id: 13, course: 'ARAB101', time: '11:00 AM - 12:30 PM', room: 'Room 105', instructor: 'Prof. Fatima Ahmed', type: 'lecture' },
      { id: 14, course: 'ENG102', time: '2:00 PM - 3:30 PM', room: 'Room 103', instructor: 'Ms. Sarah Johnson', type: 'tutorial' }
    ]
  };

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const getClassTypeColor = (type) => {
    switch (type) {
      case 'lecture':
        return 'bg-blue-100 text-blue-800';
      case 'tutorial':
        return 'bg-green-100 text-green-800';
      case 'seminar':
        return 'bg-purple-100 text-purple-800';
      case 'lab':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'lecture':
        return 'border-l-4 border-blue-500';
      case 'tutorial':
        return 'border-l-4 border-green-500';
      case 'seminar':
        return 'border-l-4 border-purple-500';
      case 'lab':
        return 'border-l-4 border-yellow-500';
      default:
        return 'border-l-4 border-gray-500';
    }
  };

  const handleDateChange = (direction) => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'daily') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'weekly') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    setSelectedDate(newDate);
  };

  const getCurrentWeekDates = () => {
    const dates = [];
    const startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - startDate.getDay() + 1); // Start from Monday
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Class Schedule</h1>
        <p className="text-gray-600">View and manage your class schedule</p>
      </div>

      <div>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <h2 className="text-2xl font-bold text-gray-800">Class Schedule</h2>
          
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('weekly')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  viewMode === 'weekly' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setViewMode('daily')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  viewMode === 'daily' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Daily
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleDateChange('prev')}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              <span className="px-3 py-2 bg-gray-50 rounded-lg text-sm font-medium min-w-[200px] text-center">
                {viewMode === 'weekly' 
                  ? `Week of ${getCurrentWeekDates()[0].toLocaleDateString()} - ${getCurrentWeekDates()[4].toLocaleDateString()}`
                  : selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                }
              </span>
              
              <button
                onClick={() => handleDateChange('next')}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'weekly' ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {daysOfWeek.map((day, index) => (
              <div key={day} className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800">{dayNames[index]}</h3>
                  <p className="text-sm text-gray-600">
                    {getCurrentWeekDates()[index].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="p-4 space-y-3">
                  {scheduleData[day].length > 0 ? (
                    scheduleData[day].map((classItem) => (
                      <div 
                        key={classItem.id} 
                        className={`p-3 border rounded-lg ${getEventTypeColor(classItem.type)} bg-gray-50`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-800">{classItem.course}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getClassTypeColor(classItem.type)}`}>
                            {classItem.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{classItem.time}</p>
                        <p className="text-sm text-gray-600">Room: {classItem.room}</p>
                        <p className="text-sm text-gray-600 mt-1">Instructor: {classItem.instructor}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4 text-sm">No classes</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Daily view
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {scheduleData[daysOfWeek[selectedDate.getDay()-1]] && 
                 scheduleData[daysOfWeek[selectedDate.getDay()-1]].length > 0 ? (
                  scheduleData[daysOfWeek[selectedDate.getDay()-1]].map((classItem) => (
                    <div 
                      key={classItem.id} 
                      className={`p-4 border rounded-lg ${getEventTypeColor(classItem.type)} bg-gray-50`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <h4 className="font-medium text-gray-800 text-lg">{classItem.course}</h4>
                            <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getClassTypeColor(classItem.type)}`}>
                              {classItem.type}
                            </span>
                          </div>
                          <p className="text-gray-700 mt-2">{classItem.time}</p>
                          <div className="flex space-x-4 mt-2">
                            <p className="text-sm text-gray-600">Room: {classItem.room}</p>
                            <p className="text-sm text-gray-600">Instructor: {classItem.instructor}</p>
                          </div>
                        </div>
                        <button className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                          Join Class
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No classes scheduled for today.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 border border-gray-200 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">Midterm Examinations</h4>
                <p className="text-sm text-gray-600">March 15-20, 2024 • All Classes</p>
              </div>
            </div>
            <div className="flex items-center p-3 border border-gray-200 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.247 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">Library Orientation</h4>
                <p className="text-sm text-gray-600">February 25, 2024 • 10:00 AM - 11:30 AM</p>
              </div>
            </div>
            <div className="flex items-center p-3 border border-gray-200 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">Career Guidance Workshop</h4>
                <p className="text-sm text-gray-600">March 5, 2024 • 2:00 PM - 4:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Integration Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-start">
            <div className="p-2 bg-blue-100 rounded-lg mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Calendar Integration</h3>
              <p className="text-gray-600 mb-3">Sync your class schedule with Google Calendar or Outlook to never miss a class.</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                Connect Calendar
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default StudentSchedule;
