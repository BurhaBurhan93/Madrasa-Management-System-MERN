import { useEffect, useMemo, useState } from "react";
import api from "../../../lib/api";
import {
  buildPeriodQuery,
  getDefaultPeriodFilters,
  getPeriodDateRange,
} from "../../../utils/reportPeriods";

const formatBudgetLabel = (filters) => {
  const { start } = getPeriodDateRange(filters);
  return start.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
};

const Reports = () => {
  const [report, setReport] = useState(null);
  const [filters, setFilters] = useState(getDefaultPeriodFilters());
  const [loading, setLoading] = useState(false);

  async function fetchReport() {
    setLoading(true);
    try {
      const params = new URLSearchParams(buildPeriodQuery(filters)).toString();
      const res = await api.get(`/kitchen/reports?${params}`);
      if (res.data.success) setReport(res.data.data);
    } catch (e) {
      console.error(e);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReport();
  }, [filters.period, filters.date, filters.week, filters.month]);

  const subtitle = useMemo(() => {
    if (filters.period === "daily")
      return "Daily kitchen summary and analytics";
    if (filters.period === "weekly")
      return "Weekly kitchen summary and analytics";
    return "Monthly kitchen summary and analytics";
  }, [filters.period]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kitchen Reports</h1>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={filters.period}
            onChange={(e) =>
              setFilters((current) => ({ ...current, period: e.target.value }))
            }
            className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          {filters.period === "daily" && (
            <input
              type="date"
              value={filters.date}
              onChange={(e) =>
                setFilters((current) => ({ ...current, date: e.target.value }))
              }
              className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
            />
          )}
          {filters.period === "weekly" && (
            <input
              type="week"
              value={filters.week}
              onChange={(e) =>
                setFilters((current) => ({ ...current, week: e.target.value }))
              }
              className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
            />
          )}
          {filters.period === "monthly" && (
            <input
              type="month"
              value={filters.month}
              onChange={(e) =>
                setFilters((current) => ({ ...current, month: e.target.value }))
              }
              className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
            />
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading report...</div>
      ) : (
        report && (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                {
                  label: "Total Purchases",
                  value: `${report.totalPurchases.toLocaleString()} AFN`,
                  color: "text-red-600",
                },
                {
                  label: "Total Meals Served",
                  value: report.totalMeals,
                  color: "text-blue-600",
                },
                {
                  label: "Student Meals",
                  value: report.totalStudentMeals,
                  color: "text-green-600",
                },
                {
                  label: "Staff Meals",
                  value: report.totalStaffMeals,
                  color: "text-purple-600",
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl bg-white p-4 text-center shadow"
                >
                  <div className={`text-2xl font-bold ${card.color}`}>
                    {card.value}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">{card.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                {
                  label: "Total Inventory Items",
                  value: report.totalInventoryItems,
                  color: "text-gray-700",
                },
                {
                  label: "Low Stock Items",
                  value: report.lowStockItems,
                  color: "text-yellow-600",
                },
                {
                  label: "Waste Records",
                  value: report.totalWasteRecords,
                  color: "text-red-600",
                },
                {
                  label: "Active Students",
                  value: report.activeStudents,
                  color: "text-blue-600",
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl bg-white p-4 text-center shadow"
                >
                  <div className={`text-2xl font-bold ${card.color}`}>
                    {card.value}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">{card.label}</div>
                </div>
              ))}
            </div>

            {report.budget && (
              <div className="rounded-xl bg-white p-6 shadow">
                <h2 className="mb-4 text-lg font-semibold text-gray-700">
                  Budget — {formatBudgetLabel(filters)}
                </h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[
                    {
                      label: "Allocated",
                      value: `${report.budget.allocatedAmount.toLocaleString()} AFN`,
                      color: "text-blue-600",
                    },
                    {
                      label: "Approved",
                      value: `${report.budget.approvedAmount.toLocaleString()} AFN`,
                      color: "text-green-600",
                    },
                    {
                      label: "Spent",
                      value: `${report.budget.spentAmount.toLocaleString()} AFN`,
                      color: "text-red-600",
                    },
                    {
                      label: "Remaining",
                      value: `${report.budget.remainingAmount.toLocaleString()} AFN`,
                      color: "text-purple-600",
                    },
                  ].map((card) => (
                    <div key={card.label} className="text-center">
                      <div className={`text-xl font-bold ${card.color}`}>
                        {card.value}
                      </div>
                      <div className="text-sm text-gray-500">{card.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-sm text-gray-600">
                    <span>Budget Usage</span>
                    <span>
                      {report.budget.approvedAmount > 0
                        ? Math.round(
                            (report.budget.spentAmount /
                              report.budget.approvedAmount) *
                              100,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-200">
                    <div
                      className="h-3 rounded-full bg-cyan-500"
                      style={{
                        width: `${report.budget.approvedAmount > 0 ? Math.min((report.budget.spentAmount / report.budget.approvedAmount) * 100, 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
};

export default Reports;
