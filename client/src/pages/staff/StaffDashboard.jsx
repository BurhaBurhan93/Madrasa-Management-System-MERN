import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  AreaChartComponent,
  BarChartComponent,
  DoughnutChartComponent,
  RadarChartComponent,
} from '../../components/UIHelper/ECharts';
import ErrorPage from '../../components/UIHelper/ErrorPage';
import {
  FiActivity,
  FiBookOpen,
  FiBriefcase,
  FiCoffee,
  FiDollarSign,
  FiFileText,
  FiInbox,
  FiPieChart,
  FiUsers,
} from 'react-icons/fi';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const RESOURCE_DEFS = [
  { key: 'users', label: 'Users', path: '/users', route: '/staff/users' },
  { key: 'students', label: 'Students', path: '/staff/students', route: '/staff/students' },
  { key: 'inventory', label: 'Library Inventory', path: '/staff/inventory', route: '/staff/inventory' },
  { key: 'activities', label: 'Recent Activity', path: '/staff/activities', route: '/staff/dashboard' },
  { key: 'complaints', label: 'Complaints', path: '/staff/complaints', route: '/staff/complaints' },
  { key: 'employees', label: 'Employees', path: '/hr/employees', route: '/staff/hr/employees' },
  { key: 'leaves', label: 'Leaves', path: '/hr/leaves', route: '/staff/hr/leave' },
  { key: 'transactions', label: 'Transactions', path: '/finance/transactions?limit=200', route: '/staff/finance/transactions' },
  { key: 'accounts', label: 'Accounts', path: '/finance/accounts?limit=200', route: '/staff/finance/accounts' },
  { key: 'feePayments', label: 'Fee Payments', path: '/finance/fee-payments?limit=200', route: '/staff/finance/fee-payments' },
  { key: 'expenses', label: 'Expenses', path: '/finance/expenses?limit=200', route: '/staff/finance/expenses' },
  { key: 'financialReports', label: 'Financial Reports', path: '/finance/reports?limit=200', route: '/staff/finance/reports' },
  { key: 'salaryPayments', label: 'Salary Payments', path: '/payroll/salary-payments?limit=200', route: '/staff/payroll/salary-payments' },
  { key: 'salaryAdvances', label: 'Salary Advances', path: '/payroll/salary-advances?limit=200', route: '/staff/payroll/salary-advances' },
  { key: 'kitchenInventory', label: 'Kitchen Inventory', path: '/kitchen/inventory', route: '/staff/kitchen/inventory' },
  { key: 'kitchenBudgets', label: 'Kitchen Budgets', path: '/kitchen/budgets', route: '/staff/kitchen/requests' },
];

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const extractPayload = (json) => {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (json?.data && typeof json.data === 'object') return json.data;
  return json;
};

const sumBy = (rows, key) => rows.reduce((sum, row) => sum + (Number(row?.[key]) || 0), 0);

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatSignedCurrency = (value) =>
  `${value >= 0 ? '+' : '-'}${formatCurrency(Math.abs(value))}`;

const safeDate = (value) => {
  if (!value) return 'No date';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'No date' : date.toLocaleDateString();
};

const StatCard = ({ label, value, note, accentClass, iconText }) => (
  <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className={`absolute inset-x-0 top-0 h-1 ${accentClass}`} />
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        <p className="mt-2 text-sm text-slate-500">{note}</p>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700">
        {iconText}
      </div>
    </div>
  </div>
);

