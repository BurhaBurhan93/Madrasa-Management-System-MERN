import React, { useMemo, useState } from 'react';
import Card from '../../components/UIHelper/Card';
import Badge from '../../components/UIHelper/Badge';
import Button from '../../components/UIHelper/Button';
import { BarChartComponent } from '../../components/UIHelper/Chart';
import { formatDate } from '../../lib/utils';

const TeacherAttendanceReports = () => {

  /* ================= RAW SESSION DATA ================= */

  const attendanceData = [
    { id: 1, date: '2024-02-01', course: 'Mathematics', status: 'present', time: '09:00 AM' },
    { id: 2, date: '2024-02-01', course: 'Physics', status: 'present', time: '10:30 AM' },
    { id: 3, date: '2024-02-01', course: 'Chemistry', status: 'absent', time: '12:00 PM' },
    { id: 4, date: '2024-02-02', course: 'Mathematics', status: 'present', time: '09:00 AM' },
    { id: 5, date: '2024-02-02', course: 'Physics', status: 'late', time: '10:45 AM' },
    { id: 6, date: '2024-02-02', course: 'Chemistry', status: 'present', time: '12:00 PM' },
    { id: 7, date: '2024-02-03', course: 'Mathematics', status: 'present', time: '09:00 AM' },
    { id: 8, date: '2024-02-03', course: 'Physics', status: 'present', time: '10:30 AM' },
    { id: 9, date: '2024-02-03', course: 'Chemistry', status: 'present', time: '12:00 PM' },
  ];

  const [filterCourse, setFilterCourse] = useState('all');

  /* ================= FILTER ================= */

  const filteredData = useMemo(() => {
    if (filterCourse === 'all') return attendanceData;
    return attendanceData.filter(r => r.course === filterCourse);
  }, [filterCourse]);

  /* ================= SUMMARY CALC ================= */

  const summary = useMemo(() => {
    const total = filteredData.length;
    const present = filteredData.filter(r => r.status === 'present').length;
    const absent = filteredData.filter(r => r.status === 'absent').length;
    const late = filteredData.filter(r => r.status === 'late').length;

    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, late, rate };
  }, [filteredData]);

  /* ================= MONTHLY TREND ================= */

  const monthlyTrend = [
    { month: 'Jan', attendance: 92 },
    { month: 'Feb', attendance: 95 },
    { month: 'Mar', attendance: 90 },
    { month: 'Apr', attendance: 96 },
    { month: 'May', attendance: 88 },
  ];

  const getStatusVariant = (status) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'danger';
      case 'late': return 'warning';
      default: return 'default';
    }
  };

  const uniqueCourses = [...new Set(attendanceData.map(d => d.course))];

  return (
    <div className="w-full bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Attendance Reports</h1>
        <p className="text-gray-600">
          Class-level attendance analytics and performance overview
        </p>
      </div>

      {/* FILTER BAR */}
      <Card className="mb-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <label className="text-sm text-gray-600">Course</label>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="block mt-1 border rounded px-3 py-2"
            >
              <option value="all">All Courses</option>
              {uniqueCourses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>

          <Button variant="outline">
            Export CSV
          </Button>
        </div>
      </Card>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">

        <Card className="text-center">
          <div className="text-xl font-bold">{summary.total}</div>
          <div className="text-xs text-gray-600">Total Sessions</div>
        </Card>

        <Card className="text-center">
          <div className="text-xl font-bold text-green-600">{summary.present}</div>
          <div className="text-xs text-gray-600">Present</div>
        </Card>

        <Card className="text-center">
          <div className="text-xl font-bold text-red-600">{summary.absent}</div>
          <div className="text-xs text-gray-600">Absent</div>
        </Card>

        <Card className="text-center">
          <div className="text-xl font-bold text-yellow-600">{summary.late}</div>
          <div className="text-xs text-gray-600">Late</div>
        </Card>

        <Card className="text-center">
          <div className="text-xl font-bold text-purple-600">{summary.rate}%</div>
          <div className="text-xs text-gray-600">Attendance Rate</div>
        </Card>

      </div>

      {/* TREND CHART */}
      <div className="mb-8">
        <Card title="Monthly Attendance Trend">
          <BarChartComponent
            data={monthlyTrend}
            dataKey="attendance"
            nameKey="month"
            title="Attendance Trend"
          />
        </Card>
      </div>

      {/* SESSION TABLE */}
      <Card title="Session Records">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">

            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map(record => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">
                    {formatDate(record.date)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {record.course}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {record.time}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusVariant(record.status)}>
                      {record.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </Card>

    </div>
  );
};

export default TeacherAttendanceReports;
