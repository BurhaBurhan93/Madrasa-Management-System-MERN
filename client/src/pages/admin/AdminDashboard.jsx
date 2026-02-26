import React, { useState } from 'react';
import { BarChartComponent, LineChartComponent, PieChartComponent } from '../../components/UIHelper/Chart';
import Card from '../../components/UIHelper/Card';
import Avatar from '../../components/UIHelper/Avatar';
import { formatDate } from '../../lib/utils';

const AdminDashboard = () => {
  const [quickStats] = useState({
    totalStudents: 450,
    totalTeachers: 32,
    totalStaff: 18,
    totalCourses: 48,
    monthlyRevenue: 125000,
    pendingComplaints: 12
  });

  const enrollmentData = [
    { month: 'Jan', students: 380 },
    { month: 'Feb', students: 395 },
    { month: 'Mar', students: 410 },
    { month: 'Apr', students: 425 },
    { month: 'May', students: 440 },
    { month: 'Jun', students: 450 }
  ];

  const revenueData = [
    { month: 'Jan', amount: 95000 },
    { month: 'Feb', amount: 102000 },
    { month: 'Mar', amount: 108000 },
    { month: 'Apr', amount: 115000 },
    { month: 'May', amount: 118000 },
    { month: 'Jun', amount: 125000 }
  ];

  const userDistributionData = [
    { name: 'Students', value: 450, color: '#3B82F6' },
    { name: 'Teachers', value: 32, color: '#10B981' },
    { name: 'Staff', value: 18, color: '#8B5CF6' },
    { name: 'Admins', value: 5, color: '#EF4444' }
  ];

  const recentActivity = [
    { id: 1, title: 'New Student Registered', user: 'Mohammed Ali', date: '2024-02-10', type: 'student' },
    { id: 2, title: 'Fee Payment Received', user: 'Ahmed Hassan', amount: '$500', date: '2024-02-10', type: 'payment' },
    { id: 3, title: 'New Teacher Added', user: 'Ustad Abdullah', date: '2024-02-09', type: 'teacher' },
    { id: 4, title: 'Complaint Resolved', user: 'Student #1245', date: '2024-02-09', type: 'complaint' },
    { id: 5, title: 'Exam Schedule Published', user: 'Academic Dept', date: '2024-02-08', type: 'academic' }
  ];

  const upcomingEvents = [
    { id: 1, title: 'Board Meeting', date: '2024-02-15', time: '10:00 AM', type: 'meeting' },
    { id: 2, title: 'Parent-Teacher Conference', date: '2024-02-16', time: '2:00 PM', type: 'conference' },
    { id: 3, title: 'Mid-term Exams Begin', date: '2024-02-20', time: '9:00 AM', type: 'exam' },
    { id: 4, title: 'Staff Training Workshop', date: '2024-02-22', time: '10:00 AM', type: 'training' }
  ];

  const getActivityIcon = (type) => {
    const icons = {
      student: '👤',
      payment: '💰',
      teacher: '👨‍🏫',
      complaint: '📋',
      academic: '📚'
    };
    return icons[type] || '📌';
  };

  const getEventIcon = (type) => {
    const icons = {
      meeting: '🤝',
      conference: '🗣️',
      exam: '📝',
      training: '🎓'
    };
    return icons[type] || '📅';
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="px-6 py-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back! Here's an overview of your madrasa.
        </p>
      </div>

      <div className="px-6">
        {/* Admin Profile */}
        <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar size="xl" className="mr-4" />
              <div>
                <h2 className="text-2xl font-bold">Administrator</h2>
                <p className="text-red-100">Admin ID: ADM2024001</p>
                <div className="mt-2 flex items-center space-x-4">
                  <span className="bg-red-400/30 px-3 py-1 rounded-full text-sm">Super Admin</span>
                  <span className="bg-red-400/30 px-3 py-1 rounded-full text-sm">Active</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-red-100">Current Session</p>
              <p className="text-xl font-semibold">{formatDate(new Date().toISOString())}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Card>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-3">
                <span className="text-2xl">👨‍🎓</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{quickStats.totalStudents}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-3">
                <span className="text-2xl">👨‍🏫</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Teachers</p>
                <p className="text-2xl font-bold text-gray-900">{quickStats.totalTeachers}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-3">
                <span className="text-2xl">⚙️</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Staff</p>
                <p className="text-2xl font-bold text-gray-900">{quickStats.totalStaff}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 mr-3">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Courses</p>
                <p className="text-2xl font-bold text-gray-900">{quickStats.totalCourses}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-emerald-100 mr-3">
                <span className="text-2xl">💵</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${(quickStats.monthlyRevenue / 1000).toFixed(0)}k</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 mr-3">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Complaints</p>
                <p className="text-2xl font-bold text-gray-900">{quickStats.pendingComplaints}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card title="Student Enrollment Trend">
            <BarChartComponent
              data={enrollmentData}
              dataKey="students"
              nameKey="month"
            />
          </Card>

          <Card title="Monthly Revenue">
            <LineChartComponent
              data={revenueData}
              dataKey="amount"
              nameKey="month"
            />
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card title="User Distribution">
            <div className="h-64">
              <PieChartComponent data={userDistributionData} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {userDistributionData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Recent Activity" className="lg:col-span-2">
            <ul className="divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <li key={activity.id} className="py-3">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500">
                        {activity.user}
                        {activity.amount && <span className="text-green-600 font-medium"> • {activity.amount}</span>}
                        <span className="text-gray-400"> • {formatDate(activity.date)}</span>
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Upcoming Events */}
        <Card title="Upcoming Events">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{getEventIcon(event.type)}</span>
                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                </div>
                <p className="text-sm text-gray-500">{formatDate(event.date)}</p>
                <p className="text-sm text-gray-500">{event.time}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
