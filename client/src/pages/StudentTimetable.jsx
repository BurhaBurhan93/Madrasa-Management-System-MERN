import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UIHelper/Card';
import Badge from '../components/UIHelper/Badge';
import ErrorPage from '../components/UIHelper/ErrorPage';
import axios from 'axios';

const StudentTimetable = () => {
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    class: '',
    semester: ''
  });

  // Get API config with auth token
  const getConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const config = getConfig();
      
      // Fetch student profile to get class info
      const profileRes = await axios.get('http://localhost:5000/api/student/profile', config);
      if (profileRes.data) {
        setStudentInfo({
          name: profileRes.data.name || '',
          class: profileRes.data.currentClass?.className || 'N/A',
          semester: profileRes.data.currentSemester || 'Next Semester'
        });
      }

      // Fetch timetable/schedule for next semester
      // This would typically come from a Class/Schedule model
      // For now, we'll fetch subjects and create a sample timetable
      const coursesRes = await axios.get('http://localhost:5000/api/student/courses', config);
      const courses = coursesRes.data || [];

      // Transform courses into timetable format
      // In a real implementation, this would come from a Schedule/Timetable model
      const scheduleData = courses.map(course => ({
        _id: course._id,
        subject: course.name || course.subjectName || 'Subject',
        teacher: course.teacher?.name || course.instructor || 'Teacher Name',
        day: getDayForCourse(course),
        time: course.schedule?.time || '9:00 AM - 10:30 AM',
        room: course.schedule?.room || 'Room 101',
        credits: course.credits || 3,
        semester: 'Next Semester'
      }));

      setTimetable(scheduleData);
    } catch (err) {
      console.error('[StudentTimetable] Error:', err);
      setError('Failed to fetch timetable. Please try again.');
      setTimetable([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to assign days to courses (for demo purposes)
  const getDayForCourse = (course, index = 0) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    // Use course index or hash to consistently assign days
    const dayIndex = course._id ? 
      course._id.charCodeAt(course._id.length - 1) % days.length : 
      index % days.length;
    return days[dayIndex];
  };

  const getTimeSlot = (timeString) => {
    if (!timeString) return '9:00 AM';
    const match = timeString.match(/(\d+:\d+)\s*(AM|PM)/i);
    return match ? `${match[1]} ${match[2].toUpperCase()}` : '9:00 AM';
  };

  const getDuration = (timeString) => {
    if (!timeString) return '90 mins';
    const parts = timeString.split('-');
    if (parts.length < 2) return '90 mins';
    
    const start = parseTime(parts[0].trim());
    const end = parseTime(parts[1].trim());
    
    if (!start || !end) return '90 mins';
    
    const diffMs = end - start;
    const diffMins = Math.round(diffMs / (1000 * 60));
    return `${diffMins} mins`;
  };

  const parseTime = (timeStr) => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return null;
    
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3].toUpperCase();
    
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    
    return new Date(2000, 0, 1, hours, minutes);
  };

  const groupByDay = (data) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const grouped = {};
    days.forEach(day => {
      grouped[day] = data.filter(item => item.day === day).sort((a, b) => {
        const timeA = parseTime(getTimeSlot(a.time)) || new Date(2000, 0, 1, 9, 0);
        const timeB = parseTime(getTimeSlot(b.time)) || new Date(2000, 0, 1, 9, 0);
        return timeA - timeB;
      });
    });
    return grouped;
  };

  const groupedTimetable = groupByDay(timetable);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading timetable...</p>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <ErrorPage 
        type="generic" 
        title="Unable to Load Timetable"
        message={error}
        onRetry={fetchTimetable}
        onHome={() => navigate('/student/dashboard')}
        showBackButton={false}
      />
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Next Semester Timetable</h1>
        <p className="text-gray-600">View your upcoming semester schedule with subjects and teachers</p>
        
        <div className="mt-4 flex items-center gap-4">
          <Badge variant="primary">{studentInfo.semester}</Badge>
          <Badge variant="secondary">{studentInfo.class}</Badge>
          <Badge variant="success">{timetable.length} Courses</Badge>
        </div>
      </div>

      {/* Weekly Schedule Grid */}
      <Card className="mb-8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Day</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                <tr key={day}>
                  <td className="px-4 py-4 align-top">
                    <div className="font-semibold text-gray-900">{day}</div>
                    <div className="text-sm text-gray-500">
                      {groupedTimetable[day]?.length || 0} classes
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {groupedTimetable[day]?.length > 0 ? (
                      <div className="space-y-3">
                        {groupedTimetable[day].map((slot, idx) => (
                          <div 
                            key={slot._id || idx}
                            className="border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{slot.subject}</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  👨‍🏫 {slot.teacher}
                                </p>
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                  {slot.time}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {getDuration(slot.time)}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-4 text-sm text-gray-500">
                              <span>📍 {slot.room}</span>
                              <span>📚 {slot.credits} credits</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm italic">No classes scheduled</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Course List by Teacher */}
      <Card>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Courses & Teachers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {timetable.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2">No courses found for next semester.</p>
            </div>
          ) : (
            timetable.map((course, index) => (
              <div 
                key={course._id || index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 flex-1">{course.subject}</h4>
                  <Badge variant="primary">{course.credits} Cr</Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">👨‍🏫</span>
                    <span className="font-medium">{course.teacher}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">📅</span>
                    <span>{course.day}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">⏰</span>
                    <span>{course.time}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">📍</span>
                    <span>{course.room}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Important Notes */}
      <Card className="mt-8 bg-yellow-50 border-yellow-200">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Important Notes</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li>This is the preliminary timetable for next semester</li>
                <li>Schedule may be subject to changes before the semester starts</li>
                <li>Please check the portal regularly for updates</li>
                <li>Contact the registrar's office for any scheduling conflicts</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StudentTimetable;
