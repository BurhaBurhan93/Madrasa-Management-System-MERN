import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from "../../../lib/api";
import {
  getDefaultPeriodFilters,
  isDateWithinRange,
} from "../../../utils/reportPeriods";

const AdminFinancialReports = () => {
  const { t } = useTranslation('admin');

  useEffect(() => {
    const syncLang = () => {
      const lang = readStoredLanguage('adminLang', 'en');
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    };
    syncLang();
  }, []);
  const [filters, setFilters] = useState(getDefaultPeriodFilters());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    expenses: 0,
    net: 0,
    collections: 0,
  });
  const [feeBreakdown, setFeeBreakdown] = useState([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);

  async function fetchData() {
    setLoading(true);
    try {
      const [feeRes, expenseRes] = await Promise.all([
        api.get("/finance/fee-payments?limit=500"),
        api.get("/finance/expenses?limit=500"),
      ]);

      const feePayments = Array.isArray(feeRes.data?.data)
        ? feeRes.data.data
        : Array.isArray(feeRes.data)
          ? feeRes.data
          : [];
      const expenses = Array.isArray(expenseRes.data?.data)
        ? expenseRes.data.data
        : Array.isArray(expenseRes.data)
          ? expenseRes.data
          : [];

      const filteredFees = feePayments.filter((p) =>
        isDateWithinRange(p.paymentDate || p.createdAt, filters),
      );
      const filteredExpenses = expenses.filter((e) =>
        isDateWithinRange(e.expenseDate || e.createdAt, filters),
      );

      const totalRevenue = filteredFees.reduce(
        (sum, p) => sum + (p.paidAmount || 0),
        0,
      );
      const totalExpenses = filteredExpenses.reduce(
        (sum, e) => sum + (e.amount || 0),
        0,
      );

      setStats({
        revenue: totalRevenue,
        expenses: totalExpenses,
        net: totalRevenue - totalExpenses,
        collections: filteredFees.length,
      });

      // Group expenses by category
      const byCat = {};
      filteredExpenses.forEach((e) => {
        const cat = e.category || "Other";
        byCat[cat] = (byCat[cat] || 0) + (e.amount || 0);
      });
      setExpenseBreakdown(
        Object.entries(byCat)
          .map(([cat, total]) => ({ cat, total }))
          .sort((a, b) => b.total - a.total),
      );

      // Group fee payments by payment method
      const byMethod = {};
      filteredFees.forEach((p) => {
        const method = p.paymentMethod || "cash";
        byMethod[method] = (byMethod[method] || 0) + (p.paidAmount || 0);
      });
      setFeeBreakdown(
        Object.entries(byMethod).map(([method, total]) => ({ method, total })),
      );
    } catch (e) {
      console.error(e);
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
    if (filters.period === "yearly") return "this year";
    return "this month";
  }, [filters.period]);

  const fmt = (n) => `${n.toLocaleString()} AFN`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t('reports.financialReportsPage')}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {t('reports.revenueExpenses')}
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
            <option value="yearly">Yearly</option>
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-medium text-emerald-600">{t('reports.revenueExpenses')}</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">
            {loading ? "…" : fmt(stats.revenue)}
          </p>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <p className="text-xs font-medium text-rose-600">{t('reports.revenueExpenses')}</p>
          <p className="mt-1 text-2xl font-bold text-rose-700">
            {loading ? "…" : fmt(stats.expenses)}
          </p>
        </div>
        <div
          className={`rounded-2xl border p-5 ${stats.net >= 0 ? "border-cyan-200 bg-cyan-50" : "border-amber-200 bg-amber-50"}`}
        >
          <p
            className={`text-xs font-medium ${stats.net >= 0 ? "text-cyan-600" : "text-amber-600"}`}
          >
            {t('reports.financialReportsPage')}
          </p>
          <p
            className={`mt-1 text-2xl font-bold ${stats.net >= 0 ? "text-cyan-700" : "text-amber-700"}`}
          >
            {loading ? "…" : fmt(stats.net)}
          </p>
        </div>
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
          <p className="text-xs font-medium text-violet-600">{t('reports.feeCollections')}</p>
          <p className="mt-1 text-2xl font-bold text-violet-700">
            {loading ? "…" : stats.collections}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            {t('reports.revenueByMethod')}
          </h2>
          {loading ? (
            <p className="text-slate-400">{t('common.loading')}</p>
          ) : feeBreakdown.length === 0 ? (
            <p className="text-slate-400">
              {t('common.noData')}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100">
                <tr>
                  <th className="py-2 text-left text-xs font-semibold text-slate-500">
                    {t('reports.method')}
                  </th>
                  <th className="py-2 text-right text-xs font-semibold text-slate-500">
                    Amount (AFN)
                  </th>
                </tr>
              </thead>
              <tbody>
                {feeBreakdown.map(({ method, total }) => (
                  <tr key={method} className="border-b border-slate-50">
                    <td className="py-2 capitalize text-slate-700">{method}</td>
                    <td className="py-2 text-right font-medium text-emerald-700">
                      {total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            {t('reports.expenseByCategory')}
          </h2>
          {loading ? (
            <p className="text-slate-400">{t('common.loading')}</p>
          ) : expenseBreakdown.length === 0 ? (
            <p className="text-slate-400">{t('common.noData')}</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100">
                <tr>
                  <th className="py-2 text-left text-xs font-semibold text-slate-500">
                    {t('reports.expenseByCategory')}
                  </th>
                  <th className="py-2 text-right text-xs font-semibold text-slate-500">
                    Amount (AFN)
                  </th>
                </tr>
              </thead>
              <tbody>
                {expenseBreakdown.map(({ cat, total }) => (
                  <tr key={cat} className="border-b border-slate-50">
                    <td className="py-2 text-slate-700">{cat}</td>
                    <td className="py-2 text-right font-medium text-rose-700">
                      {total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFinancialReports;