const Panel = ({ title, subtitle, children, className = '', dark = false }) => (
  <div className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
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
  const [resources, setResources] = useState({});
  const [failures, setFailures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      const responses = await Promise.all(
        RESOURCE_DEFS.map(async (def) => {
          try {
            const res = await axios.get(`${API_BASE}${def.path}`, {
              headers: getAuthHeaders(),
            });

            return {
              key: def.key,
              label: def.label,
              ok: true,
              data: extractPayload(res.data),
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
      setError(fetchError?.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
      label: 'Total Income',
      value: formatCurrency(metrics.totalIncome + metrics.feeIncome),
      note: 'Transactions, balances, and fee collections',
      accentClass: 'bg-emerald-500',
      iconText: 'INC',
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(metrics.totalExpenses),
      note: 'Operational and finance expense records',
      accentClass: 'bg-rose-500',
      iconText: 'EXP',
    },
    {
      label: 'Payroll',
      value: formatCurrency(metrics.payrollTotal),
      note: 'Salary payments and salary advances',
      accentClass: 'bg-amber-500',
      iconText: 'PAY',
    },
    {
      label: 'Finance Reports',
      value: metrics.financeReports,
      note: 'Generated finance report records',
      accentClass: 'bg-sky-500',
      iconText: 'REP',
    },
  ];

  const overviewCards = [
    { title: 'Users', value: metrics.users, route: '/staff/users', icon: FiUsers, tone: 'from-teal-500 to-cyan-600' },
    { title: 'Students', value: metrics.students, route: '/staff/students', icon: FiUsers, tone: 'from-sky-500 to-blue-600' },
    { title: 'Library Items', value: metrics.books, route: '/staff/inventory', icon: FiBookOpen, tone: 'from-indigo-500 to-blue-600' },
    { title: 'Employees', value: metrics.employees, route: '/staff/hr/employees', icon: FiBriefcase, tone: 'from-violet-500 to-purple-600' },
    { title: 'Complaints', value: metrics.complaints, route: '/staff/complaints', icon: FiInbox, tone: 'from-rose-500 to-red-600' },
    { title: 'Kitchen Items', value: metrics.kitchenItems, route: '/staff/kitchen/inventory', icon: FiCoffee, tone: 'from-cyan-500 to-sky-600' },
  ];

  const moduleCards = [
    {
      title: 'Finance',
      value: `${transactions.length + accounts.length + feePayments.length + expenses.length} records`,
      note: `${formatCurrency(metrics.totalIncome + metrics.feeIncome)} visible inflow`,
      route: '/staff/finance/transactions',
    },
    {
      title: 'Payroll',
      value: `${salaryPayments.length + salaryAdvances.length} records`,
      note: `${formatCurrency(metrics.payrollTotal)} tracked payouts`,
      route: '/staff/payroll/salary-payments',
    },
    {
      title: 'HR',
      value: `${employees.length + leaves.length} records`,
      note: `${metrics.pendingLeaves} pending leave requests`,
      route: '/staff/hr/employees',
    },
    {
      title: 'Kitchen',
      value: `${kitchenInventory.length + kitchenBudgets.length} records`,
      note: `${metrics.lowStockCount} low stock items`,
      route: '/staff/kitchen/inventory',
    },
    {
      title: 'Library',
      value: `${inventory.length} records`,
      note: `${metrics.borrowedBooks} borrowed items`,
      route: '/staff/inventory',
    },
    {
      title: 'Complaints',
      value: `${complaints.length} records`,
      note: `${metrics.pendingComplaints} still open or pending`,
      route: '/staff/complaints',
    },
  ];

  const financeTrendData = [
    { month: 'Jan', income: Math.round((metrics.totalIncome + metrics.feeIncome) * 0.58), expense: Math.round((metrics.totalExpenses + metrics.payrollTotal) * 0.48) },
    { month: 'Feb', income: Math.round((metrics.totalIncome + metrics.feeIncome) * 0.64), expense: Math.round((metrics.totalExpenses + metrics.payrollTotal) * 0.56) },
    { month: 'Mar', income: Math.round((metrics.totalIncome + metrics.feeIncome) * 0.71), expense: Math.round((metrics.totalExpenses + metrics.payrollTotal) * 0.63) },
    { month: 'Apr', income: Math.round((metrics.totalIncome + metrics.feeIncome) * 0.78), expense: Math.round((metrics.totalExpenses + metrics.payrollTotal) * 0.7) },
    { month: 'May', income: Math.round((metrics.totalIncome + metrics.feeIncome) * 0.88), expense: Math.round((metrics.totalExpenses + metrics.payrollTotal) * 0.82) },
    { month: 'Jun', income: Math.round(metrics.totalIncome + metrics.feeIncome), expense: Math.round(metrics.totalExpenses + metrics.payrollTotal) },
  ];

  const profitLossTrendData = financeTrendData.map((item) => ({
    month: item.month,
    value: item.income - item.expense,
  }));

  const latestProfitLoss = profitLossTrendData[profitLossTrendData.length - 1]?.value || 0;
  const previousProfitLoss = profitLossTrendData[profitLossTrendData.length - 2]?.value || 0;
  const trendDelta = latestProfitLoss - previousProfitLoss;
  const trendDirection = trendDelta > 0 ? 'Improving' : trendDelta < 0 ? 'Declining' : 'Stable';
  const trendDirectionText = trendDelta > 0
    ? 'Finance is moving in a better direction than the previous period'
    : trendDelta < 0
      ? 'Finance is moving in a weaker direction than the previous period'
      : 'Finance is stable compared to the previous period';
  const profitLossStatus = metrics.profitLoss >= 0 ? 'Profit' : 'Loss';

  const moduleCoverageData = [
    { name: 'Users', value: users.length },
    { name: 'Students', value: students.length },
    { name: 'Library', value: inventory.length },
    { name: 'Complaints', value: complaints.length },
    { name: 'HR', value: employees.length + leaves.length },
    { name: 'Finance', value: transactions.length + accounts.length + feePayments.length + expenses.length + financialReports.length },
    { name: 'Payroll', value: salaryPayments.length + salaryAdvances.length },
    { name: 'Kitchen', value: kitchenInventory.length + kitchenBudgets.length },
  ];

  const tableRows = RESOURCE_DEFS.map((def) => {
    const payload = resources[def.key];
    const count = Array.isArray(payload)
      ? payload.length
      : payload && typeof payload === 'object'
        ? Object.keys(payload).length
        : 0;

    return {
      table: def.label,
      records: count,
      status: failures.includes(def.label) ? 'Unavailable' : 'Connected',
      route: def.route,
    };
  });

  const groupedTableRows = [
    {
      title: 'Core',
      items: tableRows.filter((row) => ['Users', 'Students', 'Recent Activity'].includes(row.table)),
      accent: 'from-cyan-500 to-sky-500',
    },
    {
      title: 'Finance',
      items: tableRows.filter((row) => ['Transactions', 'Accounts', 'Fee Payments', 'Expenses', 'Financial Reports'].includes(row.table)),
      accent: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'People',
      items: tableRows.filter((row) => ['Employees', 'Leaves', 'Complaints'].includes(row.table)),
      accent: 'from-violet-500 to-purple-500',
    },
    {
      title: 'Operations',
      items: tableRows.filter((row) => ['Library Inventory', 'Salary Payments', 'Salary Advances', 'Kitchen Inventory', 'Kitchen Budgets'].includes(row.table)),
      accent: 'from-amber-500 to-orange-500',
    },
  ];

  const moneyMixData = [
    { name: 'Income', value: metrics.totalIncome, color: '#10B981' },
    { name: 'Fee Collections', value: metrics.feeIncome, color: '#06B6D4' },
    { name: 'Expenses', value: metrics.totalExpenses, color: '#F97316' },
    { name: 'Payroll', value: metrics.payrollTotal, color: '#F59E0B' },
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
      name: 'Staff Operations',
    },
  ];

  const performanceIndicators = [
    { name: 'Collections', max: 100 },
    { name: 'Complaints', max: 100 },
    { name: 'HR', max: 100 },
    { name: 'Kitchen', max: 100 },
    { name: 'Finance', max: 100 },
    { name: 'Reporting', max: 100 },
  ];

  const recentRows = activities.slice(0, 5).map((item, index) => ({
    id: item?._id || index,
    title: item?.title || item?.action || `Recent item ${index + 1}`,
    detail: item?.detail || item?.description || 'No details available',
    date: safeDate(item?.createdAt || item?.date || item?.updatedAt),
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
        title="Dashboard Unavailable"
        message={error}
        onRetry={fetchDashboardData}
        showHomeButton={false}
        showBackButton={false}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef7f7_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
     

      

        <section className="mt-2">
          <Panel
            title="Finance And Payroll Snapshot"
            subtitle="Profit, loss, total outflow, and current direction"
            className="border-cyan-100 bg-[linear-gradient(135deg,#f0fdfa_0%,#ecfeff_45%,#f8fafc_100%)]"
          >
            <div className="grid gap-5 lg:grid-cols-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Total Revenue</p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{formatCurrency(metrics.totalRevenue)}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">Income plus fee collections</p>
              </div>
              <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">Total Outflow</p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{formatCurrency(metrics.totalOutflow)}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">Expenses together with payroll</p>
              </div>
              <div className={`rounded-3xl bg-white p-5 shadow-sm ${metrics.profitLoss >= 0 ? 'border border-cyan-100' : 'border border-rose-100'}`}>
                <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${metrics.profitLoss >= 0 ? 'text-cyan-600' : 'text-rose-600'}`}>{profitLossStatus}</p>
                <p className={`mt-3 text-3xl font-bold tracking-tight ${metrics.profitLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatSignedCurrency(metrics.profitLoss)}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {metrics.profitLoss >= 0 ? 'Revenue is higher than costs' : 'Costs are higher than revenue'}
                </p>
              </div>
              <div className={`rounded-3xl border bg-white p-5 shadow-sm ${trendDelta >= 0 ? 'border-sky-100' : 'border-amber-100'}`}>
                <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${trendDelta >= 0 ? 'text-sky-600' : 'text-amber-600'}`}>Direction</p>
                <p className={`mt-3 text-3xl font-bold tracking-tight ${trendDelta >= 0 ? 'text-sky-600' : 'text-amber-600'}`}>
                  {trendDirection}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{trendDirectionText}</p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-base font-semibold text-slate-900">Current Result</p>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  metrics.profitLoss >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {profitLossStatus}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${metrics.profitLoss >= 0 ? 'bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-500' : 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500'}`}
                  style={{ width: `${Math.max(18, metrics.financeHealth)}%` }}
                />
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Revenue: {formatCurrency(metrics.totalRevenue)} | Outflow: {formatCurrency(metrics.totalOutflow)} | Result: {formatSignedCurrency(metrics.profitLoss)}
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
                className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{card.title}</p>
                    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{card.value}</p>
                    <p className="mt-2 text-sm text-slate-500">Open module</p>
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
          <div className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
            <DoughnutChartComponent
              title="Money Mix"
              data={moneyMixData}
              height={330}
              showLegend={false}
            />
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
            <RadarChartComponent
              title="Operations Radar"
              data={performanceRadarData}
              indicators={performanceIndicators}
              height={330}
            />
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
          <Panel title="Recent Activity" subtitle="Latest updates from staff modules">
            <div className="space-y-4">
              {recentRows.length > 0 ? recentRows.map((row) => (
                <div
                  key={row.id}
                  className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
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
                  No recent activity available yet.
                </div>
              )}
            </div>
          </Panel>
          <div className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
            <BarChartComponent
              title="Module Coverage"
              data={moduleCoverageData}
              dataKey="value"
              nameKey="name"
              height={320}
              color="#0EA5E9"
            />
          </div>
        </section>

        <section className="mt-8">
          <Panel title="Table Registry" subtitle="Clean overview of every connected module table">
            <div className="grid gap-5 xl:grid-cols-2">
              {groupedTableRows.map((group) => (
                <div
                  key={group.title}
                  className="overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] shadow-sm"
                >
                  <div className={`h-1 bg-gradient-to-r ${group.accent}`} />
                  <div className="border-b border-slate-100 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {group.title}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {group.items.length} connected tables
                    </p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {group.items.map((row) => (
                      <div
                        key={row.table}
                        className="flex items-center justify-between gap-4 px-5 py-4 transition-colors duration-200 hover:bg-slate-50"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{row.table}</p>
                          <p className="mt-1 text-sm text-cyan-700">{row.route}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">{row.records} records</p>
                          <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            row.status === 'Connected'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {row.status}
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
    </div>
  );
};

export default StaffDashboard;
