import React, { useState, useEffect } from 'react';
import { PieChartComponent, BarChartComponent } from '../../components/UIHelper/ECharts';
import Card from '../../components/UIHelper/Card';
import Avatar from '../../components/UIHelper/Avatar';
import { formatDate } from '../../lib/utils';
import axios from 'axios';

const AdminDashboard = () => {
  const [quickStats, setQuickStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalStaff: 0,
    totalCourses: 48,
    monthlyRevenue: 125000,
    pendingComplaints: 12
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users');
      const users = res.data.data;
      setQuickStats(prev => ({
        ...prev,
        totalStudents: users.filter(u => u.role === 'student').length,
        totalTeachers: users.filter(u => u.role === 'teacher').length,
        totalStaff: users.filter(u => u.role === 'staff').length
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // TODO: Replace with actual enrollment data from API when available
  const [enrollmentData, setEnrollmentData] = useState([]);

  // TODO: Replace with actual revenue data from API when available
  const [revenueData, setRevenueData] = useState([]);

  const userDistributionData = [
    { name: 'Students', value: quickStats.totalStudents, color: '#3B82F6' },
    { name: 'Teachers', value: quickStats.totalTeachers, color: '#10B981' },
    { name: 'Staff', value: quickStats.totalStaff, color: '#8B5CF6' }
  ];

  // TODO: Replace with actual recent activity from API when available
  const [recentActivity] = useState([]);

  // TODO: Replace with actual upcoming events from API when available
  const [upcomingEvents] = useState([]);

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
