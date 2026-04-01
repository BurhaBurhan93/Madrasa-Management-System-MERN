import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
} from 'reactflow';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  FiActivity,
  FiAlertCircle,
  FiBookOpen,
  FiBriefcase,
  FiClock,
  FiCoffee,
  FiDollarSign,
  FiFileText,
  FiInbox,
  FiLayers,
  FiShield,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi';
import 'reactflow/dist/style.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const RESOURCE_DEFS = [
  { key: 'users', label: 'Users', path: '/users', type: 'list', category: 'Core', route: '/staff/users' },
  { key: 'students', label: 'Students', path: '/staff/students', type: 'list', category: 'Core', route: '/staff/students' },
  { key: 'inventory', label: 'Library Inventory', path: '/staff/inventory', type: 'list', category: 'Library', route: '/staff/inventory' },
  { key: 'activities', label: 'Recent Activity', path: '/staff/activities', type: 'list', category: 'Library', route: '/staff/dashboard' },
  { key: 'complaints', label: 'Complaints', path: '/staff/complaints', type: 'list', category: 'Complaints', route: '/staff/complaints' },
  { key: 'staffDashboard', label: 'Staff Summary', path: '/staff/dashboard', type: 'object', category: 'Core', route: '/staff/dashboard' },
  { key: 'transactions', label: 'Transactions', path: '/finance/transactions?limit=200', type: 'list', category: 'Finance', route: '/staff/finance/transactions' },
  { key: 'accounts', label: 'Accounts', path: '/finance/accounts?limit=200', type: 'list', category: 'Finance', route: '/staff/finance/accounts' },
  { key: 'feeStructures', label: 'Fee Structures', path: '/finance/fee-structures?limit=200', type: 'list', category: 'Finance', route: '/staff/finance/fee-structures' },
  { key: 'studentFees', label: 'Student Fees', path: '/finance/student-fees?limit=200', type: 'list', category: 'Finance', route: '/staff/finance/student-fees' },
  { key: 'feePayments', label: 'Fee Payments', path: '/finance/fee-payments?limit=200', type: 'list', category: 'Finance', route: '/staff/finance/fee-payments' },
  { key: 'expenses', label: 'Expenses', path: '/finance/expenses?limit=200', type: 'list', category: 'Finance', route: '/staff/finance/expenses' },
  { key: 'financialReports', label: 'Financial Reports', path: '/finance/reports?limit=200', type: 'list', category: 'Finance', route: '/staff/finance/reports' },
  { key: 'salaryStructures', label: 'Salary Structures', path: '/payroll/salary-structures?limit=200', type: 'list', category: 'Payroll', route: '/staff/payroll/salary-structures' },
  { key: 'salaryPayments', label: 'Salary Payments', path: '/payroll/salary-payments?limit=200', type: 'list', category: 'Payroll', route: '/staff/payroll/salary-payments' },
  { key: 'salaryDeductions', label: 'Salary Deductions', path: '/payroll/salary-deductions?limit=200', type: 'list', category: 'Payroll', route: '/staff/payroll/salary-deductions' },
  { key: 'salaryAdvances', label: 'Salary Advances', path: '/payroll/salary-advances?limit=200', type: 'list', category: 'Payroll', route: '/staff/payroll/salary-advances' },
  { key: 'departments', label: 'Departments', path: '/hr/departments', type: 'list', category: 'HR', route: '/staff/hr/departments' },
  { key: 'designations', label: 'Designations', path: '/hr/designations', type: 'list', category: 'HR', route: '/staff/hr/designations' },
  { key: 'leaveTypes', label: 'Leave Types', path: '/hr/leave-types', type: 'list', category: 'HR', route: '/staff/hr/leave-types' },
  { key: 'employees', label: 'Employees', path: '/hr/employees', type: 'list', category: 'HR', route: '/staff/hr/employees' },
  { key: 'employeeStats', label: 'Employee Stats', path: '/hr/employees/stats', type: 'object', category: 'HR', route: '/staff/hr/employees' },
  { key: 'leaves', label: 'Leaves', path: '/hr/leaves', type: 'list', category: 'HR', route: '/staff/hr/leave' },
  { key: 'attendanceSummary', label: 'Attendance Summary', path: '/hr/attendance/summary', type: 'object', category: 'HR', route: '/staff/hr/attendance' },
  { key: 'kitchenInventory', label: 'Kitchen Inventory', path: '/kitchen/inventory', type: 'list', category: 'Kitchen', route: '/staff/kitchen/inventory' },
  { key: 'kitchenPurchases', label: 'Kitchen Purchases', path: '/kitchen/purchases', type: 'list', category: 'Kitchen', route: '/staff/kitchen/menu' },
  { key: 'kitchenConsumption', label: 'Daily Consumption', path: '/kitchen/consumption', type: 'list', category: 'Kitchen', route: '/staff/kitchen/meals' },
  { key: 'kitchenBudgets', label: 'Kitchen Budgets', path: '/kitchen/budgets', type: 'list', category: 'Kitchen', route: '/staff/kitchen/requests' },
  { key: 'kitchenMenu', label: 'Weekly Menu', path: '/kitchen/menu', type: 'list', category: 'Kitchen', route: '/staff/kitchen/weekly-menu' },
  { key: 'kitchenSuppliers', label: 'Suppliers', path: '/kitchen/suppliers', type: 'list', category: 'Kitchen', route: '/staff/kitchen/suppliers' },
  { key: 'kitchenWaste', label: 'Waste Tracking', path: '/kitchen/waste', type: 'list', category: 'Kitchen', route: '/staff/kitchen/waste' },
];

