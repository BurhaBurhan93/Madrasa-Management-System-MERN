import React, { useEffect, useMemo, useState } from "react";
import api from "../../../lib/api";
import {
  buildPeriodQuery,
  getDefaultPeriodFilters,
} from "../../../utils/reportPeriods";

const getCount = (statuses, status) =>
  statuses?.find((item) => item.status === status)?.count || 0;

const AdminAttendanceReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(getDefaultPeriodFilters());
  const [stats, setStats] = useState({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    rate: 0,
  });

  async function fetchReports() {
    setLoading(true);
    try {
      const params = new URLSearchParams(buildPeriodQuery(filter)).toString();
      const { data } = await api.get(`/attendance/summary?${params}`);
      const records = Array.isArray(data) ? data : data.data || [];
      setReports(records);

      const totals = records.reduce(
        (acc, row) => {
          const present = getCount(row.statuses, "present");
          const absent = getCount(row.statuses, "absent");
          const late = getCount(row.statuses, "late");
          const excused = getCount(row.statuses, "excused");
          return {
            present: acc.present + present,
            absent: acc.absent + absent,
            late: acc.late + late,
            total: acc.total + present + absent + late + excused,
          };
        },
        { present: 0, absent: 0, late: 0, total: 0 },
      );

      setStats({
        totalDays: totals.total,
        presentDays: totals.present,
        absentDays: totals.absent,
        lateDays: totals.late,
        rate:
          totals.total > 0
            ? Math.round((totals.present / totals.total) * 100)
            : 0,
      });
    } catch {
      setReports([]);
      setStats({
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        rate: 0,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReports();
  }, [filter.period, filter.date, filter.week, filter.month]);

  const subtitle = useMemo(() => {
    if (filter.period === "daily")
      return "View and analyze staff attendance for a single day";
    if (filter.period === "weekly")
      return "View and analyze staff attendance for a selected week";
    return "View and analyze staff attendance for a selected month";
  }, [filter.period]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Attendance Reports
        </h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Period
          </label>
          <select
            value={filter.period}
            onChange={(e) =>
              setFilter((current) => ({ ...current, period: e.target.value }))
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        {filter.period === "daily" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Date
            </label>
            <input
              type="date"
              value={filter.date}
              onChange={(e) =>
                setFilter((current) => ({ ...current, date: e.target.value }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        )}
        {filter.period === "weekly" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Week
            </label>
            <input
              type="week"
              value={filter.week}
              onChange={(e) =>
                setFilter((current) => ({ ...current, week: e.target.value }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        )}
        {filter.period === "monthly" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Month
            </label>
            <input
              type="month"
              value={filter.month}
              onChange={(e) =>
                setFilter((current) => ({ ...current, month: e.target.value }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Total Records</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {stats.totalDays}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-medium text-emerald-600">Present</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">
            {stats.presentDays}
          </p>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <p className="text-xs font-medium text-rose-600">Absent</p>
          <p className="mt-1 text-2xl font-bold text-rose-700">
            {stats.absentDays}
          </p>
        </div>
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
          <p className="text-xs font-medium text-cyan-600">Attendance Rate</p>
          <p className="mt-1 text-2xl font-bold text-cyan-700">{stats.rate}%</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-3 font-semibold text-slate-600">
                Employee
              </th>
              <th className="px-5 py-3 font-semibold text-slate-600">Code</th>
              <th className="px-5 py-3 font-semibold text-slate-600">
                Present
              </th>
              <th className="px-5 py-3 font-semibold text-slate-600">Absent</th>
              <th className="px-5 py-3 font-semibold text-slate-600">Late</th>
              <th className="px-5 py-3 font-semibold text-slate-600">Rate</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-slate-400"
                >
                  Loading...
                </td>
              </tr>
            )}
            {!loading && reports.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-slate-400"
                >
                  No attendance records found
                </td>
              </tr>
            )}
            {reports.map((row, index) => {
              const present = getCount(row.statuses, "present");
              const absent = getCount(row.statuses, "absent");
              const late = getCount(row.statuses, "late");
              const excused = getCount(row.statuses, "excused");
              const total = present + absent + late + excused;
              const rowRate =
                total > 0 ? Math.round((present / total) * 100) : 0;
              return (
                <tr
                  key={row._id || index}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-5 py-3 font-medium text-slate-800">
                    {row.employee?.fullName || "-"}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {row.employee?.employeeCode || "-"}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{present}</td>
                  <td className="px-5 py-3 text-slate-600">{absent}</td>
                  <td className="px-5 py-3 text-slate-600">{late}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${rowRate >= 75 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                    >
                      {rowRate}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAttendanceReports;
