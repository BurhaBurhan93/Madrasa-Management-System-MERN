import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UIHelper/Card';
import Badge from '../components/UIHelper/Badge';
import { BarChartComponent } from '../components/UIHelper/Chart';
import ErrorPage from '../components/UIHelper/ErrorPage';
import { formatDate } from '../lib/utils';
import axios from 'axios';

const StudentAttendance = () => {
  console.log('[StudentAttendance] Component initializing...');
  const navigate = useNavigate();
  
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  // Get API config with auth token
  const getConfig = () => {
    const token = localStorage.getItem('token');
    console.log('[StudentAttendance] Token exists:', !!token);
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  useEffect(() => {
    console.log('[StudentAttendance] useEffect triggered - fetching data from API...');
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[StudentAttendance] Fetching attendance records from API...');
      
      const config = getConfig();
      const response = await axios.get('http://localhost:5000/api/student/attendance', config);
      
      console.log('[StudentAttendance] API response:', response.data);
      const records = response.data || [];
      setAttendanceData(records);
    } catch (err) {
      console.error('[StudentAttendance] Error fetching attendance data:', err);
      setError('Failed to fetch attendance records. Please try again.');
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from actual data
  const stats = React.useMemo(() => {
    const totalDays = attendanceData.length;
    const present = attendanceData.filter(r => r.status === 'present').length;
    const absent = attendanceData.filter(r => r.status === 'absent').length;
    const late = attendanceData.filter(r => r.status === 'late').length;
    const attendanceRate = totalDays > 0 ? Math.round(((present + late) / totalDays) * 100) : 0;
    
    return { totalDays, present, absent, late, attendanceRate };
  }, [attendanceData]);

  // Calculate monthly stats from actual data
  const monthlyStats = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map(month => ({ month, present: 0, absent: 0, late: 0 }));
    
    attendanceData.forEach(record => {
      if (record.date) {
        const date = new Date(record.date);
        const monthIndex = date.getMonth();
        if (monthIndex >= 0 && monthIndex < 12) {
          if (record.status === 'present') data[monthIndex].present++;
          else if (record.status === 'absent') data[monthIndex].absent++;
          else if (record.status === 'late') data[monthIndex].late++;
        }
      }
    });
    
    // Return last 6 months with data
    return data.slice(-6);
  }, [attendanceData]);

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
      <div className="py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Attendance Records</h1>
        <p className="text-gray-600">Track your attendance history and performance</p>
      </div>

      {error && !loading && (
        <ErrorPage 
          type="server" 
          title="Unable to Load Attendance"
          message={error}
          onRetry={fetchAttendanceData}
          onHome={() => window.location.href = '/student/dashboard'}
          showBackButton={false}
        />
      )}

      {/* Quick Stats */}
      <div>
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
      <div className="mb-8">
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
      <div className="flex flex-wrap items-center justify-between mb-6">
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
      <div className="pb-8">
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