const CATEGORY_COLORS = {
  Core: '#0f766e',
  Library: '#2563eb',
  Complaints: '#dc2626',
  Finance: '#16a34a',
  Payroll: '#d97706',
  HR: '#7c3aed',
  Kitchen: '#0891b2',
};

const cardMeta = {
  users: { title: 'Users', icon: FiUsers, tone: 'from-teal-500 to-cyan-600' },
  students: { title: 'Students', icon: FiUsers, tone: 'from-sky-500 to-blue-600' },
  inventory: { title: 'Library Items', icon: FiBookOpen, tone: 'from-indigo-500 to-blue-600' },
  complaints: { title: 'Complaints', icon: FiInbox, tone: 'from-rose-500 to-red-600' },
  employees: { title: 'Employees', icon: FiBriefcase, tone: 'from-violet-500 to-purple-600' },
  kitchenInventory: { title: 'Kitchen Items', icon: FiCoffee, tone: 'from-cyan-500 to-sky-600' },
  transactions: { title: 'Finance Records', icon: FiDollarSign, tone: 'from-emerald-500 to-green-600' },
  salaryPayments: { title: 'Payroll Records', icon: FiShield, tone: 'from-amber-500 to-orange-600' },
};

const sectionCard =
  'rounded-[1.6rem] border border-slate-200/70 bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.06)]';

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

const getCollectionCount = (value) => {
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === 'object') return Object.keys(value).length;
  return 0;
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const sumBy = (rows, key) => rows.reduce((sum, row) => sum + (Number(row?.[key]) || 0), 0);

const safeDateLabel = (value) => {
  if (!value) return 'No date';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'No date' : date.toLocaleDateString();
};

