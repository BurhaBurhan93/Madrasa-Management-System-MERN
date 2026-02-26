import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiBook, FiUsers, FiInbox, FiTrendingUp, FiActivity,
  FiCheckCircle, FiClock, FiAlertCircle
} from 'react-icons/fi';

const StaffDashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    borrowedBooks: 0,
    totalStudents: 0,
    pendingComplaints: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const pendingTasks = [
    { id: 1, task: 'Review new book requests', priority: 'high', due: 'Today' },
    { id: 2, task: 'Update library catalog', priority: 'medium', due: 'Tomorrow' },
    { id: 3, task: 'Follow up on overdue books', priority: 'high', due: 'Today' },
    { id: 4, task: 'Prepare monthly report', priority: 'low', due: 'Next week' },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch dashboard stats
      const statsResponse = await axios.get('http://localhost:5000/api/staff/dashboard');
      setStats(statsResponse.data);

      // Fetch recent activities
      const activitiesResponse = await axios.get('http://localhost:5000/api/staff/activities');
      setRecentActivities(activitiesResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-orange-100 text-orange-700',
      low: 'bg-green-100 text-green-700',
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  const getActivityIcon = (type) => {
    const icons = {
      borrow: <FiBook className="text-blue-500" />,
      return: <FiCheckCircle className="text-green-500" />,
      complaint: <FiAlertCircle className="text-red-500" />,
      add: <FiTrendingUp className="text-purple-500" />,
      resolve: <FiCheckCircle className="text-green-500" />,
    };
    return icons[type] || <FiActivity className="text-gray-500" />;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60); // minutes
    
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff} min ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
    return `${Math.floor(diff / 1440)} days ago`;
  };

  const statsData = [
    { label: 'Total Books', value: stats.totalBooks, icon: FiBook, color: 'from-blue-400 to-blue-600' },
    { label: 'Borrowed', value: stats.borrowedBooks, icon: FiActivity, color: 'from-orange-400 to-orange-600' },
    { label: 'Active Users', value: stats.totalStudents, icon: FiUsers, color: 'from-green-400 to-green-600' },
    { label: 'Pending Complaints', value: stats.pendingComplaints, icon: FiInbox, color: 'from-red-400 to-red-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Staff Dashboard</h2>
        <p className="text-gray-500 mt-1">Overview of library and complaints management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-md`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivities.length > 0 ? recentActivities.map((activity) => (
              <div key={activity.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.detail}</p>
                </div>
                <span className="text-xs text-gray-400">{formatTime(activity.time)}</span>
              </div>
            )) : (
              <div className="p-8 text-center text-gray-500">
                No recent activities
              </div>
            )}
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Pending Tasks</h3>
            <span className="text-sm text-sky-600 font-medium">{pendingTasks.length} tasks</span>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingTasks.map((task) => (
              <div key={task.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <FiClock className="text-gray-400" />
                  <span className="text-gray-700">{task.task}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className="text-xs text-gray-400">{task.due}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-sky-400 to-blue-500 rounded-2xl p-6 text-white">
        <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Add New Book', icon: FiBook },
            { label: 'Process Borrow', icon: FiActivity },
            { label: 'View Complaints', icon: FiInbox },
            { label: 'Generate Report', icon: FiTrendingUp },
          ].map((action, index) => (
            <button
              key={index}
              className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-center transition-colors"
            >
              <action.icon size={24} className="mx-auto mb-2" />
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
