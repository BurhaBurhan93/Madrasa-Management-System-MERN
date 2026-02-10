import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UIHelper/Card';
import { BarChartComponent, LineChartComponent } from '../components/UIHelper/Chart';
import { formatDate } from '../lib/utils';

const StudentAttendance = () => {
  const navigate = useNavigate();
  const [attendanceData, setAttendanceData] = useState({
    overallPercentage: 95,
    monthlyData: [
      { month: 'Jan', percentage: 98, days: 22 },
      { month: 'Feb', percentage: 92, days: 18 },
      { month: 'Mar', percentage: 96, days: 20 },
      { month: 'Apr', percentage: 94, days: 22 },
      { month: 'May', percentage: 97, days: 20 },
      { month: 'Jun', percentage: 95, days: 22 }
    ],
    courseWise: [
      { course: 'MATH201', percentage: 98, totalClasses: 30, attended: 29 },
      { course: 'ARAB101', percentage: 95, totalClasses: 28, attended: 26 },
      { course: 'ISLM202', percentage: 90, totalClasses: 25, attended: 22 },
      { course: 'ENG102', percentage: 97, totalClasses: 26, attended: 25 },
      { course: 'PHYS101', percentage: 94, totalClasses: 24, attended: 22 }
    ],
    recentRecords: [
      { date: '2024-02-10', course: 'MATH201', status: 'present', time: '09:00 AM' },
      { date: '2024-02-10', course: 'ARAB101', status: 'present', time: '11:00 AM' },
      { date: '2024-02-09', course: 'ISLM202', status: 'present', time: '10:00 AM' },
      { date: '2024-02-09', course: 'ENG102', status: 'absent', time: '02:00 PM' },
      { date: '2024-02-08', course: 'PHYS101', status: 'present', time: '11:00 AM' },
      { date: '2024-02-08', course: 'MATH201', status: 'present', time: '09:00 AM' },
      { date: '2024-02-07', course: 'ARAB101', status: 'late', time: '11:15 AM' },
      { date: '2024-02-07', course: 'ISLM202', status: 'present', time: '10:00 AM' }
    ]
  });

  // Data for charts
  const monthlyAttendanceData = attendanceData.monthlyData.map(item => ({
    name: item.month,
    percentage: item.percentage
  }));

  const courseAttendanceData = attendanceData.courseWise.map(item => ({
    name: item.course,
    percentage: item.percentage
  }));

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-600">Track your attendance records and statistics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-blue-50 border-blue-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Attendance</p>
              <p className="text-2xl font-bold text-gray-900">{attendanceData.overallPercentage}%</p>
            </div>
          </div>
        </Card>

        <Card className="bg-green-50 border-green-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Classes</p>
              <p className="text-2xl font-bold text-gray-900">
                {attendanceData.courseWise.reduce((sum, course) => sum + course.totalClasses, 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-purple-50 border-purple-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Present Days</p>
              <p className="text-2xl font-bold text-gray-900">
                {attendanceData.courseWise.reduce((sum, course) => sum + course.attended, 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card title="Monthly Attendance Trend">
          <LineChartComponent 
            data={monthlyAttendanceData} 
            dataKey="percentage" 
            nameKey="name" 
            title="Monthly Attendance Percentage"
            height={300}
          />
        </Card>

        <Card title="Attendance by Course">
          <BarChartComponent 
            data={courseAttendanceData} 
            dataKey="percentage" 
            nameKey="name" 
            title="Attendance Percentage by Course"
            height={300}
          />
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course-wise Attendance */}
        <Card title="Attendance by Course">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Classes
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attended
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceData.courseWise.map((course, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {course.course}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.totalClasses}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.attended}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                          <div 
                            className={`h-2.5 rounded-full ${course.percentage >= 90 ? 'bg-green-500' : course.percentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                            style={{ width: `${course.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500">{course.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Attendance Records */}
        <Card title="Recent Attendance Records">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceData.recentRecords.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.course}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.status === 'present' ? 'bg-green-100 text-green-800' :
                        record.status === 'absent' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
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