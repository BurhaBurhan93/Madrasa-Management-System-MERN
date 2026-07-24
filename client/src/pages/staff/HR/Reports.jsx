import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation(['staff', 'common']);
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">{t('hr.reports.title')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{t('hr.reports.subtitle')}</p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={filters.period}
            onChange={(e) => setFilters({ ...filters, period: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200"
          >
            <option value="daily">{t('hr.reports.daily')}</option>
            <option value="weekly">{t('hr.reports.weekly')}</option>
            <option value="monthly">{t('hr.reports.monthly')}</option>
            <option value="yearly">{t('hr.reports.yearly')}</option>
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
        <div className="p-8 text-center text-gray-500 dark:text-slate-400">{t('hr.reports.loadingReports')}</div>
      ) : (
        <>
          {/* Employee Stats */}
          {employeeStats && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 dark:text-slate-200 mb-3">{t('hr.reports.employeeOverview')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: t('hr.reports.totalEmployees'), value: employeeStats.totalEmployees, color: "text-gray-700 dark:text-slate-200" },
                  { label: t('hr.reports.active'), value: employeeStats.activeEmployees, color: "text-green-600" },
                  { label: t('hr.reports.inactive'), value: employeeStats.inactiveEmployees, color: "text-red-600" },
                  { label: t('hr.reports.departments'), value: (employeeStats.employeesByDepartment || []).length, color: "text-blue-600" },
                ].map((card) => (
                  <div key={card.label} className="bg-transparent dark:bg-slate-800/50 rounded-xl shadow p-4">
                    <p className="text-sm text-gray-500 dark:text-slate-400">{card.label}</p>
                    <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leave Summary */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-slate-200 mb-3">{t('hr.reports.leaveSummary')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: t('hr.reports.totalRequests'), value: leaveSummary.total, color: "text-gray-700 dark:text-slate-200" },
                { label: t('hr.reports.pending'), value: leaveSummary.pending, color: "text-yellow-600" },
                { label: t('hr.reports.approved'), value: leaveSummary.approved, color: "text-green-600" },
                { label: t('hr.reports.rejected'), value: leaveSummary.rejected, color: "text-red-600" },
              ].map((card) => (
                <div key={card.label} className="bg-transparent dark:bg-slate-800/50 rounded-xl shadow p-4">
                  <p className="text-sm text-gray-500 dark:text-slate-400">{card.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card title={t('hr.reports.leaveStatusDistribution')}>
              <PieChartComponent
                data={[
                  { name: t('hr.reports.pending'), value: leaveSummary.pending, color: "#F59E0B" },
                  { name: t('hr.reports.approved'), value: leaveSummary.approved, color: "#10B981" },
                  { name: t('hr.reports.rejected'), value: leaveSummary.rejected, color: "#EF4444" },
                ].filter((d) => d.value > 0)}
                dataKey="value"
                nameKey="name"
                height={250}
              />
            </Card>

            <Card title={t('hr.reports.payrollOverview')}>
              <PieChartComponent
                data={[
                  { name: t('hr.reports.netPaid'), value: payrollSummary.totalNet, color: "#10B981" },
                  { name: t('hr.reports.deductions'), value: payrollSummary.totalDeductions, color: "#EF4444" },
                ].filter((d) => d.value > 0)}
                dataKey="value"
                nameKey="name"
                height={250}
              />
            </Card>

            <Card title={t('hr.reports.hrMetrics')}>
              <BarChartComponent
                data={[
                  { name: t('hr.reports.employees'), value: employeeStats?.totalEmployees || 0, color: "#3B82F6" },
                  { name: t('hr.reports.attendance'), value: attendanceSummary.length, color: "#10B981" },
                  { name: t('hr.reports.leaveRequests'), value: leaveSummary.total, color: "#F59E0B" },
                  { name: t('hr.reports.payments'), value: payrollSummary.count, color: "#8B5CF6" },
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
                {t('hr.reports.attendanceSummary')} ({monthsWithData.present || 0} {t('hr.reports.present')}, {monthsWithData.absent || 0} {t('hr.reports.absent')}, {monthsWithData.late || 0} {t('hr.reports.late')})
              </h2>
            <div className="bg-transparent dark:bg-slate-800/50 rounded-xl shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-sm">
                  <tr>
                    <th className="p-3 text-left">{t('hr.reports.employee')}</th>
                    <th className="p-3 text-left">{t('hr.reports.code')}</th>
                    <th className="p-3 text-center text-green-600">{t('hr.reports.present')}</th>
                    <th className="p-3 text-center text-red-600">{t('hr.reports.absent')}</th>
                    <th className="p-3 text-center text-yellow-600">{t('hr.reports.late')}</th>
                    <th className="p-3 text-center text-orange-600">{t('hr.reports.halfDay')}</th>
                    <th className="p-3 text-center text-blue-600">{t('hr.reports.onLeave')}</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceSummary.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-500 dark:text-slate-400">
                        {t('hr.reports.noAttendanceData')}
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
            <h2 className="text-lg font-semibold text-gray-700 dark:text-slate-200 mb-3">{t('hr.reports.payrollSummary')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: t('hr.reports.employeesPaid'), value: payrollSummary.count, color: "text-gray-700 dark:text-slate-200", prefix: "" },
                { label: t('hr.reports.totalGross'), value: payrollSummary.totalGross.toLocaleString(), color: "text-blue-600", prefix: "AFN " },
                { label: t('hr.reports.totalDeductions'), value: payrollSummary.totalDeductions.toLocaleString(), color: "text-red-600", prefix: "AFN " },
                { label: t('hr.reports.totalNetPaid'), value: payrollSummary.totalNet.toLocaleString(), color: "text-green-600", prefix: "AFN " },
              ].map((card) => (
                <div key={card.label} className="bg-transparent dark:bg-slate-800/50 rounded-xl shadow p-4">
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
