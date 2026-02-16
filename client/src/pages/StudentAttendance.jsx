import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UIHelper/Card';
import Badge from '../components/UIHelper/Badge';
import { BarChartComponent } from '../components/UIHelper/Chart';
import { formatDate } from '../lib/utils';

const StudentAttendance = () => {
  const navigate = useNavigate();
  
  const [attendanceData, setAttendanceData] = useState([
    { id: 1, date: '2024-02-01', course: 'Mathematics', status: 'present', time: '09:00 AM' },
    { id: 2, date: '2024-02-01', course: 'Physics', status: 'present', time: '10:30 AM' },
    { id: 3, date: '2024-02-01', course: 'Chemistry', status: 'absent', time: '12:00 PM' },
    { id: 4, date: '2024-02-02', course: 'Mathematics', status: 'present', time: '09:00 AM' },
    { id: 5, date: '2024-02-02', course: 'Physics', status: 'late', time: '10:45 AM' },
    { id: 6, date: '2024-02-02', course: 'Chemistry', status: 'present', time: '12:00 PM' },
    { id: 7, date: '2024-02-03', course: 'Mathematics', status: 'present', time: '09:00 AM' },
    { id: 8, date: '2024-02-03', course: 'Physics', status: 'present', time: '10:30 AM' },
    { id: 9, date: '2024-02-03', course: 'Chemistry', status: 'present', time: '12:00 PM' },
  ]);

  const [monthlyStats, setMonthlyStats] = useState([
    { month: 'Jan', present: 22, absent: 2, late: 1 },
    { month: 'Feb', present: 18, absent: 1, late: 0 },
    { month: 'Mar', present: 20, absent: 0, late: 2 },
    { month: 'Apr', present: 21, absent: 1, late: 1 },
    { month: 'May', present: 19, absent: 3, late: 0 },
    { month: 'Jun', present: 20, absent: 0, late: 1 },
  ]);

  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    totalDays: 25,
    present: 22,
    absent: 2,
    late: 1,
    attendanceRate: 96
  });

  const filteredAttendance = attendanceData.filter(record => {
    if (filter === 'all') return true;
    return record.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'danger';
      case 'late':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'absent':
        return 'Absent';
      case 'late':
        return 'Late';
      default:
        return status;
    }
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="px-4 sm:px-6 md:px-8 py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Attendance Records</h1>
        <p className="text-gray-600">Track your attendance history and performance</p>
      </div>

      {/* Quick Stats */}
      <div className="px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
          <Card className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.totalDays}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Days</div>
          </Card>
          
          <Card className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-green-600">{stats.present}</div>
            <div className="text-xs sm:text-sm text-gray-600">Present</div>
          </Card>
          
          <Card className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-red-600">{stats.absent}</div>
            <div className="text-xs sm:text-sm text-gray-600">Absent</div>
          </Card>
          
          <Card className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.late}</div>
            <div className="text-xs sm:text-sm text-gray-600">Late</div>
          </Card>
          
          <Card className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.attendanceRate}%</div>
            <div className="text-xs sm:text-sm text-gray-600">Rate</div>
          </Card>
        </div>
      </div>

      {/* Attendance Chart */}
      <div className="px-4 sm:px-6 md:px-8 mb-8">
        <Card title="Monthly Attendance Trend">
          <BarChartComponent 
            data={monthlyStats} 
            dataKey="present" 
            nameKey="month" 
            title="Attendance by Month"
          />
        </Card>
      </div>

      {/* Filter Controls */}
      <div className="px-4 sm:px-6 md:px-8 flex flex-wrap items-center justify-between mb-6">
        <div className="flex space-x-2 mb-4 md:mb-0">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('present')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'present'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Present
          </button>
          <button
            onClick={() => setFilter('absent')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'absent'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Absent
          </button>
          <button
            onClick={() => setFilter('late')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'late'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Late
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="px-4 sm:px-6 md:px-8 pb-8">
        <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendance.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(record.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.course}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusColor(record.status)}>
                      {getStatusText(record.status)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      </div>
    </div>
  );
};

export default StudentAttendance;