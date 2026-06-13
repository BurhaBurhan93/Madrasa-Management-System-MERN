import React, { useState, useEffect } from 'react';
import Card from '../../../components/UIHelper/Card';
import { FiCalendar, FiUsers, FiCheckCircle, FiXCircle, FiClock, FiSearch, FiFilter, FiDownload } from 'react-icons/fi';
import CalendarDatePicker from "../../../components/UIHelper/CalendarDatePicker";

const AdminAttendanceDaily = () => {
  const [attendance, setAttendance] = useState([
    { id: 1, class: 'Class 1', date: '2024-03-15', present: 25, absent: 5, total: 30, percentage: 83.3, teacher: 'Mr. Ahmed' },
    { id: 2, class: 'Class 2', date: '2024-03-15', present: 28, absent: 2, total: 30, percentage: 93.3, teacher: 'Ms. Fatima' },
    { id: 3, class: 'Class 3', date: '2024-03-15', present: 27, absent: 3, total: 30, percentage: 90.0, teacher: 'Mr. Ali' },
    { id: 4, class: 'Class 4', date: '2024-03-15', present: 26, absent: 4, total: 30, percentage: 86.7, teacher: 'Ms. Sara' },
    { id: 5, class: 'Class 5', date: '2024-03-15', present: 29, absent: 1, total: 30, percentage: 96.7, teacher: 'Mr. Hassan' },
    { id: 6, class: 'Class 6', date: '2024-03-15', present: 24, absent: 6, total: 30, percentage: 80.0, teacher: 'Ms. Aisha' },
  ]);

  const [selectedDate, setSelectedDate] = useState('2024-03-15');
  const [classFilter, setClassFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const classes = ['all', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

  const filteredAttendance = attendance.filter(record => {
    const matchesSearch = record.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.teacher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === 'all' || record.class === classFilter;
    const matchesDate = record.date === selectedDate;
    return matchesSearch && matchesClass && matchesDate;
  });

  const totalPresent = attendance.reduce((sum, record) => sum + record.present, 0);
  const totalAbsent = attendance.reduce((sum, record) => sum + record.absent, 0);
  const totalStudents = attendance.reduce((sum, record) => sum + record.total, 0);
  const overallPercentage = totalStudents > 0 ? ((totalPresent / totalStudents) * 100).toFixed(1) : 0;

  const handleMarkAttendance = (classId, status) => {
    setAttendance(attendance.map(record => {
      if (record.id === classId) {
        if (status === 'present') {
          return { 
            ...record, 
            present: record.present + 1, 
            absent: record.absent > 0 ? record.absent - 1 : 0,
            percentage: ((record.present + 1) / record.total * 100).toFixed(1)
          };
        } else if (status === 'absent') {
          return { 
            ...record, 
            present: record.present > 0 ? record.present - 1 : 0, 
            absent: record.absent + 1,
            percentage: ((record.present > 0 ? record.present - 1 : 0) / record.total * 100).toFixed(1)
          };
        }
      }
      return record;
    }));
  };

  const AttendanceCard = ({ record }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{record.class}</h3>
          <p className="text-gray-600">Teacher: {record.teacher}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Attendance Rate</p>
          <p className={`text-2xl font-bold ${record.percentage >= 90 ? 'text-green-600' : record.percentage >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
            {record.percentage}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
            <FiCheckCircle size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Present</p>
            <p className="font-semibold text-gray-900">{record.present}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
            <FiXCircle size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Absent</p>
            <p className="font-semibold text-gray-900">{record.absent}</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-500">Total: {record.total} students</span>
          <span className="text-sm font-medium text-gray-900">
            {record.present}/{record.total}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${
              record.percentage >= 90 ? 'bg-green-500' : 
              record.percentage >= 80 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${record.percentage}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={() => handleMarkAttendance(record.id, 'present')}
          className="flex-1 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium text-sm"
        >
          Mark Present
        </button>
        <button 
          onClick={() => handleMarkAttendance(record.id, 'absent')}
          className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium text-sm"
        >
          Mark Absent
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📅 Daily Attendance</h1>
          <p className="text-gray-600 mt-1">Manage daily student attendance records</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-300 font-semibold">
            <FiDownload size={18} /> Export Report
          </button>
          <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg">
            Take Attendance
          </button>
        </div>
      </div>

      {/* Date Selector */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <FiCalendar size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Selected Date</p>
              <CalendarDatePicker value={selectedDate} onChange={(date) => setSelectedDate(date)} placeholder="Select date" />
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Today's Date</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Present Today</p>
              <p className="text-2xl font-bold">{totalPresent}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiCheckCircle size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Absent Today</p>
              <p className="text-2xl font-bold">{totalAbsent}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiXCircle size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Students</p>
              <p className="text-2xl font-bold">{totalStudents}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiUsers size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Overall Rate</p>
              <p className="text-2xl font-bold">{overallPercentage}%</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiClock size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by class or teacher name..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
              >
                {classes.map(cls => (
                  <option key={cls} value={cls}>
                    {cls === 'all' ? 'All Classes' : cls}
                  </option>
                ))}
              </select>
            </div>
            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
              <option>Sort by Class</option>
              <option>Sort by Attendance Rate</option>
              <option>Sort by Present Count</option>
              <option>Sort by Teacher</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Attendance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAttendance.map(record => (
          <AttendanceCard key={record.id} record={record} />
        ))}
      </div>

      {/* Detailed Attendance Table */}
      <Card className="mt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Detailed Attendance Report - {new Date(selectedDate).toLocaleDateString()}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Present</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Absent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendance.map(record => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.class}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.teacher}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.present}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.absent}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            record.percentage >= 90 ? 'bg-green-500' : 
                            record.percentage >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${record.percentage}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${
                        record.percentage >= 90 ? 'text-green-600' : 
                        record.percentage >= 80 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {record.percentage}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      record.percentage >= 90 ? 'bg-green-100 text-green-800' : 
                      record.percentage >= 80 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {record.percentage >= 90 ? 'Excellent' : record.percentage >= 80 ? 'Good' : 'Needs Attention'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">View Details</button>
                    <button className="text-green-600 hover:text-green-900">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Attendance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Attendance Summary</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-500">Overall Attendance Rate</span>
                <span className="text-sm font-medium text-gray-900">{overallPercentage}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    overallPercentage >= 90 ? 'bg-green-500' : 
                    overallPercentage >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${overallPercentage}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{totalPresent}</p>
                <p className="text-sm text-green-700">Present Students</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{totalAbsent}</p>
                <p className="text-sm text-red-700">Absent Students</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <p className="font-medium text-blue-900">Send Absence Notifications</p>
              <p className="text-sm text-blue-700">Notify parents of absent students</p>
            </button>
            <button className="w-full text-left p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <p className="font-medium text-green-900">Generate Monthly Report</p>
              <p className="text-sm text-green-700">Create attendance report for this month</p>
            </button>
            <button className="w-full text-left p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <p className="font-medium text-purple-900">View Attendance Trends</p>
              <p className="text-sm text-purple-700">Analyze attendance patterns over time</p>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminAttendanceDaily;
