import { useState, useEffect, useMemo } from "react";
import Card from "../../../components/UIHelper/Card";
import {
  PieChartComponent,
  BarChartComponent,
} from "../../../components/UIHelper/ECharts";
import {
  buildPeriodQuery,
  getDefaultPeriodFilters,
  isDateWithinRange,
  formatYearInput,
} from "../../../utils/reportPeriods";
import { apiFetch, parseJsonSafe } from "../../../lib/apiFetch";
import { staffApi } from "../../../api/staffApi";

const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const HRReports = () => {
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [payrollSummary, setPayrollSummary] = useState({ totalGross: 0, totalNet: 0, totalDeductions: 0, count: 0 });
  const [employeeStats, setEmployeeStats] = useState(null);
  const [filters, setFilters] = useState(getDefaultPeriodFilters());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [filters.period, filters.date, filters.week, filters.month, filters.year]);

  async function fetchAll() {
    setLoading(true);
    try {
      await Promise.all([
        fetchAttendanceSummary(),
        fetchLeaveSummary(),
        fetchPayrollSummary(),
        fetchEmployeeStats(),
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAttendanceSummary() {
    try {
      const params = new URLSearchParams(buildPeriodQuery(filters)).toString();
      const res = await apiFetch(`${staffApi.hr.attendance}/summary?${params}`);
      const data = await parseJsonSafe(res);
      if (res.ok && data.success) setAttendanceSummary(data.data || []);
    } catch (error) {
      console.error("Error fetching attendance summary:", error);
    }
  }

  async function fetchLeaveSummary() {
    try {
      const res = await apiFetch(staffApi.hr.leaves);
      const data = await parseJsonSafe(res);
      if (res.ok && data.success) {
        const leaves = (data.data || []).filter((leave) =>
          isDateWithinRange(leave.requestDate || leave.createdAt, filters)
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
      const res = await apiFetch(`${staffApi.payroll.salaryPayments}?limit=200`);
      const data = await parseJsonSafe(res);
      if (res.ok && data.success) {
        const payments = (data.data || []).filter((payment) =>
          isDateWithinRange(payment.paymentDate || payment.createdAt, filters)
        );
        setPayrollSummary({
          count: payments.length,
          totalGross: payments.reduce((s, p) => s + (p.grossSalary || 0), 0),
          totalNet: payments.reduce((s, p) => s + (p.netSalary || 0), 0),
          totalDeductions: payments.reduce((s, p) => s + (p.totalDeduction || 0), 0),
        });
      }
    } catch (error) {
      console.error("Error fetching payroll summary:", error);
    }
  }

  async function fetchEmployeeStats() {
    try {
      const res = await apiFetch("/hr/employees/stats");
      const data = await parseJsonSafe(res);
      if (res.ok && data.success) setEmployeeStats(data.data);
    } catch (error) {
      console.error("Error fetching employee stats:", error);
    }
  }

  const getStatusCount = (statuses, status) => {
    const found = statuses?.find((s) => s.status === status);
    return found ? found.count : 0;
  };

  const monthsWithData = useMemo(() => {
    const map = {};
    attendanceSummary.forEach((row) => {
      (row.statuses || []).forEach((s) => {
        map[s.status] = (map[s.status] || 0) + s.count;
      });
    });
    return map;
  }, [attendanceSummary]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">HR Reports</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Attendance, leave, payroll and employee summary</p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={filters.period}
            onChange={(e) => setFilters({ ...filters, period: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>

          {filters.period === "daily" && (
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200"
            />
          )}
          {filters.period === "weekly" && (
            <input
              type="week"
              value={filters.week}
              onChange={(e) => setFilters({ ...filters, week: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200"
            />
          )}
          {filters.period === "monthly" && (
            <input
              type="month"
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200"
            />
          )}
          {filters.period === "yearly" && (
            <input
              type="number"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              min={2000}
              max={2100}
              className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500 w-28 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200"
            />
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500 dark:text-slate-400">Loading reports...</div>
      ) : (
        <>
          {/* Employee Stats */}
          {employeeStats && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 dark:text-slate-200 mb-3">Employee Overview</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Total Employees", value: employeeStats.totalEmployees, color: "text-gray-700 dark:text-slate-200" },
                  { label: "Active", value: employeeStats.activeEmployees, color: "text-green-600" },
                  { label: "Inactive", value: employeeStats.inactiveEmployees, color: "text-red-600" },
                  { label: "Departments", value: (employeeStats.employeesByDepartment || []).length, color: "text-blue-600" },
                ].map((card) => (
                  <div key={card.label} className="bg-white dark:bg-slate-800/50 rounded-xl shadow p-4">
                    <p className="text-sm text-gray-500 dark:text-slate-400">{card.label}</p>
                    <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leave Summary */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-slate-200 mb-3">Leave Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Requests", value: leaveSummary.total, color: "text-gray-700 dark:text-slate-200" },
                { label: "Pending", value: leaveSummary.pending, color: "text-yellow-600" },
                { label: "Approved", value: leaveSummary.approved, color: "text-green-600" },
                { label: "Rejected", value: leaveSummary.rejected, color: "text-red-600" },
              ].map((card) => (
                <div key={card.label} className="bg-white dark:bg-slate-800/50 rounded-xl shadow p-4">
                  <p className="text-sm text-gray-500 dark:text-slate-400">{card.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card title="Leave Status Distribution">
              <PieChartComponent
                data={[
                  { name: "Pending", value: leaveSummary.pending, color: "#F59E0B" },
                  { name: "Approved", value: leaveSummary.approved, color: "#10B981" },
                  { name: "Rejected", value: leaveSummary.rejected, color: "#EF4444" },
                ].filter((d) => d.value > 0)}
                dataKey="value"
                nameKey="name"
                height={250}
              />
            </Card>

            <Card title="Payroll Overview">
              <PieChartComponent
                data={[
                  { name: "Net Paid", value: payrollSummary.totalNet, color: "#10B981" },
                  { name: "Deductions", value: payrollSummary.totalDeductions, color: "#EF4444" },
                ].filter((d) => d.value > 0)}
                dataKey="value"
                nameKey="name"
                height={250}
              />
            </Card>

            <Card title="HR Metrics">
              <BarChartComponent
                data={[
                  { name: "Employees", value: employeeStats?.totalEmployees || 0, color: "#3B82F6" },
                  { name: "Attendance", value: attendanceSummary.length, color: "#10B981" },
                  { name: "Leave Req", value: leaveSummary.total, color: "#F59E0B" },
                  { name: "Payments", value: payrollSummary.count, color: "#8B5CF6" },
                ]}
                dataKey="value"
                nameKey="name"
                height={250}
              />
            </Card>
          </div>

          {/* Attendance Summary */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-slate-200 mb-3">
              Attendance Summary ({monthsWithData.present || 0} present, {monthsWithData.absent || 0} absent, {monthsWithData.late || 0} late)
            </h2>
            <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-sm">
                  <tr>
                    <th className="p-3 text-left">Employee</th>
                    <th className="p-3 text-left">Code</th>
                    <th className="p-3 text-center text-green-600">Present</th>
                    <th className="p-3 text-center text-red-600">Absent</th>
                    <th className="p-3 text-center text-yellow-600">Late</th>
                    <th className="p-3 text-center text-orange-600">Half Day</th>
                    <th className="p-3 text-center text-blue-600">On Leave</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceSummary.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-500 dark:text-slate-400">
                        No attendance data for this period
                      </td>
                    </tr>
                  ) : (
                    attendanceSummary.map((row) => (
                      <tr key={row._id} className="border-t dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800">
                        <td className="p-3 font-medium dark:text-slate-200">{row.employee?.fullName || '-'}</td>
                        <td className="p-3 text-gray-500 dark:text-slate-400">{row.employee?.employeeCode || '-'}</td>
                        <td className="p-3 text-center text-green-600 font-medium">{getStatusCount(row.statuses, "present")}</td>
                        <td className="p-3 text-center text-red-600 font-medium">{getStatusCount(row.statuses, "absent")}</td>
                        <td className="p-3 text-center text-yellow-600 font-medium">{getStatusCount(row.statuses, "late")}</td>
                        <td className="p-3 text-center text-orange-600 font-medium">{getStatusCount(row.statuses, "half-day")}</td>
                        <td className="p-3 text-center text-blue-600 font-medium">{getStatusCount(row.statuses, "on-leave")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payroll Summary */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-slate-200 mb-3">Payroll Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Employees Paid", value: payrollSummary.count, color: "text-gray-700 dark:text-slate-200", prefix: "" },
                { label: "Total Gross", value: payrollSummary.totalGross.toLocaleString(), color: "text-blue-600", prefix: "AFN " },
                { label: "Total Deductions", value: payrollSummary.totalDeductions.toLocaleString(), color: "text-red-600", prefix: "AFN " },
                { label: "Total Net Paid", value: payrollSummary.totalNet.toLocaleString(), color: "text-green-600", prefix: "AFN " },
              ].map((card) => (
                <div key={card.label} className="bg-white dark:bg-slate-800/50 rounded-xl shadow p-4">
                  <p className="text-sm text-gray-500 dark:text-slate-400">{card.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.prefix}{card.value}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HRReports;
