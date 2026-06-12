import { useState, useEffect } from 'react';
import axios from 'axios';
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

  const inputCls = 'rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100';

  const statCards = [
    { label: 'Total Sessions', value: totalSessions, accent: 'bg-cyan-500' },
    { label: 'Present', value: totals.present, accent: 'bg-emerald-500' },
    { label: 'Absent', value: totals.absent, accent: 'bg-rose-500' },
    { label: 'Attendance Rate', value: `${rate}%`, accent: 'bg-violet-500' },
  ];

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef7f7_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Attendance Reports</h1>
          <p className="mt-1 text-sm text-slate-500">Monthly attendance analytics for your classes</p>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Class</label>
              <select value={filters.classId} onChange={e => setFilters({ ...filters, classId: e.target.value })} className={inputCls}>
                <option value="">All Classes</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Month</label>
              <select value={filters.month} onChange={e => setFilters({ ...filters, month: e.target.value })} className={inputCls}>
                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Year</label>
              <input type="number" value={filters.year} onChange={e => setFilters({ ...filters, year: e.target.value })} className={`${inputCls} w-24`} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
          {statCards.map(c => (
            <div key={c.label} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className={`absolute inset-x-0 top-0 h-1 ${c.accent}`} />
              <p className="text-sm font-medium text-slate-500">{c.label}</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{c.value}</p>
            </div>
          ))}
        </section>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="mb-6 rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
            <BarChartComponent data={chartData} dataKey="present" nameKey="name" title="Student Attendance Overview" height={300} color="#0EA5E9" />
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex h-32 items-center justify-center text-slate-500">Loading...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Student</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Code</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">Present</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-[0.12em] text-rose-600">Absent</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-[0.12em] text-amber-600">Late</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-[0.12em] text-sky-600">Excused</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.length === 0 ? (
                  <tr><td colSpan="7" className="p-8 text-center text-slate-500">No attendance data for this period</td></tr>
                ) : summary.map(row => {
                  const p = getCount(row.statuses, 'present');
                  const a = getCount(row.statuses, 'absent');
                  const l = getCount(row.statuses, 'late');
                  const e = getCount(row.statuses, 'excused');
                  const total = p + a + l + e;
                  const rowRate = total > 0 ? Math.round((p / total) * 100) : 0;
                  return (
                    <tr key={row._id} className="transition-colors duration-150 hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-900">{row.user?.name}</td>
                      <td className="p-4 text-slate-500">{row.student?.studentCode}</td>
                      <td className="p-4 text-center font-semibold text-emerald-600">{p}</td>
                      <td className="p-4 text-center font-semibold text-rose-600">{a}</td>
                      <td className="p-4 text-center font-semibold text-amber-600">{l}</td>
                      <td className="p-4 text-center font-semibold text-sky-600">{e}</td>
                      <td className="p-4 text-center">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${rowRate >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{rowRate}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};

export default TeacherAttendanceReports;
