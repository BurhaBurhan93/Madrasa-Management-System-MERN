import React, { useEffect, useMemo, useState } from "react";
import api from "../../../lib/api";
import {
  buildPeriodQuery,
  getDefaultPeriodFilters,
} from "../../../utils/reportPeriods";

const AdminOperationalReports = () => {
  const [filters, setFilters] = useState(getDefaultPeriodFilters());
  const [loading, setLoading] = useState(true);
  const [kitchen, setKitchen] = useState(null);
  const [library, setLibrary] = useState(null);
  const [error, setError] = useState("");

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams(buildPeriodQuery(filters)).toString();
      const [kitchenRes, libraryRes] = await Promise.all([
        api.get(`/kitchen/reports?${params}`),
        api.get("/library/reports"),
      ]);

      if (kitchenRes.data?.success) setKitchen(kitchenRes.data.data);
      if (libraryRes.data?.success) setLibrary(libraryRes.data.data);
    } catch (e) {
      console.error(e);
      setError("Failed to load operational data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [filters.period, filters.date, filters.week, filters.month]);

  const periodLabel = useMemo(() => {
    if (filters.period === "daily") return "today";
    if (filters.period === "weekly") return "this week";
    if (filters.period === "quarterly") return "this quarter";
    return "this month";
  }, [filters.period]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Operational Reports
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Kitchen, library, and facility overview for {periodLabel}
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={filters.period}
            onChange={(e) =>
              setFilters((c) => ({ ...c, period: e.target.value }))
            }
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
          {filters.period === "daily" && (
            <input
              type="date"
              value={filters.date}
              onChange={(e) =>
                setFilters((c) => ({ ...c, date: e.target.value }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          )}
          {filters.period === "weekly" && (
            <input
              type="week"
              value={filters.week}
              onChange={(e) =>
                setFilters((c) => ({ ...c, week: e.target.value }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          )}
          {filters.period === "monthly" && (
            <input
              type="month"
              value={filters.month}
              onChange={(e) =>
                setFilters((c) => ({ ...c, month: e.target.value }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          )}
        </div>
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
          <p className="text-xs font-medium text-cyan-600">Total Meals</p>
          <p className="mt-1 text-2xl font-bold text-cyan-700">
            {loading ? "…" : (kitchen?.totalMeals ?? "—")}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-medium text-emerald-600">Library Books</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">
            {loading ? "…" : (library?.totalBooks ?? "—")}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-xs font-medium text-amber-600">
            Kitchen Cost ({periodLabel})
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-700">
            {loading
              ? "…"
              : kitchen
                ? `${(kitchen.totalPurchases || 0).toLocaleString()} AFN`
                : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
          <p className="text-xs font-medium text-violet-600">Books Borrowed</p>
          <p className="mt-1 text-2xl font-bold text-violet-700">
            {loading ? "…" : (library?.totalBorrowed ?? "—")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            Kitchen Operations
          </h2>
          {loading ? (
            <p className="text-slate-400">Loading…</p>
          ) : !kitchen ? (
            <p className="text-slate-400">No kitchen data available.</p>
          ) : (
            <dl className="space-y-2 text-sm">
              {[
                {
                  label: "Total Purchases",
                  value: `${(kitchen.totalPurchases || 0).toLocaleString()} AFN`,
                },
                {
                  label: "Student Meals",
                  value: kitchen.totalStudentMeals ?? 0,
                },
                { label: "Staff Meals", value: kitchen.totalStaffMeals ?? 0 },
                { label: "Total Meals", value: kitchen.totalMeals ?? 0 },
                {
                  label: "Waste Records",
                  value: kitchen.totalWasteRecords ?? 0,
                },
                { label: "Low Stock Items", value: kitchen.lowStockItems ?? 0 },
                {
                  label: "Active Students",
                  value: kitchen.activeStudents ?? 0,
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between border-b border-slate-50 pb-1"
                >
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-medium text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            Library Operations
          </h2>
          {loading ? (
            <p className="text-slate-400">Loading…</p>
          ) : !library ? (
            <p className="text-slate-400">No library data available.</p>
          ) : (
            <dl className="space-y-2 text-sm">
              {[
                { label: "Total Books", value: library.totalBooks ?? 0 },
                {
                  label: "Currently Borrowed",
                  value: library.totalBorrowed ?? 0,
                },
                {
                  label: "Total Purchases",
                  value: library.totalPurchases ?? 0,
                },
                { label: "Total Sales", value: library.totalSales ?? 0 },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between border-b border-slate-50 pb-1"
                >
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-medium text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            Kitchen Budget
          </h2>
          {loading ? (
            <p className="text-slate-400">Loading…</p>
          ) : !kitchen?.budget ? (
            <p className="text-slate-400">No budget data for this period.</p>
          ) : (
            <dl className="space-y-2 text-sm">
              {[
                {
                  label: "Allocated",
                  value: `${(kitchen.budget.allocatedAmount || 0).toLocaleString()} AFN`,
                },
                {
                  label: "Approved",
                  value: `${(kitchen.budget.approvedAmount || 0).toLocaleString()} AFN`,
                },
                {
                  label: "Spent",
                  value: `${(kitchen.budget.spentAmount || 0).toLocaleString()} AFN`,
                },
                {
                  label: "Remaining",
                  value: `${(kitchen.budget.remainingAmount || 0).toLocaleString()} AFN`,
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between border-b border-slate-50 pb-1"
                >
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-medium text-slate-800">{value}</dd>
                </div>
              ))}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Budget Usage</span>
                  <span>
                    {kitchen.budget.approvedAmount > 0
                      ? Math.round(
                          (kitchen.budget.spentAmount /
                            kitchen.budget.approvedAmount) *
                            100,
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-cyan-500"
                    style={{
                      width: `${kitchen.budget.approvedAmount > 0 ? Math.min((kitchen.budget.spentAmount / kitchen.budget.approvedAmount) * 100, 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            </dl>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOperationalReports;
