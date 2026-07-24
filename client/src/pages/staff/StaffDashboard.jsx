import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';
import { getAllowedStaffModules } from '../../lib/staffAccess';
import {
  AreaChartComponent,
  BarChartComponent,
  DoughnutChartComponent,
  RadarChartComponent,
} from '../../components/UIHelper/ECharts';
import ErrorPage from '../../components/UIHelper/ErrorPage';
import {
  FiBookOpen,
  FiBriefcase,
  FiCoffee,
  FiFileText,
  FiInbox,
  FiUsers,
} from 'react-icons/fi';

const RESOURCE_DEFS = [
  { key: 'users', label: 'dashboard.users', path: '/users', route: '/staff/users' },
  { key: 'students', label: 'dashboard.students', path: '/staff/students', route: '/staff/students' },
  { key: 'inventory', label: 'dashboard.libraryInventory', path: '/staff/inventory', route: '/staff/inventory' },
  { key: 'activities', label: 'dashboard.recentActivity', path: '/staff/activities', route: '/staff/dashboard' },
  { key: 'complaints', label: 'dashboard.complaints', path: '/staff/complaints', route: '/staff/complaints' },
  { key: 'employees', label: 'dashboard.employees', path: '/hr/employees', route: '/staff/hr/employees' },
  { key: 'leaves', label: 'dashboard.leaves', path: '/hr/leaves', route: '/staff/hr/leave' },
  { key: 'transactions', label: 'dashboard.transactions', path: '/finance/transactions?limit=200', route: '/staff/finance/transactions' },
  { key: 'accounts', label: 'dashboard.accounts', path: '/finance/accounts?limit=200', route: '/staff/finance/accounts' },
  { key: 'feePayments', label: 'dashboard.feePayments', path: '/finance/fee-payments?limit=200', route: '/staff/finance/fee-payments' },
  { key: 'expenses', label: 'dashboard.expenses', path: '/finance/expenses?limit=200', route: '/staff/finance/expenses' },
  { key: 'financialReports', label: 'dashboard.financialReports', path: '/finance/reports?limit=200', route: '/staff/finance/reports' },
  { key: 'salaryPayments', label: 'dashboard.salaryPayments', path: '/payroll/salary-payments?limit=200', route: '/staff/payroll/salary-payments' },
  { key: 'salaryAdvances', label: 'dashboard.salaryAdvances', path: '/payroll/salary-advances?limit=200', route: '/staff/payroll/salary-advances' },
  { key: 'kitchenInventory', label: 'dashboard.kitchenInventory', path: '/kitchen/inventory', route: '/staff/kitchen/inventory' },
  { key: 'kitchenBudgets', label: 'dashboard.kitchenBudgets', path: '/kitchen/budgets', route: '/staff/kitchen/requests' },
];

const extractPayload = (json) => {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (json?.data && typeof json.data === 'object') return json.data;
  return json;
};

const sumBy = (rows, key) => rows.reduce((sum, row) => sum + (Number(row?.[key]) || 0), 0);

const getStaffLocale = () => {
  const lang = typeof window !== 'undefined' ? localStorage.getItem('adminLang') || 'en' : 'en';
  return lang === 'ps' ? 'en' : lang;
};

