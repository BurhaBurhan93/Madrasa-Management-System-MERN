import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { BarChartComponent } from "../../components/UIHelper/ECharts";
import {
  buildPeriodQuery,
  getDefaultPeriodFilters,
} from "../../utils/reportPeriods";

const api = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const TeacherAttendanceReports = () => {
  const [summary, setSummary] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filters, setFilters] = useState({
    classId: "",
    ...getDefaultPeriodFilters(),
  });
  const [loading, setLoading] = useState(false);

  async function fetchClasses() {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/teacher/classes",
        api(),
      );
      if (res.data.success) setClasses(res.data.data);
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchReport() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...buildPeriodQuery(filters),
        ...(filters.classId && { classId: filters.classId }),
      });
      const res = await axios.get(
        `http://localhost:5000/api/teacher/attendance/report?${params}`,
        api(),
      );
      if (res.data.success) setSummary(res.data.data);
    } catch (e) {
      console.error(e);
      setSummary([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [
    filters.classId,
    filters.period,
    filters.date,
    filters.week,
    filters.month,
  ]);

  const getCount = (statuses, status) =>
    statuses?.find((item) => item.status === status)?.count || 0;

  const chartData = summary.map((row) => ({
    name: row.user?.name?.split(" ")[0] || "N/A",
    present: getCount(row.statuses, "present"),
    absent: getCount(row.statuses, "absent"),
    late: getCount(row.statuses, "late"),
  }));

  const totals = summary.reduce(
    (acc, row) => ({
      present: acc.present + getCount(row.statuses, "present"),
      absent: acc.absent + getCount(row.statuses, "absent"),
      late: acc.late + getCount(row.statuses, "late"),
      excused: acc.excused + getCount(row.statuses, "excused"),
    }),
    { present: 0, absent: 0, late: 0, excused: 0 },
  );

  const totalSessions =
    totals.present + totals.absent + totals.late + totals.excused;
  const rate =
    totalSessions > 0 ? Math.round((totals.present / totalSessions) * 100) : 0;

  const inputCls =
    "rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100";

  const statCards = [
    { label: "Total Sessions", value: totalSessions, accent: "bg-cyan-500" },
    { label: "Present", value: totals.present, accent: "bg-emerald-500" },
    { label: "Absent", value: totals.absent, accent: "bg-rose-500" },
    { label: "Attendance Rate", value: `${rate}%`, accent: "bg-violet-500" },
  ];

  const periodSubtitle = useMemo(() => {
    if (filters.period === "daily")
      return "Daily attendance analytics for your classes";
    if (filters.period === "weekly")
      return "Weekly attendance analytics for your classes";
    return "Monthly attendance analytics for your classes";
  }, [filters.period]);

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef7f7_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Attendance Reports
          </h1>
          <p className="mt-1 text-sm text-slate-500">{periodSubtitle}</p>
        </div>

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Class
              </label>
              <select
                value={filters.classId}
                onChange={(e) =>
                  setFilters((current) => ({
                    ...current,
                    classId: e.target.value,
                  }))
                }
                className={inputCls}
              >
                <option value="">All Classes</option>
                {classes.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name} {item.section}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Period
              </label>
              <select
                value={filters.period}
                onChange={(e) =>
                  setFilters((current) => ({
                    ...current,
                    period: e.target.value,
                  }))
                }
                className={inputCls}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            {filters.period === "daily" && (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Date
                </label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) =>
                    setFilters((current) => ({
                      ...current,
                      date: e.target.value,
                    }))
                  }
                  className={inputCls}
                />
              </div>
            )}
            {filters.period === "weekly" && (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Week
                </label>
                <input
                  type="week"
                  value={filters.week}
                  onChange={(e) =>
                    setFilters((current) => ({
                      ...current,
                      week: e.target.value,
                    }))
                  }
                  className={inputCls}
                />
              </div>
            )}
            {filters.period === "monthly" && (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Month
                </label>
                <input
                  type="month"
                  value={filters.month}
                  onChange={(e) =>
                    setFilters((current) => ({
                      ...current,
                      month: e.target.value,
                    }))
                  }
                  className={inputCls}
                />
              </div>
            )}
          </div>
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className={`absolute inset-x-0 top-0 h-1 ${card.accent}`} />
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                {card.value}
              </p>
            </div>
          ))}
        </section>

        {chartData.length > 0 && (
          <div className="mb-6 rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
            <BarChartComponent
              data={chartData}
              dataKey="present"
              nameKey="name"
              title="Student Attendance Overview"
              height={300}
              color="#0EA5E9"
            />
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex h-32 items-center justify-center text-slate-500">
              Loading...
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Student
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Code
                  </th>
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
                    Present
                  </th>
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-[0.12em] text-rose-600">
                    Absent
                  </th>
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-[0.12em] text-amber-600">
                    Late
                  </th>
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-[0.12em] text-sky-600">
                    Excused
                  </th>
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500">
                      No attendance data for the selected period
                    </td>
                  </tr>
                ) : (
                  summary.map((row) => {
                    const present = getCount(row.statuses, "present");
                    const absent = getCount(row.statuses, "absent");
                    const late = getCount(row.statuses, "late");
                    const excused = getCount(row.statuses, "excused");
                    const total = present + absent + late + excused;
                    const rowRate =
                      total > 0 ? Math.round((present / total) * 100) : 0;
                    return (
                      <tr
                        key={row._id}
                        className="transition-colors duration-150 hover:bg-slate-50"
                      >
                        <td className="p-4 font-medium text-slate-900">
                          {row.user?.name}
                        </td>
                        <td className="p-4 text-slate-500">
                          {row.student?.studentCode}
                        </td>
                        <td className="p-4 text-center font-semibold text-emerald-600">
                          {present}
                        </td>
                        <td className="p-4 text-center font-semibold text-rose-600">
                          {absent}
                        </td>
                        <td className="p-4 text-center font-semibold text-amber-600">
                          {late}
                        </td>
                        <td className="p-4 text-center font-semibold text-sky-600">
                          {excused}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${rowRate >= 75 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                          >
                            {rowRate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherAttendanceReports;
