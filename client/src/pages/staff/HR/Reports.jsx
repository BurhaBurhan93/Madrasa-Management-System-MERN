import { useState, useEffect } from "react";

import axios from "axios";

import Card from "../../../components/UIHelper/Card";

import {
  PieChartComponent,
  BarChartComponent,
} from "../../../components/UIHelper/ECharts";
import {
  buildPeriodQuery,
  getDefaultPeriodFilters,
  isDateWithinRange,
} from "../../../utils/reportPeriods";

const HRReports = () => {
  const [attendanceSummary, setAttendanceSummary] = useState([]);

  const [leaveSummary, setLeaveSummary] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });

  const [payrollSummary, setPayrollSummary] = useState({
    totalGross: 0,
    totalNet: 0,
    totalDeductions: 0,
    count: 0,
  });

  const [filters, setFilters] = useState(getDefaultPeriodFilters());

  const [loading, setLoading] = useState(false);

  const token = () => localStorage.getItem("token");

  const headers = () => ({ Authorization: `Bearer ${token()}` });

  async function fetchAll() {
    setLoading(true);

    try {
      await Promise.all([
        fetchAttendanceSummary(),
        fetchLeaveSummary(),
        fetchPayrollSummary(),
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAttendanceSummary() {
    try {
      const params = new URLSearchParams(buildPeriodQuery(filters)).toString();

      const res = await axios.get(
        `http://localhost:5000/api/hr/attendance/summary?${params}`,

        { headers: headers() },
      );

      if (res.data.success) setAttendanceSummary(res.data.data);
    } catch (error) {
      console.error("Error fetching attendance summary:", error);
    }
  }

  async function fetchLeaveSummary() {
    try {
      const res = await axios.get("http://localhost:5000/api/hr/leaves", {
        headers: headers(),
      });

      if (res.data.success) {
        const leaves = (res.data.data || []).filter((leave) =>
          isDateWithinRange(leave.requestDate || leave.createdAt, filters),
        );

        setLeaveSummary({
          total: leaves.length,

          pending: leaves.filter((l) => l.status === "pending").length,

          approved: leaves.filter((l) => l.status === "approved").length,

          rejected: leaves.filter((l) => l.status === "rejected").length,
        });
      }
    } catch (error) {
      console.error("Error fetching leave summary:", error);
    }
  }

  async function fetchPayrollSummary() {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/payroll/salary-payments?limit=200",
        { headers: headers() },
      );

      if (res.data.success) {
        const payments = (res.data.data || []).filter((payment) =>
          isDateWithinRange(payment.paymentDate || payment.createdAt, filters),
        );

        setPayrollSummary({
          count: payments.length,

          totalGross: payments.reduce((s, p) => s + (p.grossSalary || 0), 0),

          totalNet: payments.reduce((s, p) => s + (p.netSalary || 0), 0),

          totalDeductions: payments.reduce(
            (s, p) => s + (p.totalDeduction || 0),
            0,
          ),
        });
      }
    } catch (error) {
      console.error("Error fetching payroll summary:", error);
    }
  }

  useEffect(() => {
    fetchAll();
  }, [filters.period, filters.date, filters.week, filters.month]);

  const getStatusCount = (statuses, status) => {
    const found = statuses?.find((s) => s.status === status);

    return found ? found.count : 0;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">HR Reports</h1>

          <p className="mt-1 text-sm text-gray-500">
            Attendance, leave and payroll summary
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={filters.period}
            onChange={(e) => setFilters({ ...filters, period: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="daily">Daily</option>

            <option value="weekly">Weekly</option>

            <option value="monthly">Monthly</option>
          </select>

          {filters.period === "daily" && (
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
            />
          )}

          {filters.period === "weekly" && (
            <input
              type="week"
              value={filters.week}
              onChange={(e) => setFilters({ ...filters, week: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
            />
          )}

          {filters.period === "monthly" && (
            <input
              type="month"
              value={filters.month}
              onChange={(e) =>
                setFilters({ ...filters, month: e.target.value })
              }
              className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
            />
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading reports...</div>
      ) : (
        <>
          {/* Leave Summary */}

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Leave Summary
            </h2>

            <div className="grid grid-cols-4 gap-4">
              {[
                {
                  label: "Total Requests",
                  value: leaveSummary.total,
                  color: "text-gray-700",
                },

                {
                  label: "Pending",
                  value: leaveSummary.pending,
                  color: "text-yellow-600",
                },

                {
                  label: "Approved",
                  value: leaveSummary.approved,
                  color: "text-green-600",
                },

                {
                  label: "Rejected",
                  value: leaveSummary.rejected,
                  color: "text-red-600",
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="bg-white rounded-xl shadow p-4"
                >
                  <p className="text-sm text-gray-500">{card.label}</p>

                  <p className={`text-3xl font-bold mt-1 ${card.color}`}>
                    {card.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Charts Section */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card title="Leave Status Distribution">
              <PieChartComponent
                data={[
                  {
                    name: "Pending",
                    value: leaveSummary.pending,
                    color: "#F59E0B",
                  },

                  {
                    name: "Approved",
                    value: leaveSummary.approved,
                    color: "#10B981",
                  },

                  {
                    name: "Rejected",
                    value: leaveSummary.rejected,
                    color: "#EF4444",
                  },
                ].filter((d) => d.value > 0)}
                dataKey="value"
                nameKey="name"
                height={250}
              />
            </Card>

            <Card title="Payroll Overview">
              <PieChartComponent
                data={[
                  {
                    name: "Net Paid",
                    value: payrollSummary.totalNet,
                    color: "#10B981",
                  },

                  {
                    name: "Deductions",
                    value: payrollSummary.totalDeductions,
                    color: "#EF4444",
                  },
                ].filter((d) => d.value > 0)}
                dataKey="value"
                nameKey="name"
                height={250}
              />
            </Card>

            <Card title="HR Metrics">
              <BarChartComponent
                data={[
                  { name: "Employees", value: payrollSummary.count },

                  { name: "Leave Req", value: leaveSummary.total },

                  { name: "Attendance", value: attendanceSummary.length },
                ]}
                dataKey="value"
                nameKey="name"
                height={250}
              />
            </Card>
          </div>

          {/* Payroll Summary */}

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Payroll Summary
            </h2>

            <div className="grid grid-cols-4 gap-4">
              {[
                {
                  label: "Employees Paid",
                  value: payrollSummary.count,
                  color: "text-gray-700",
                  prefix: "",
                },

                {
                  label: "Total Gross",
                  value: payrollSummary.totalGross.toLocaleString(),
                  color: "text-blue-600",
                  prefix: "AFN ",
                },

                {
                  label: "Total Deductions",
                  value: payrollSummary.totalDeductions.toLocaleString(),
                  color: "text-red-600",
                  prefix: "AFN ",
                },

                {
                  label: "Total Net Paid",
                  value: payrollSummary.totalNet.toLocaleString(),
                  color: "text-green-600",
                  prefix: "AFN ",
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="bg-white rounded-xl shadow p-4"
                >
                  <p className="text-sm text-gray-500">{card.label}</p>

                  <p className={`text-2xl font-bold mt-1 ${card.color}`}>
                    {card.prefix}
                    {card.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance Summary */}

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Attendance Summary
            </h2>

            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 text-gray-600 text-sm">
                  <tr>
                    <th className="p-3 text-left">Employee</th>

                    <th className="p-3 text-left">Code</th>

                    <th className="p-3 text-center text-green-600">Present</th>

                    <th className="p-3 text-center text-red-600">Absent</th>

                    <th className="p-3 text-center text-yellow-600">Late</th>

                    <th className="p-3 text-center text-orange-600">
                      Half Day
                    </th>

                    <th className="p-3 text-center text-blue-600">On Leave</th>
                  </tr>
                </thead>

                <tbody>
                  {attendanceSummary.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-500">
                        No attendance data for this period
                      </td>
                    </tr>
                  ) : (
                    attendanceSummary.map((row) => (
                      <tr key={row._id} className="border-t hover:bg-gray-50">
                        <td className="p-3 font-medium">
                          {row.employee?.fullName}
                        </td>

                        <td className="p-3 text-gray-500">
                          {row.employee?.employeeCode}
                        </td>

                        <td className="p-3 text-center">
                          {getStatusCount(row.statuses, "present")}
                        </td>

                        <td className="p-3 text-center">
                          {getStatusCount(row.statuses, "absent")}
                        </td>

                        <td className="p-3 text-center">
                          {getStatusCount(row.statuses, "late")}
                        </td>

                        <td className="p-3 text-center">
                          {getStatusCount(row.statuses, "half-day")}
                        </td>

                        <td className="p-3 text-center">
                          {getStatusCount(row.statuses, "on-leave")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HRReports;
