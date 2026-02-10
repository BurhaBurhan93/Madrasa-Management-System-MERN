import { useState, useEffect } from 'react';

const Dashboard = () => {
  const [quickStats, setQuickStats] = useState({
    totalCourses: 5,
    attendanceRate: 95,
    assignmentsPending: 3,
    upcomingExams: 2
  });

  const [upcomingEvents, setUpcomingEvents] = useState([
    { id: 1, title: 'Mathematics Exam', date: '2024-02-15', time: '10:00 AM', type: 'exam' },
    { id: 2, title: 'Assignment Submission', date: '2024-02-16', time: '11:59 PM', type: 'assignment' },
    { id: 3, title: 'Islamic Studies Quiz', date: '2024-02-18', time: '2:00 PM', type: 'quiz' },
    { id: 4, title: 'Parent-Teacher Meeting', date: '2024-02-20', time: '3:00 PM', type: 'meeting' }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Your assignment has been graded', time: '2 hours ago', read: false },
    { id: 2, message: 'New course material available', time: '1 day ago', read: true },
    { id: 3, message: 'Fee payment reminder', time: '2 days ago', read: true }
  ]);

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, action: 'Submitted Assignment', subject: 'Mathematics', time: 'Today, 10:30 AM' },
    { id: 2, action: 'Attended Class', subject: 'Arabic', time: 'Yesterday, 2:15 PM' },
    { id: 3, action: 'Viewed Lecture Notes', subject: 'Islamic Studies', time: 'Feb 8, 9:00 AM' },
    { id: 4, action: 'Received Grade', subject: 'English', time: 'Feb 7, 4:20 PM' }
  ]);

  useEffect(() => {
    // Simulate fetching dashboard data
    const fetchDashboardData = async () => {
      // In a real app, this would be an API call
      console.log('Fetching dashboard data...');
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <div className="text-sm text-gray-600">
          Welcome back, Student!
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">📚</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
              <p className="text-2xl font-bold text-gray-900">{quickStats.totalCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
              <p className="text-2xl font-bold text-gray-900">{quickStats.attendanceRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{quickStats.assignmentsPending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming Exams</p>
              <p className="text-2xl font-bold text-gray-900">{quickStats.upcomingExams}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Upcoming Events</h3>
            <button className="text-blue-600 text-sm font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {upcomingEvents.map(event => (
              <div key={event.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className={`p-2 rounded-lg ${
                  event.type === 'exam' ? 'bg-red-100' :
                  event.type === 'assignment' ? 'bg-yellow-100' :
                  event.type === 'quiz' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  <span className="text-lg">
                    {event.type === 'exam' ? '✏️' :
                     event.type === 'assignment' ? '📝' :
                     event.type === 'quiz' ? '❓' : '👥'}
                  </span>
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-medium text-gray-800">{event.title}</h4>
                  <p className="text-sm text-gray-600">{event.date} at {event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
            <button className="text-blue-600 text-sm font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {recentActivity.map(activity => (
              <div key={activity.id} className="flex items-start">
                <div className="p-2 bg-gray-100 rounded-full">
                  <span className="text-sm">🔹</span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                  <p className="text-xs text-gray-600">{activity.subject}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications Preview */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
          <button className="text-blue-600 text-sm font-medium">View All</button>
        </div>
        <div className="space-y-3">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`flex items-center p-3 rounded-lg ${
                !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'
              }`}
            >
              <div className="mr-3">
                <span className="text-lg">🔔</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">{notification.message}</p>
                <p className="text-xs text-gray-500">{notification.time}</p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;