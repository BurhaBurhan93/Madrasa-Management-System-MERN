import { useState, useEffect } from 'react';

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState({
    overallPercentage: 95,
    monthlyData: [
      { month: 'January', percentage: 98, days: 22 },
      { month: 'February', percentage: 92, days: 18 },
      { month: 'March', percentage: 96, days: 20 }
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
      { date: '2024-02-09', course: 'ISLM202', status: 'present', time: '02:00 PM' },
      { date: '2024-02-09', course: 'ENG102', status: 'late', time: '10:15 AM' },
      { date: '2024-02-08', course: 'PHYS101', status: 'present', time: '01:00 PM' },
      { date: '2024-02-08', course: 'MATH201', status: 'absent', time: '09:00 AM' }
    ]
  });

  const [selectedFilter, setSelectedFilter] = useState('overall');
  const [correctionRequest, setCorrectionRequest] = useState({
    isOpen: false,
    course: '',
    date: '',
    reason: ''
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const handleRequestCorrection = () => {
    setCorrectionRequest({
      ...correctionRequest,
      isOpen: true
    });
  };

  const handleSubmitCorrection = (e) => {
    e.preventDefault();
    // In a real app, this would submit the request to the server
    console.log('Correction request submitted:', correctionRequest);
    setCorrectionRequest({
      isOpen: false,
      course: '',
      date: '',
      reason: ''
    });
  };

  const handleCloseCorrection = () => {
    setCorrectionRequest({
      isOpen: false,
      course: '',
      date: '',
      reason: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Attendance Record</h2>
        <button 
          onClick={handleRequestCorrection}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Request Correction
        </button>
      </div>

      {/* Overall Attendance Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
          <div className="text-4xl font-bold text-gray-800 mb-2">{attendanceData.overallPercentage}%</div>
          <div className="text-gray-600">Overall Attendance</div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full" 
                style={{ width: `${attendanceData.overallPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
          <div className="text-4xl font-bold text-gray-800 mb-2">
            {attendanceData.recentRecords.filter(record => record.status === 'present').length}
          </div>
          <div className="text-gray-600">Classes Attended</div>
          <div className="text-sm text-gray-500 mt-2">
            Last 30 days
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
          <div className="text-4xl font-bold text-gray-800 mb-2">
            {attendanceData.recentRecords.filter(record => record.status === 'absent').length}
          </div>
          <div className="text-gray-600">Classes Missed</div>
          <div className="text-sm text-gray-500 mt-2">
            Last 30 days
          </div>
        </div>
      </div>

      {/* Monthly Attendance Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Attendance Trend</h3>
        <div className="grid grid-cols-3 gap-4">
          {attendanceData.monthlyData.map((month, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-gray-800 mb-1">{month.percentage}%</div>
              <div className="text-sm text-gray-600">{month.month}</div>
              <div className="text-xs text-gray-500 mt-1">{month.days} days</div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${month.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course-wise Attendance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Course-wise Attendance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Classes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attended</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceData.courseWise.map((course, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.course}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.totalClasses}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.attended}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.percentage}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      course.percentage >= 90 ? 'bg-green-100 text-green-800' :
                      course.percentage >= 75 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {course.percentage >= 90 ? 'Good' : course.percentage >= 75 ? 'Average' : 'Low'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Attendance Records */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Recent Attendance Records</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {attendanceData.recentRecords.map((record, index) => (
            <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full ${
                    record.status === 'present' ? 'bg-green-500' :
                    record.status === 'absent' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">{record.course}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(record.date).toLocaleDateString()} • {record.time}
                  </div>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                {getStatusText(record.status)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance Calendar Preview */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance Calendar</h3>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 p-2">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {/* Calendar days - simplified representation */}
          {Array.from({ length: 35 }, (_, i) => {
            const day = i - 5; // Starting from the 6th day of the month
            if (day < 1 || day > 28) return <div key={i} className="h-8"></div>;
            
            // Mock attendance status for demonstration
            const status = day % 3 === 0 ? 'present' : day % 5 === 0 ? 'absent' : 'present';
            
            return (
              <div 
                key={i} 
                className={`h-8 flex items-center justify-center text-xs rounded ${
                  status === 'present' ? 'bg-green-100 text-green-800' :
                  status === 'absent' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {/* Attendance Correction Modal */}
      {correctionRequest.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Request Attendance Correction</h3>
                <button 
                  onClick={handleCloseCorrection}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmitCorrection}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                    <select
                      value={correctionRequest.course}
                      onChange={(e) => setCorrectionRequest({...correctionRequest, course: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Course</option>
                      {attendanceData.courseWise.map((course, index) => (
                        <option key={index} value={course.course}>{course.course}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={correctionRequest.date}
                      onChange={(e) => setCorrectionRequest({...correctionRequest, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Correction</label>
                    <textarea
                      value={correctionRequest.reason}
                      onChange={(e) => setCorrectionRequest({...correctionRequest, reason: e.target.value})}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                      required
                      placeholder="Provide a valid reason for the attendance correction request..."
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseCorrection}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;