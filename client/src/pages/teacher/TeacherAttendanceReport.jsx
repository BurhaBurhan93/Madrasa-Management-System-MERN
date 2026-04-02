import { useState, useEffect } from 'react';

import axios from 'axios';

import Card from '../../components/UIHelper/Card';

import { BarChartComponent } from '../../components/UIHelper/ECharts';



const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];



const TeacherAttendanceReports = () => {

  const [summary, setSummary] = useState([]);

  const [classes, setClasses] = useState([]);

  const [filters, setFilters] = useState({ classId: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });

  const [loading, setLoading] = useState(false);



  useEffect(() => { fetchClasses(); }, []);

  useEffect(() => { fetchReport(); }, [filters]);



  const fetchClasses = async () => {

    try {

      const res = await axios.get('http://localhost:5000/api/teacher/classes', api());

      if (res.data.success) setClasses(res.data.data);

    } catch (e) { console.error(e); }

  };



  const fetchReport = async () => {

    setLoading(true);

    try {

      const { classId, month, year } = filters;

      const params = new URLSearchParams({ month, year, ...(classId && { classId }) });

      const res = await axios.get(`http://localhost:5000/api/teacher/attendance/report?${params}`, api());

      if (res.data.success) setSummary(res.data.data);

    } catch (e) { console.error(e); } finally { setLoading(false); }

  };



  const getCount = (statuses, status) => statuses?.find(s => s.status === status)?.count || 0;



  const chartData = summary.map(row => ({

    name: row.user?.name?.split(' ')[0] || 'N/A',

    present: getCount(row.statuses, 'present'),

    absent: getCount(row.statuses, 'absent'),

    late: getCount(row.statuses, 'late'),

  }));



  const totals = summary.reduce((acc, row) => ({

    present: acc.present + getCount(row.statuses, 'present'),

    absent: acc.absent + getCount(row.statuses, 'absent'),

    late: acc.late + getCount(row.statuses, 'late'),

  }), { present: 0, absent: 0, late: 0 });



  const totalSessions = totals.present + totals.absent + totals.late;

  const rate = totalSessions > 0 ? Math.round((totals.present / totalSessions) * 100) : 0;



  return (

    <div className="w-full bg-gray-50 min-h-screen">

      <div className="mb-6">

        <h1 className="text-3xl font-bold">Attendance Reports</h1>

        <p className="text-gray-500">Monthly attendance analytics for your classes</p>

      </div>



      {/* Filters */}

      <Card className="mb-6">

        <div className="flex flex-wrap gap-4 items-end">

          <div>

            <label className="text-sm text-gray-600 block mb-1">Class</label>

            <select value={filters.classId} onChange={e => setFilters({ ...filters, classId: e.target.value })} className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500">

              <option value="">All Classes</option>

              {classes.map(c => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}

            </select>

          </div>

          <div>

            <label className="text-sm text-gray-600 block mb-1">Month</label>

            <select value={filters.month} onChange={e => setFilters({ ...filters, month: e.target.value })} className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500">

              {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}

            </select>

          </div>

          <div>

            <label className="text-sm text-gray-600 block mb-1">Year</label>

            <input type="number" value={filters.year} onChange={e => setFilters({ ...filters, year: e.target.value })} className="border rounded-lg px-3 py-2 w-24 outline-none focus:ring-2 focus:ring-green-500" />

          </div>

        </div>

      </Card>



      {/* Summary Cards */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

        {[

          { label: 'Total Sessions', value: totalSessions, color: 'text-gray-700' },

          { label: 'Present', value: totals.present, color: 'text-green-600' },

          { label: 'Absent', value: totals.absent, color: 'text-red-600' },

          { label: 'Attendance Rate', value: `${rate}%`, color: 'text-purple-600' },

        ].map(c => (

          <Card key={c.label} className="text-center">

            <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>

            <div className="text-xs text-gray-500 mt-1">{c.label}</div>

          </Card>

        ))}

      </div>



      {/* Chart */}

      {chartData.length > 0 && (

        <Card className="mb-6" title="Student Attendance Overview">

          <BarChartComponent data={chartData} dataKey="present" nameKey="name" />

        </Card>

      )}



      {/* Table */}

      <Card>

        {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : (

          <table className="w-full text-sm">

            <thead className="bg-gray-50">

              <tr>

                <th className="p-3 text-left">Student</th>

                <th className="p-3 text-left">Code</th>

                <th className="p-3 text-center text-green-600">Present</th>

                <th className="p-3 text-center text-red-600">Absent</th>

                <th className="p-3 text-center text-yellow-600">Late</th>

                <th className="p-3 text-center text-blue-600">Excused</th>

                <th className="p-3 text-center">Rate</th>

              </tr>

            </thead>

            <tbody>

              {summary.length === 0 ? (

                <tr><td colSpan="7" className="p-8 text-center text-gray-500">No attendance data for this period</td></tr>

              ) : summary.map(row => {

                const p = getCount(row.statuses, 'present');

                const a = getCount(row.statuses, 'absent');

                const l = getCount(row.statuses, 'late');

                const e = getCount(row.statuses, 'excused');

                const total = p + a + l + e;

                const rowRate = total > 0 ? Math.round((p / total) * 100) : 0;

                return (

                  <tr key={row._id} className="border-t hover:bg-gray-50">

                    <td className="p-3 font-medium">{row.user?.name}</td>

                    <td className="p-3 text-gray-500">{row.student?.studentCode}</td>

                    <td className="p-3 text-center font-semibold text-green-600">{p}</td>

                    <td className="p-3 text-center font-semibold text-red-600">{a}</td>

                    <td className="p-3 text-center font-semibold text-yellow-600">{l}</td>

                    <td className="p-3 text-center font-semibold text-blue-600">{e}</td>

                    <td className="p-3 text-center">

                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${rowRate >= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{rowRate}%</span>

                    </td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        )}

      </Card>

    </div>

  );

};



export default TeacherAttendanceReports;

