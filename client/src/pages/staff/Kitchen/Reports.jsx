import { useEffect, useMemo, useState } from "react";
import { useTranslation } from 'react-i18next';
import StaffPageLayout from "../shared/StaffPageLayout";
import Card from "../../../components/UIHelper/Card";
import { apiFetch, parseJsonSafe } from "../../../lib/apiFetch";
import {
  buildPeriodQuery,
  getDefaultPeriodFilters,
  getPeriodDateRange,
} from "../../../utils/reportPeriods";
import { FiRefreshCw, FiShoppingCart, FiUsers, FiPackage, FiAlertTriangle, FiTrash2, FiDollarSign } from "react-icons/fi";

const formatBudgetLabel = (filters) => {
  const { start } = getPeriodDateRange(filters);
  return start.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
};

const Reports = () => {
  const { t } = useTranslation(['staff', 'common']);
  const [report, setReport] = useState(null);
  const [filters, setFilters] = useState(getDefaultPeriodFilters());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchReport() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(buildPeriodQuery(filters)).toString();
      const res = await apiFetch(`/kitchen/reports?${params}`);
      const data = await parseJsonSafe(res);
      if (!res.ok || !data.success) throw new Error(data.message || t('staff.kitchen.reports.failedToLoad', 'Failed to load report'));
      setReport(data.data);
    } catch (e) {
      setError(e.message);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReport();
  }, [filters.period, filters.date, filters.week, filters.month]);

  const subtitle = useMemo(() => {
    if (filters.period === "daily") return t('staff.kitchen.reports.subtitleDaily', 'Daily kitchen summary and analytics');
    if (filters.period === "weekly") return t('staff.kitchen.reports.subtitleWeekly', 'Weekly kitchen summary and analytics');
    return t('staff.kitchen.reports.subtitleMonthly', 'Monthly kitchen summary and analytics');
  }, [filters.period, t]);

  return (
    <StaffPageLayout eyebrow={t('staff.kitchen.reports.eyebrow', 'Kitchen')} title={t('staff.kitchen.reports.title', 'Kitchen Reports')} subtitle={subtitle}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.period}
              onChange={(e) => setFilters((c) => ({ ...c, period: e.target.value }))}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-cyan-500/20"
            >
              <option value="daily">{t('common.daily', 'Daily')}</option>
              <option value="weekly">{t('common.weekly', 'Weekly')}</option>
              <option value="monthly">{t('common.monthly', 'Monthly')}</option>
            </select>
            {filters.period === "daily" && (
              <input type="date" value={filters.date} onChange={(e) => setFilters((c) => ({ ...c, date: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-cyan-500/20" />
            )}
            {filters.period === "weekly" && (
              <input type="week" value={filters.week} onChange={(e) => setFilters((c) => ({ ...c, week: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-cyan-500/20" />
            )}
            {filters.period === "monthly" && (
              <input type="month" value={filters.month} onChange={(e) => setFilters((c) => ({ ...c, month: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-cyan-500/20" />
            )}
          </div>
          <button onClick={fetchReport} disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800/50">
            <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> {t('common.refresh', 'Refresh')}
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">{t('staff.kitchen.reports.loading', 'Loading report...')}</div>
        ) : error ? (
          <Card className="rounded-2xl border border-slate-200 p-8 text-center dark:border-slate-700 dark:bg-slate-800/50">
            <p className="text-sm text-red-500 dark:text-red-400 mb-4">{error}</p>
            <button onClick={fetchReport}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-600">
              <FiRefreshCw className="w-4 h-4" /> {t('common.retry', 'Retry')}
            </button>
          </Card>
        ) : !report ? (
          <Card className="rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
            {t('staff.kitchen.reports.noData', 'No data available for this period.')}
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { label: t('staff.kitchen.reports.totalPurchases', 'Total Purchases'), value: `${report.totalPurchases.toLocaleString()} AFN`, icon: FiShoppingCart, color: "from-red-50 to-orange-50", iconBg: "bg-red-100 dark:bg-red-900/30", iconColor: "text-red-600" },
                { label: t('staff.kitchen.reports.totalMealsServed', 'Total Meals Served'), value: report.totalMeals, icon: FiUsers, color: "from-blue-50 to-cyan-50", iconBg: "bg-blue-100 dark:bg-blue-900/30", iconColor: "text-blue-600" },
                { label: t('staff.kitchen.reports.studentMeals', 'Student Meals'), value: report.totalStudentMeals, icon: FiUsers, color: "from-green-50 to-emerald-50", iconBg: "bg-green-100 dark:bg-green-900/30", iconColor: "text-green-600" },
                { label: t('staff.kitchen.reports.staffMeals', 'Staff Meals'), value: report.totalStaffMeals, icon: FiUsers, color: "from-purple-50 to-fuchsia-50", iconBg: "bg-purple-100 dark:bg-purple-900/30", iconColor: "text-purple-600" },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <Card key={card.label} className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${card.color} p-5 dark:border-slate-700 dark:bg-none dark:bg-slate-800/50`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{card.label}</p>
                        <p className={`text-2xl font-bold ${card.iconColor}`}>{card.value}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${card.iconColor}`} />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { label: t('staff.kitchen.reports.totalInventoryItems', 'Total Inventory Items'), value: report.totalInventoryItems, icon: FiPackage, color: "from-slate-50 to-gray-50", iconBg: "bg-slate-100 dark:bg-slate-800", iconColor: "text-slate-700 dark:text-slate-200" },
                { label: t('staff.kitchen.reports.lowStockItems', 'Low Stock Items'), value: report.lowStockItems, icon: FiAlertTriangle, color: "from-yellow-50 to-amber-50", iconBg: "bg-yellow-100 dark:bg-yellow-900/30", iconColor: "text-yellow-600" },
                { label: t('staff.kitchen.reports.wasteRecords', 'Waste Records'), value: report.totalWasteRecords, icon: FiTrash2, color: "from-red-50 to-rose-50", iconBg: "bg-red-100 dark:bg-red-900/30", iconColor: "text-red-600" },
                { label: t('staff.kitchen.reports.activeStudents', 'Active Students'), value: report.activeStudents, icon: FiUsers, color: "from-blue-50 to-indigo-50", iconBg: "bg-blue-100 dark:bg-blue-900/30", iconColor: "text-blue-600" },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <Card key={card.label} className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${card.color} p-5 dark:border-slate-700 dark:bg-none dark:bg-slate-800/50`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{card.label}</p>
                        <p className={`text-2xl font-bold ${card.iconColor}`}>{card.value}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${card.iconColor}`} />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {report.budget && (
              <Card className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700 dark:bg-slate-800/50">
                <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
                  {t('staff.kitchen.reports.budget', 'Budget')} — {formatBudgetLabel(filters)}
                </h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[
                    { label: t('staff.kitchen.reports.budgetAllocated', 'Allocated'), value: `${report.budget.allocatedAmount.toLocaleString()} AFN`, color: "text-blue-600 dark:text-blue-400", icon: FiDollarSign },
                    { label: t('staff.kitchen.reports.budgetApproved', 'Approved'), value: `${report.budget.approvedAmount.toLocaleString()} AFN`, color: "text-green-600 dark:text-green-400" },
                    { label: t('staff.kitchen.reports.budgetSpent', 'Spent'), value: `${report.budget.spentAmount.toLocaleString()} AFN`, color: "text-red-600 dark:text-red-400" },
                    { label: t('staff.kitchen.reports.budgetRemaining', 'Remaining'), value: `${report.budget.remainingAmount.toLocaleString()} AFN`, color: "text-purple-600 dark:text-purple-400" },
                  ].map((card) => (
                    <div key={card.label} className="text-center">
                      <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{card.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-sm text-slate-600 dark:text-slate-300">
                    <span>{t('staff.kitchen.reports.budgetUsage', 'Budget Usage')}</span>
                    <span>{report.budget.approvedAmount > 0 ? Math.round((report.budget.spentAmount / report.budget.approvedAmount) * 100) : 0}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-3 rounded-full bg-cyan-500" style={{ width: `${report.budget.approvedAmount > 0 ? Math.min((report.budget.spentAmount / report.budget.approvedAmount) * 100, 100) : 0}%` }} />
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </StaffPageLayout>
  );
};

export default Reports;