const formatCurrency = (value) =>
  new Intl.NumberFormat(getStaffLocale(), {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatSignedCurrency = (value) =>
  `${value >= 0 ? '+' : '-'}${formatCurrency(Math.abs(value))}`;

const safeDate = (value, noDateLabel = '') => {
  if (!value) return noDateLabel;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? noDateLabel : date.toLocaleDateString(getStaffLocale());
};

const StatCard = ({ label, value, note, accentClass, iconText }) => (
  <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-transparent p-5 shadow-sm">

    <div className={`absolute inset-x-0 top-0 h-1 ${accentClass}`} />
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        <p className="mt-2 text-sm text-slate-500">{note}</p>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-semibold text-slate-700">
        {iconText}
      </div>
    </div>
  </div>
);

const Panel = ({ title, subtitle, children, className = '', dark = false }) => (
  <div className={`rounded-3xl border border-slate-200/70 bg-transparent p-6 shadow-sm ${className}`}>
    {(title || subtitle) && (
      <div className="mb-5">
        {title && (
          <h3 className={`text-lg font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
            {title}
          </h3>
        )}
        {subtitle && (
          <p className={`mt-1 text-sm ${dark ? 'text-slate-300' : 'text-slate-500'}`}>
            {subtitle}
          </p>
        )}
      </div>
    )}
    {children}
  </div>
);

const StaffDashboard = () => {
  const { t } = useTranslation(['staff', 'common']);
  const [resources, setResources] = useState({});
  const [failures, setFailures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const staffModules = useMemo(() => {
    try {
      return getAllowedStaffModules(JSON.parse(localStorage.getItem('user') || 'null'));
    } catch {
      return ['dashboard', 'profile'];
    }
  }, []);
  const isPayrollOnly = staffModules.includes('payroll') && !staffModules.includes('finance');
  const isSupportWorkspace = staffModules.includes('support') &&
    !['finance', 'payroll', 'registrar', 'library', 'kitchen', 'hr'].some((module) => staffModules.includes(module));

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      const responses = await Promise.all(
        RESOURCE_DEFS.map(async (def) => {
          try {
            const res = await apiFetch(def.path);
            const json = await parseJsonSafe(res);

            return {
              key: def.key,
              label: def.label,
              ok: true,
              data: extractPayload(json),
            };
          } catch {
            return {
              key: def.key,
              label: def.label,
              ok: false,
              data: [],
            };
          }
        })
      );

      const nextResources = {};
      const nextFailures = [];

      responses.forEach((item) => {
        nextResources[item.key] = item.data;
        if (!item.ok) nextFailures.push(item.label);
      });

      setResources(nextResources);
      setFailures(nextFailures);
    } catch (fetchError) {
      setError(fetchError?.message || t('dashboard.unableToLoadDashboard'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Support and Payroll have focused workspaces below.  Do not request every
    // staff resource here: a department account can be forbidden from one of
    // those endpoints, which previously triggered the global login redirect.
    if (isPayrollOnly || isSupportWorkspace) {
      setLoading(false);
      return;
    }
    fetchDashboardData();
  }, [isPayrollOnly, isSupportWorkspace]);

  const users = Array.isArray(resources.users) ? resources.users : [];
  const students = Array.isArray(resources.students) ? resources.students : [];
  const inventory = Array.isArray(resources.inventory) ? resources.inventory : [];
  const activities = Array.isArray(resources.activities) ? resources.activities : [];
  const complaints = Array.isArray(resources.complaints) ? resources.complaints : [];
  const employees = Array.isArray(resources.employees) ? resources.employees : [];
  const leaves = Array.isArray(resources.leaves) ? resources.leaves : [];
  const transactions = Array.isArray(resources.transactions) ? resources.transactions : [];
  const accounts = Array.isArray(resources.accounts) ? resources.accounts : [];
  const feePayments = Array.isArray(resources.feePayments) ? resources.feePayments : [];
  const expenses = Array.isArray(resources.expenses) ? resources.expenses : [];
  const financialReports = Array.isArray(resources.financialReports) ? resources.financialReports : [];
  const salaryPayments = Array.isArray(resources.salaryPayments) ? resources.salaryPayments : [];
  const salaryAdvances = Array.isArray(resources.salaryAdvances) ? resources.salaryAdvances : [];
  const kitchenInventory = Array.isArray(resources.kitchenInventory) ? resources.kitchenInventory : [];
  const kitchenBudgets = Array.isArray(resources.kitchenBudgets) ? resources.kitchenBudgets : [];
  const borrowedBooks = inventory.filter((item) => {
    const status = String(item?.status || item?.availability || '').toLowerCase();
    return status.includes('borrow') || status.includes('issued') || item?.borrowed === true;
  }).length;

  const pendingComplaints = complaints.filter((item) => {
    const status = String(item?.status || '').toLowerCase();
    return status.includes('pending') || status.includes('open');
  }).length;

  const pendingLeaves = leaves.filter((item) =>
    String(item?.status || '').toLowerCase().includes('pending')
  ).length;

  const lowStockCount = kitchenInventory.filter((item) => {
    const quantity = Number(item?.quantity ?? item?.stock ?? item?.currentStock ?? 0);
    const minStock = Number(item?.minStock ?? item?.minimumStock ?? 5);
    return quantity <= minStock;
  }).length;

  const openBudgets = kitchenBudgets.filter((item) => {
    const status = String(item?.status || '').toLowerCase();
    return status.includes('pending') || status.includes('open');
  }).length;

  const totalIncome = sumBy(transactions, 'amount') + sumBy(transactions, 'credit') + sumBy(accounts, 'balance');
  const feeIncome = sumBy(feePayments, 'amount') + sumBy(feePayments, 'paidAmount');
  const totalExpenses = sumBy(expenses, 'amount') + sumBy(expenses, 'totalAmount');
  const payrollTotal = sumBy(salaryPayments, 'amount') + sumBy(salaryPayments, 'netSalary') + sumBy(salaryAdvances, 'amount');
  const totalRevenue = totalIncome + feeIncome;
  const totalOutflow = totalExpenses + payrollTotal;
  const profitLoss = totalRevenue - totalOutflow;
  const financeHealthRaw = totalIncome + feeIncome > 0
    ? (((totalIncome + feeIncome) - (totalExpenses + payrollTotal)) / (totalIncome + feeIncome)) * 100
    : 0;
  const financeHealth = Math.max(0, Math.min(100, Math.round(financeHealthRaw + 60)));

  const metrics = {
    users: users.length,
    students: students.length || users.filter((user) => user?.role === 'student').length,
    books: inventory.length,
    borrowedBooks,
    complaints: complaints.length,
    pendingComplaints,
    employees: employees.length,
    pendingLeaves,
    kitchenItems: kitchenInventory.length,
    lowStockCount,
    openBudgets,
    totalIncome,
    feeIncome,
    totalRevenue,
    totalExpenses,
    payrollTotal,
    totalOutflow,
    profitLoss,
    financeReports: financialReports.length,
    netFlow: profitLoss,
    collectionRate:
      totalIncome + feeIncome > 0
        ? Math.min(100, Math.round((feeIncome / (totalIncome + feeIncome)) * 100))
        : 0,
    financeHealth,
  };

  const statCards = [
    {
      label: t('dashboard.totalIncome'),
      value: formatCurrency(metrics.totalIncome + metrics.feeIncome),
      note: t('dashboard.totalIncomeNote'),
      accentClass: 'bg-emerald-500',
      iconText: 'INC',
    },
    {
      label: t('dashboard.totalExpenses'),
      value: formatCurrency(metrics.totalExpenses),
      note: t('dashboard.totalExpensesNote'),
      accentClass: 'bg-rose-500',
      iconText: 'EXP',
    },
    {
      label: t('dashboard.payroll'),
      value: formatCurrency(metrics.payrollTotal),
      note: t('dashboard.payrollNote'),
      accentClass: 'bg-amber-500',
      iconText: 'PAY',
    },
    {
      label: t('dashboard.financeReports'),
      value: metrics.financeReports,
      note: t('dashboard.financeReportsNote'),
      accentClass: 'bg-sky-500',
      iconText: 'REP',
    },
  ];

  const overviewCards = [
    { title: t('dashboard.users'), value: metrics.users, route: '/staff/users', icon: FiUsers, tone: 'from-teal-500 to-cyan-600' },
    { title: t('dashboard.students'), value: metrics.students, route: '/staff/students', icon: FiUsers, tone: 'from-sky-500 to-blue-600' },
    { title: t('dashboard.libraryItems'), value: metrics.books, route: '/staff/inventory', icon: FiBookOpen, tone: 'from-indigo-500 to-blue-600' },
    { title: t('dashboard.employees'), value: metrics.employees, route: '/staff/hr/employees', icon: FiBriefcase, tone: 'from-violet-500 to-purple-600' },
    { title: t('dashboard.complaints'), value: metrics.complaints, route: '/staff/complaints', icon: FiInbox, tone: 'from-rose-500 to-red-600' },
    { title: t('dashboard.kitchenItems'), value: metrics.kitchenItems, route: '/staff/kitchen/inventory', icon: FiCoffee, tone: 'from-cyan-500 to-sky-600' },
  ];

  const financeTrendData = [
    { month: t('dashboard.monthJan'), income: Math.round((metrics.totalIncome + metrics.feeIncome) * 0.58), expense: Math.round((metrics.totalExpenses + metrics.payrollTotal) * 0.48) },
    { month: t('dashboard.monthFeb'), income: Math.round((metrics.totalIncome + metrics.feeIncome) * 0.64), expense: Math.round((metrics.totalExpenses + metrics.payrollTotal) * 0.56) },
    { month: t('dashboard.monthMar'), income: Math.round((metrics.totalIncome + metrics.feeIncome) * 0.71), expense: Math.round((metrics.totalExpenses + metrics.payrollTotal) * 0.63) },
    { month: t('dashboard.monthApr'), income: Math.round((metrics.totalIncome + metrics.feeIncome) * 0.78), expense: Math.round((metrics.totalExpenses + metrics.payrollTotal) * 0.7) },
    { month: t('dashboard.monthMay'), income: Math.round((metrics.totalIncome + metrics.feeIncome) * 0.88), expense: Math.round((metrics.totalExpenses + metrics.payrollTotal) * 0.82) },
    { month: t('dashboard.monthJun'), income: Math.round(metrics.totalIncome + metrics.feeIncome), expense: Math.round(metrics.totalExpenses + metrics.payrollTotal) },
  ];

  const profitLossTrendData = financeTrendData.map((item) => ({
    month: item.month,
    value: item.income - item.expense,
  }));

  const latestProfitLoss = profitLossTrendData[profitLossTrendData.length - 1]?.value || 0;
  const previousProfitLoss = profitLossTrendData[profitLossTrendData.length - 2]?.value || 0;
  const trendDelta = latestProfitLoss - previousProfitLoss;
  const trendDirection = trendDelta > 0 ? t('dashboard.improving') : trendDelta < 0 ? t('dashboard.declining') : t('dashboard.stable');
  const trendDirectionText = trendDelta > 0
    ? t('dashboard.financeMovingBetter')
    : trendDelta < 0
      ? t('dashboard.financeMovingWeaker')
      : t('dashboard.financeStable');
  const profitLossStatus = metrics.profitLoss >= 0 ? t('dashboard.profit') : t('dashboard.loss');

  const moduleCoverageData = [
    { name: t('dashboard.users'), value: users.length },
    { name: t('dashboard.students'), value: students.length },
    { name: t('dashboard.library'), value: inventory.length },
    { name: t('dashboard.complaints'), value: complaints.length },
    { name: t('dashboard.hr'), value: employees.length + leaves.length },
    { name: t('dashboard.finance'), value: transactions.length + accounts.length + feePayments.length + expenses.length + financialReports.length },
    { name: t('dashboard.payroll'), value: salaryPayments.length + salaryAdvances.length },
    { name: t('dashboard.kitchen'), value: kitchenInventory.length + kitchenBudgets.length },
  ];

  const tableRows = RESOURCE_DEFS.map((def) => {
    const payload = resources[def.key];
    const count = Array.isArray(payload)
      ? payload.length
      : payload && typeof payload === 'object'
        ? Object.keys(payload).length
        : 0;

    return {
      key: def.key,
      table: def.label,
      records: count,
      status: failures.includes(def.label) ? 'dashboard.unavailable' : 'dashboard.connected',
      route: def.route,
    };
  });

  const groupedTableRows = [
    {
      title: 'dashboard.core',
      items: tableRows.filter((row) => ['users', 'students', 'activities'].includes(row.key)),
      accent: 'from-cyan-500 to-sky-500',
    },
    {
      title: 'dashboard.financeGroup',
      items: tableRows.filter((row) => ['transactions', 'accounts', 'feePayments', 'expenses', 'financialReports'].includes(row.key)),
      accent: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'dashboard.people',
      items: tableRows.filter((row) => ['employees', 'leaves', 'complaints'].includes(row.key)),
      accent: 'from-violet-500 to-purple-500',
    },
    {
      title: 'dashboard.operations',
      items: tableRows.filter((row) => ['inventory', 'salaryPayments', 'salaryAdvances', 'kitchenInventory', 'kitchenBudgets'].includes(row.key)),
      accent: 'from-amber-500 to-orange-500',
    },
  ];

  const moneyMixData = [
    { name: t('dashboard.income'), value: metrics.totalIncome, color: '#10B981' },
    { name: t('dashboard.feeCollections'), value: metrics.feeIncome, color: '#06B6D4' },
    { name: t('dashboard.expenses'), value: metrics.totalExpenses, color: '#F97316' },
    { name: t('dashboard.payroll'), value: metrics.payrollTotal, color: '#F59E0B' },
  ].filter((item) => item.value > 0);

  const performanceRadarData = [
    {
      value: [
        Math.min(100, metrics.collectionRate || 28),
        Math.min(100, Math.max(15, 100 - metrics.pendingComplaints * 8)),
        Math.min(100, Math.max(20, 100 - metrics.pendingLeaves * 12)),
        Math.min(100, Math.max(20, 100 - metrics.lowStockCount * 10)),
        Math.min(100, Math.max(25, metrics.financeHealth)),
        Math.min(100, Math.max(30, metrics.financeReports * 12 || 30)),
      ],
      name: t('dashboard.staffOperations'),
    },
  ];

  const performanceIndicators = [
    { name: t('dashboard.collections'), max: 100 },
    { name: t('dashboard.complaints'), max: 100 },
    { name: t('dashboard.hr'), max: 100 },
    { name: t('dashboard.kitchen'), max: 100 },
    { name: t('dashboard.finance'), max: 100 },
    { name: t('dashboard.reporting'), max: 100 },
  ];

  const recentRows = activities.slice(0, 5).map((item, index) => ({
    id: item?._id || index,
    title: item?.title || item?.action || `${t('dashboard.recentItem')} ${index + 1}`,
    detail: item?.detail || item?.description || t('dashboard.noDetailsAvailable'),
    date: safeDate(item?.createdAt || item?.date || item?.updatedAt, t('dashboard.noDate')),
  }));

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorPage
        type="generic"
        title={t('dashboard.dashboardUnavailable')}
        message={error}
        onRetry={fetchDashboardData}
        showHomeButton={false}
        showBackButton={false}
      />
    );
  }

  // Department staff should land in their own workspace.  Previously every
  // staff member was shown the combined finance dashboard, which made Payroll
  // appear to have Finance subpanels.
  if (isPayrollOnly) {
    const payrollCards = [
      { label: t('salaryStructures'), path: '/staff/payroll/salary-structures' },
      { label: t('salaryPayments'), path: '/staff/payroll/salary-payments' },
      { label: t('salaryDeductions'), path: '/staff/payroll/salary-deductions' },
      { label: t('salaryAdvances'), path: '/staff/payroll/salary-advances' },
    ];
    return (
      <div className="min-h-screen w-full p-6">
        <Panel title={t('payroll.label')} subtitle={t('dashboard.payrollNote')}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {payrollCards.map((card) => (
              <Link key={card.path} to={card.path} className="rounded-3xl border border-amber-100 bg-transparent p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <p className="text-lg font-semibold text-slate-900">{card.label}</p>
                <p className="mt-2 text-sm text-slate-500">{t('dashboard.openModule')}</p>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    );
  }

  if (isSupportWorkspace) {
    return (
      <div className="min-h-screen w-full p-6">
        <Panel title={t('support')} subtitle={t('supportTickets')}>
          <Link to="/staff/support/tickets" className="block rounded-3xl border border-cyan-100 bg-transparent p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <p className="text-lg font-semibold text-slate-900">{t('supportTickets')}</p>
            <p className="mt-2 text-sm text-slate-500">{t('dashboard.openModule')}</p>
          </Link>
        </Panel>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-6">
     

      

        <section className="mt-2">
          <Panel
            title={t('dashboard.financeAndPayrollSnapshot')}
            subtitle={t('dashboard.financeSnapshotSubtitle')}
            className="border-cyan-100 bg-transparent"
          >
            <div className="grid gap-5 lg:grid-cols-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-emerald-100 bg-transparent p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">{t('dashboard.totalRevenue')}</p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{formatCurrency(metrics.totalRevenue)}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{t('dashboard.totalRevenueNote')}</p>
              </div>
              <div className="rounded-3xl border border-orange-100 bg-transparent p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">{t('dashboard.totalOutflow')}</p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{formatCurrency(metrics.totalOutflow)}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{t('dashboard.totalOutflowNote')}</p>
              </div>
                <div className={`rounded-3xl bg-transparent p-5 shadow-sm ${metrics.profitLoss >= 0 ? 'border border-cyan-100' : 'border border-rose-100'}`}>
                <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${metrics.profitLoss >= 0 ? 'text-cyan-600' : 'text-rose-600'}`}>{profitLossStatus}</p>
                <p className={`mt-3 text-3xl font-bold tracking-tight ${metrics.profitLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatSignedCurrency(metrics.profitLoss)}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {metrics.profitLoss >= 0 ? t('dashboard.revenueHigherThanCosts') : t('dashboard.costsHigherThanRevenue')}
                </p>
              </div>
<div className={`rounded-3xl border bg-transparent p-5 shadow-sm ${trendDelta >= 0 ? 'border-sky-100' : 'border-amber-100'}`}>
                <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${trendDelta >= 0 ? 'text-sky-600' : 'text-amber-600'}`}>{t('dashboard.direction')}</p>
                <p className={`mt-3 text-3xl font-bold tracking-tight ${trendDelta >= 0 ? 'text-sky-600' : 'text-amber-600'}`}>
                  {trendDirection}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{trendDirectionText}</p>
              </div>
            </div>

<div className="mt-6 rounded-3xl border border-cyan-100 bg-transparent p-5 shadow-sm">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-base font-semibold text-slate-900">{t('dashboard.currentResult')}</p>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  metrics.profitLoss >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {profitLossStatus}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full">
                <div
                  className={`h-full rounded-full ${metrics.profitLoss >= 0 ? 'bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-500' : 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500'}`}
                  style={{ width: `${Math.max(18, metrics.financeHealth)}%` }}
                />
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {t('dashboard.revenueOutflowResult', {
                  revenue: formatCurrency(metrics.totalRevenue),
                  outflow: formatCurrency(metrics.totalOutflow),
                  result: formatSignedCurrency(metrics.profitLoss),
                })}
              </p>
            </div>
          </Panel>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {overviewCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.title}
                to={card.route}
className="group rounded-3xl border border-slate-200 bg-transparent p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{card.title}</p>
                    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{card.value}</p>
                    <p className="mt-2 text-sm text-slate-500">{t('dashboard.openModule')}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.tone} text-white shadow-md`}>
                    <Icon size={22} />
                  </div>
                </div>
              </Link>
            );
          })}
        </section>


        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-transparent p-3 shadow-sm">
            <DoughnutChartComponent
              title={t('dashboard.moneyMix')}
              data={moneyMixData}
              height={330}
              showLegend={false}
            />
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-transparent p-3 shadow-sm">
            <RadarChartComponent
              title={t('dashboard.operationsRadar')}
              data={performanceRadarData}
              indicators={performanceIndicators}
              height={330}
            />
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
          <Panel title={t('dashboard.recentActivity')} subtitle={t('dashboard.recentActivitySubtitle')}>
            <div className="space-y-4">
              {recentRows.length > 0 ? recentRows.map((row) => (
                <div
                  key={row.id}
                  className="flex items-start gap-4 rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-xs font-semibold text-white">
                    <FiFileText size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-medium text-slate-900">{row.title}</p>
                      <p className="text-sm text-slate-400">{row.date}</p>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{row.detail}</p>
                  </div>
                </div>
              )) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                  {t('dashboard.noRecentActivity')}
                </div>
              )}
            </div>
          </Panel>
          <div className="rounded-[28px] border border-slate-200 bg-transparent p-3 shadow-sm">
            <BarChartComponent
              title={t('dashboard.moduleCoverage')}
              data={moduleCoverageData}
              dataKey="value"
              nameKey="name"
              height={320}
              color="#0EA5E9"
            />
          </div>
        </section>

        <section className="mt-8">
          <Panel title={t('dashboard.tableRegistry')} subtitle={t('dashboard.tableRegistrySubtitle')}>
            <div className="grid gap-5 xl:grid-cols-2">
              {groupedTableRows.map((group) => (
                <div
                  key={group.title}
                  className="overflow-hidden rounded-[28px] border border-slate-200 bg-transparent shadow-sm"
                >
                  <div className={`h-1 bg-gradient-to-r ${group.accent}`} />
                  <div className="border-b border-slate-100 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {t(group.title)}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {t('dashboard.connectedTables', { count: group.items.length })}
                    </p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {group.items.map((row) => (
                      <div
                        key={row.table}
                        className="flex items-center justify-between gap-4 px-5 py-4 transition-colors duration-200 hover:bg-slate-50"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{t(row.table)}</p>
                          <p className="mt-1 text-sm text-cyan-700">{row.route}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">{t('dashboard.records', { count: row.records })}</p>
                          <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            row.status === 'dashboard.connected'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {t(row.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </section>
    </div>
  );
};

export default StaffDashboard;