const StaffDashboard = () => {
  const [resources, setResources] = useState({});
  const [failures, setFailures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const headers = getAuthHeaders();

        const results = await Promise.allSettled(
          RESOURCE_DEFS.map(async (def) => {
            const res = await fetch(`${API_BASE}${def.path}`, { headers });
            const json = await res.json();

            if (!res.ok || json?.success === false) {
              throw new Error(json?.message || `Failed to load ${def.label}`);
            }

            return [def.key, extractPayload(json)];
          })
        );

        const nextResources = {};
        const nextFailures = [];

        results.forEach((result, index) => {
          const def = RESOURCE_DEFS[index];
          if (result.status === 'fulfilled') {
            const [key, payload] = result.value;
            nextResources[key] = payload;
          } else {
            nextResources[def.key] = def.type === 'list' ? [] : {};
            nextFailures.push(def.label);
          }
        });

        setResources(nextResources);
        setFailures(nextFailures);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const metrics = useMemo(() => {
    const users = Array.isArray(resources.users) ? resources.users : [];
    const students = Array.isArray(resources.students) ? resources.students : [];
    const inventory = Array.isArray(resources.inventory) ? resources.inventory : [];
    const complaints = Array.isArray(resources.complaints) ? resources.complaints : [];
    const employees = Array.isArray(resources.employees) ? resources.employees : [];
    const kitchenInventory = Array.isArray(resources.kitchenInventory) ? resources.kitchenInventory : [];
    const transactions = Array.isArray(resources.transactions) ? resources.transactions : [];
    const feePayments = Array.isArray(resources.feePayments) ? resources.feePayments : [];
    const expenses = Array.isArray(resources.expenses) ? resources.expenses : [];
    const salaryPayments = Array.isArray(resources.salaryPayments) ? resources.salaryPayments : [];
    const leaves = Array.isArray(resources.leaves) ? resources.leaves : [];
    const kitchenBudgets = Array.isArray(resources.kitchenBudgets) ? resources.kitchenBudgets : [];
    const kitchenWaste = Array.isArray(resources.kitchenWaste) ? resources.kitchenWaste : [];

    return {
      userCount: users.length,
      studentCount: students.length || Number(resources.staffDashboard?.totalStudents) || 0,
      libraryCount: inventory.length || Number(resources.staffDashboard?.totalBooks) || 0,
      complaintCount: complaints.length,
      pendingComplaints: complaints.filter((item) => item.status === 'pending').length || Number(resources.staffDashboard?.pendingComplaints) || 0,
      employeeCount: employees.length || Number(resources.staffDashboard?.totalEmployees) || 0,
      kitchenInventoryCount: kitchenInventory.length || Number(resources.staffDashboard?.totalInventoryItems) || 0,
      lowStockCount: kitchenInventory.filter((item) => item.status === 'low').length || Number(resources.staffDashboard?.lowStockItems) || 0,
      financeCount:
        getCollectionCount(resources.transactions) +
        getCollectionCount(resources.accounts) +
        getCollectionCount(resources.feeStructures) +
        getCollectionCount(resources.studentFees) +
        getCollectionCount(resources.feePayments) +
        getCollectionCount(resources.expenses) +
        getCollectionCount(resources.financialReports),
      payrollCount:
        getCollectionCount(resources.salaryStructures) +
        getCollectionCount(resources.salaryPayments) +
        getCollectionCount(resources.salaryDeductions) +
        getCollectionCount(resources.salaryAdvances),
      hrCount:
        getCollectionCount(resources.departments) +
        getCollectionCount(resources.designations) +
        getCollectionCount(resources.leaveTypes) +
        getCollectionCount(resources.employees) +
        getCollectionCount(resources.leaves),
      kitchenCount:
        getCollectionCount(resources.kitchenInventory) +
        getCollectionCount(resources.kitchenPurchases) +
        getCollectionCount(resources.kitchenConsumption) +
        getCollectionCount(resources.kitchenBudgets) +
        getCollectionCount(resources.kitchenMenu) +
        getCollectionCount(resources.kitchenSuppliers) +
        getCollectionCount(resources.kitchenWaste),
      incomeTotal: transactions.filter((item) => item.transactionType === 'income').reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
      expenseTotal: sumBy(expenses, 'amount'),
      salaryTotal: sumBy(salaryPayments.filter((item) => item.paymentStatus === 'paid'), 'netSalary'),
      feeCollectionTotal: sumBy(feePayments, 'paidAmount'),
      pendingLeaves: leaves.filter((item) => item.status === 'pending').length || Number(resources.staffDashboard?.pendingLeaves) || 0,
      openBudgets: kitchenBudgets.filter((item) => item.status === 'pending' || item.approvalStatus === 'pending').length,
      wasteEntries: kitchenWaste.length,
    };
  }, [resources]);

  const headlineCards = [
    { key: 'users', value: metrics.userCount, subtitle: 'Registered across the system', route: '/staff/users' },
    { key: 'students', value: metrics.studentCount, subtitle: 'Student records available', route: '/staff/students' },
    { key: 'inventory', value: metrics.libraryCount, subtitle: 'Library and inventory items', route: '/staff/inventory' },
    { key: 'complaints', value: metrics.complaintCount, subtitle: `${metrics.pendingComplaints} pending complaints`, route: '/staff/complaints' },
    { key: 'employees', value: metrics.employeeCount, subtitle: `${metrics.pendingLeaves} leave requests pending`, route: '/staff/hr/employees' },
    { key: 'kitchenInventory', value: metrics.kitchenInventoryCount, subtitle: `${metrics.lowStockCount} low stock alerts`, route: '/staff/kitchen/inventory' },
    { key: 'transactions', value: metrics.financeCount, subtitle: formatCurrency(metrics.feeCollectionTotal), route: '/staff/finance/transactions' },
    { key: 'salaryPayments', value: metrics.payrollCount, subtitle: formatCurrency(metrics.salaryTotal), route: '/staff/payroll/salary-payments' },
  ];

  const topStats = [
    { label: 'Connected Tables', value: RESOURCE_DEFS.length },
    { label: 'Open Alerts', value: metrics.pendingComplaints + metrics.lowStockCount + metrics.openBudgets },
    { label: 'Pending Leaves', value: metrics.pendingLeaves },
    { label: 'Budget Requests', value: metrics.openBudgets },
  ];

  const executiveStats = [
    {
      label: 'Collections',
      value: formatCurrency(metrics.feeCollectionTotal),
      note: 'Fee payments recorded',
      icon: FiDollarSign,
      tone: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    },
    {
      label: 'Payroll Paid',
      value: formatCurrency(metrics.salaryTotal),
      note: 'Processed salary value',
      icon: FiShield,
      tone: 'text-amber-700 bg-amber-50 border-amber-100',
    },
    {
      label: 'System Alerts',
      value: metrics.pendingComplaints + metrics.lowStockCount + metrics.openBudgets,
      note: 'Items needing attention',
      icon: FiAlertCircle,
      tone: 'text-rose-700 bg-rose-50 border-rose-100',
    },
  ];

  const operationsChartData = [
    { name: 'Core', records: metrics.userCount + metrics.studentCount, fill: CATEGORY_COLORS.Core },
    { name: 'Library', records: metrics.libraryCount + getCollectionCount(resources.activities), fill: CATEGORY_COLORS.Library },
    { name: 'Complaints', records: metrics.complaintCount, fill: CATEGORY_COLORS.Complaints },
    { name: 'Finance', records: metrics.financeCount, fill: CATEGORY_COLORS.Finance },
    { name: 'Payroll', records: metrics.payrollCount, fill: CATEGORY_COLORS.Payroll },
    { name: 'HR', records: metrics.hrCount, fill: CATEGORY_COLORS.HR },
    { name: 'Kitchen', records: metrics.kitchenCount, fill: CATEGORY_COLORS.Kitchen },
  ];

  const financeMixData = [
    { name: 'Fees Collected', value: metrics.feeCollectionTotal, fill: '#0ea5e9' },
    { name: 'Income', value: metrics.incomeTotal, fill: '#16a34a' },
    { name: 'Expenses', value: metrics.expenseTotal, fill: '#dc2626' },
    { name: 'Salary Paid', value: metrics.salaryTotal, fill: '#d97706' },
  ].filter((item) => item.value > 0);

  const tableRows = useMemo(
    () =>
      RESOURCE_DEFS.map((def) => {
        const payload = resources[def.key];
        const records = getCollectionCount(payload);
        const status =
          def.key === 'complaints'
            ? `${metrics.pendingComplaints} pending`
            : def.key === 'leaves'
              ? `${metrics.pendingLeaves} pending`
              : def.key === 'kitchenInventory'
                ? `${metrics.lowStockCount} low stock`
                : def.key === 'kitchenBudgets'
                  ? `${metrics.openBudgets} pending`
                  : def.key === 'kitchenWaste'
                    ? `${metrics.wasteEntries} waste rows`
                    : 'Synced';

        return {
          table: def.label,
          category: def.category,
          records,
          status,
          route: def.route,
        };
      }),
    [metrics, resources]
  );

  const recentActivityRows = [
    ...(Array.isArray(resources.activities) ? resources.activities.slice(0, 4).map((item) => ({
      section: 'Library',
      title: item.action || 'Activity',
      detail: item.detail || 'Recent library activity',
      date: safeDateLabel(item.time),
    })) : []),
    ...(Array.isArray(resources.complaints) ? resources.complaints.slice(0, 4).map((item) => ({
      section: 'Complaints',
      title: item.title || item.subject || 'Complaint',
      detail: item.status || 'Open',
      date: safeDateLabel(item.createdAt),
    })) : []),
    ...(Array.isArray(resources.salaryPayments) ? resources.salaryPayments.slice(0, 4).map((item) => ({
      section: 'Payroll',
      title: `Salary ${item.salaryMonth || '-'} / ${item.salaryYear || '-'}`,
      detail: item.paymentStatus || 'Unknown',
      date: safeDateLabel(item.paymentDate || item.createdAt),
    })) : []),
  ].slice(0, 10);

  const flowNodes = [
    {
      id: 'core',
      position: { x: 260, y: 10 },
      data: { label: `Core\n${metrics.userCount + metrics.studentCount} records` },
      style: { background: '#ccfbf1', border: '1px solid #14b8a6', width: 150, textAlign: 'center', whiteSpace: 'pre-line' },
    },
    {
      id: 'library',
      position: { x: 40, y: 150 },
      data: { label: `Library\n${metrics.libraryCount}` },
      style: { background: '#dbeafe', border: '1px solid #3b82f6', width: 140, textAlign: 'center', whiteSpace: 'pre-line' },
    },
    {
      id: 'complaints',
      position: { x: 220, y: 150 },
      data: { label: `Complaints\n${metrics.complaintCount}` },
      style: { background: '#fee2e2', border: '1px solid #ef4444', width: 140, textAlign: 'center', whiteSpace: 'pre-line' },
    },
    {
      id: 'finance',
      position: { x: 400, y: 150 },
      data: { label: `Finance\n${metrics.financeCount}` },
      style: { background: '#dcfce7', border: '1px solid #22c55e', width: 140, textAlign: 'center', whiteSpace: 'pre-line' },
    },
    {
      id: 'payroll',
      position: { x: 580, y: 150 },
      data: { label: `Payroll\n${metrics.payrollCount}` },
      style: { background: '#fef3c7', border: '1px solid #f59e0b', width: 140, textAlign: 'center', whiteSpace: 'pre-line' },
    },
    {
      id: 'hr',
      position: { x: 220, y: 290 },
      data: { label: `HR\n${metrics.hrCount}` },
      style: { background: '#ede9fe', border: '1px solid #8b5cf6', width: 140, textAlign: 'center', whiteSpace: 'pre-line' },
    },
    {
      id: 'kitchen',
      position: { x: 460, y: 290 },
      data: { label: `Kitchen\n${metrics.kitchenCount}` },
      style: { background: '#cffafe', border: '1px solid #06b6d4', width: 140, textAlign: 'center', whiteSpace: 'pre-line' },
    },
  ];

  const flowEdges = [
    { id: 'e-core-library', source: 'core', target: 'library' },
    { id: 'e-core-complaints', source: 'core', target: 'complaints' },
    { id: 'e-core-finance', source: 'core', target: 'finance' },
    { id: 'e-core-payroll', source: 'core', target: 'payroll' },
    { id: 'e-finance-payroll', source: 'finance', target: 'payroll' },
    { id: 'e-core-hr', source: 'core', target: 'hr' },
    { id: 'e-core-kitchen', source: 'core', target: 'kitchen' },
    { id: 'e-hr-payroll', source: 'hr', target: 'payroll' },
    { id: 'e-kitchen-finance', source: 'kitchen', target: 'finance' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-slate-900">
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#eef6ff_45%,#f8fafc_100%)] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.07)]">
        <div className="absolute -right-12 top-0 h-40 w-40 rounded-full bg-cyan-100/70 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-emerald-100/70 blur-3xl" />
        <div className="relative grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700 shadow-sm">
              <FiActivity size={14} />
              Staff Dashboard
            </div>
            <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Professional overview for the full staff system
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Review operations, finance, payroll, complaints, HR, and kitchen activity from a single clean workspace designed for quick monitoring.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              {topStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            {executiveStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className={`rounded-2xl border px-4 py-4 shadow-sm ${stat.tone}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">{stat.label}</p>
                      <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                      <p className="mt-1 text-sm opacity-80">{stat.note}</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
                      <Icon size={20} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {failures.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm">
          Some sources could not be loaded: {failures.join(', ')}.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {headlineCards.map((card) => {
          const meta = cardMeta[card.key];
          const Icon = meta.icon;

          return (
            <Link
              key={card.key}
              to={card.route}
              className="group rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.09)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">{meta.title}</p>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{card.value}</p>
                  <p className="mt-3 text-xs leading-5 text-slate-500">{card.subtitle}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.tone} text-white shadow-md transition-transform duration-200 group-hover:scale-105`}>
                  <Icon size={22} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className={`${sectionCard} p-6`}>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
              <FiLayers className="text-cyan-600" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Operations</p>
              <h3 className="text-lg font-semibold text-slate-900">Records By Department</h3>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={operationsChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="records" radius={[10, 10, 0, 0]}>
                  {operationsChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${sectionCard} p-6`}>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <FiTrendingUp className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Finance</p>
              <h3 className="text-lg font-semibold text-slate-900">Money Snapshot</h3>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={financeMixData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={4}>
                  {financeMixData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {financeMixData.map((item) => (
              <div key={item.name} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                  <p className="text-xs font-medium text-slate-500">{item.name}</p>
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-900">{formatCurrency(item.value)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr]">
        <div className={`${sectionCard} p-6`}>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
              <FiActivity className="text-violet-600" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Connections</p>
              <h3 className="text-lg font-semibold text-slate-900">System Flow</h3>
            </div>
          </div>
          <div className="h-[380px] overflow-hidden rounded-[1.4rem] border border-slate-100 bg-slate-50">
            <ReactFlow nodes={flowNodes} edges={flowEdges} fitView nodesDraggable={false} nodesConnectable={false} elementsSelectable={false}>
              <MiniMap />
              <Controls />
              <Background gap={16} color="#e2e8f0" />
            </ReactFlow>
          </div>
        </div>

        <div className={`${sectionCard} p-6`}>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <FiFileText className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Activity Feed</p>
              <h3 className="text-lg font-semibold text-slate-900">Recent Cross-Module Activity</h3>
            </div>
          </div>
          <div className="space-y-3">
            {recentActivityRows.length > 0 ? recentActivityRows.map((row, index) => (
              <div key={`${row.section}-${index}`} className="rounded-[1.3rem] border border-slate-100 bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{row.section}</p>
                    <p className="mt-1 font-semibold text-slate-900">{row.title}</p>
                    <p className="text-sm text-slate-500">{row.detail}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-500 shadow-sm">{row.date}</span>
                </div>
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                No recent activity available yet.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`${sectionCard} p-6`}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <FiShield className="text-slate-700" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Registry</p>
              <h3 className="text-lg font-semibold text-slate-900">Table Registry</h3>
            </div>
          </div>
          <p className="text-sm text-slate-500">Tables currently feeding this dashboard</p>
        </div>
        <div className="overflow-x-auto rounded-[1.4rem] border border-slate-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Table</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Records</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Route</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {tableRows.map((row) => (
                <tr key={row.table} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{row.table}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{row.category}</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900">{row.records}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{row.status}</td>
                  <td className="px-4 py-3 text-sm text-cyan-700">{row.route}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-[1.5rem] border border-emerald-100 bg-[linear-gradient(180deg,#f3fcf7_0%,#ecfdf5_100%)] p-5 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-700">
            <FiDollarSign />
            <h3 className="font-semibold">Finance Summary</h3>
          </div>
          <p className="mt-4 text-3xl font-bold text-emerald-800">{formatCurrency(metrics.incomeTotal + metrics.feeCollectionTotal)}</p>
          <p className="mt-2 text-sm leading-6 text-emerald-700">Income plus fee collections across finance tables</p>
        </div>
        <div className="rounded-[1.5rem] border border-amber-100 bg-[linear-gradient(180deg,#fff9ed_0%,#fffbeb_100%)] p-5 shadow-sm">
          <div className="flex items-center gap-2 text-amber-700">
            <FiClock />
            <h3 className="font-semibold">HR Attention</h3>
          </div>
          <p className="mt-4 text-3xl font-bold text-amber-800">{metrics.pendingLeaves}</p>
          <p className="mt-2 text-sm leading-6 text-amber-700">Leave approvals waiting from HR records</p>
        </div>
        <div className="rounded-[1.5rem] border border-rose-100 bg-[linear-gradient(180deg,#fff5f5_0%,#fff1f2_100%)] p-5 shadow-sm">
          <div className="flex items-center gap-2 text-rose-700">
            <FiAlertCircle />
            <h3 className="font-semibold">Operational Alerts</h3>
          </div>
          <p className="mt-4 text-3xl font-bold text-rose-800">{metrics.pendingComplaints + metrics.lowStockCount + metrics.openBudgets}</p>
          <p className="mt-2 text-sm leading-6 text-rose-700">Complaints, low stock items, and pending budgets combined</p>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
