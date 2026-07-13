import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ListPage from '../shared/ListPage';
import Card from '../../../components/UIHelper/Card';
import StaffPageLayout from '../shared/StaffPageLayout';
import { PageSkeleton } from '../../../components/UIHelper/SkeletonLoader';
import { BarChartComponent, PieChartComponent } from '../../../components/UIHelper/ECharts';
import { apiFetch, parseJsonSafe } from '../../../lib/apiFetch';
import { formatCurrency, getLastMonths, groupCountBy } from '../shared/staffInsights';
import { FiAlertTriangle, FiCalendar, FiCheckCircle, FiCreditCard, FiDollarSign } from 'react-icons/fi';
import { staffApi } from '../../../api/staffApi';

export const salaryPaymentsConfig = {
  title: 'Salary Payments',
  subtitle: 'Manage salary payment records',
  endpoint: staffApi.payroll.salaryPayments,
  columns: [
    { key: 'employee', header: 'Employee ID' },
    { key: 'salaryMonth', header: 'Month' },
    { key: 'salaryYear', header: 'Year' },
    { key: 'grossSalary', header: 'Gross Salary' },
    { key: 'netSalary', header: 'Net Salary' },
    { key: 'paymentStatus', header: 'Status' }
  ],
  formFields: [
    { name: 'employee', label: 'Employee', type: 'relation', relationEndpoint: '/payroll/employees', relationLabel: (r) => `${r.fullName} (${r.employeeCode})` },
    { name: 'salaryMonth', label: 'Salary Month', type: 'number' },
    { name: 'salaryYear', label: 'Salary Year', type: 'number' },
    { name: 'grossSalary', label: 'Gross Salary', type: 'number' },
    { name: 'totalAllowance', label: 'Total Allowance', type: 'number' },
    { name: 'totalDeduction', label: 'Total Deduction', type: 'number' },
    { name: 'netSalary', label: 'Net Salary', type: 'number' },
    { name: 'paymentDate', label: 'Payment Date', type: 'date' },
    { name: 'paymentMethod', label: 'Payment Method', type: 'select', options: [
      { value: 'cash', label: 'Cash' },
      { value: 'bank', label: 'Bank' },
      { value: 'card', label: 'Card' },
      { value: 'other', label: 'Other' }
    ]},
    { name: 'transactionReference', label: 'Transaction Reference' },
    { name: 'paymentStatus', label: 'Payment Status', type: 'select', options: [
      { value: 'pending', label: 'Pending' },
      { value: 'paid', label: 'Paid' },
      { value: 'failed', label: 'Failed' }
    ]}
  ],
  initialForm: {
    employee: '',
    salaryMonth: 1,
    salaryYear: new Date().getFullYear(),
    grossSalary: 0,
    totalAllowance: 0,
    totalDeduction: 0,
    netSalary: 0,
    paymentDate: '',
    paymentMethod: 'cash',
    transactionReference: '',
    paymentStatus: 'paid'
  },
  mapFormToPayload: (form) => ({
    ...form,
    salaryMonth: Number(form.salaryMonth),
    salaryYear: Number(form.salaryYear),
    grossSalary: Number(form.grossSalary),
    totalAllowance: Number(form.totalAllowance),
    totalDeduction: Number(form.totalDeduction),
    netSalary: Number(form.netSalary)
  })
};

const SalaryPayments = () => {
  const { t } = useTranslation(['staff', 'common']);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`${staffApi.payroll.salaryPayments}?limit=200`);
        const data = await parseJsonSafe(res);
        if (!res.ok || !data.success) throw new Error(data.message || t('staff.payroll.salaryPayments.errors.loadFailed'));
        setPayments(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error(t('staff.payroll.salaryPayments.errors.loadError'), error);
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [t]);

  const insights = useMemo(() => {
    const paidThisMonth = payments.filter((payment) => {
      const paymentDate = new Date(payment.paymentDate || payment.createdAt);
      const now = new Date();
      return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
    });

    const totalAmountDisbursed = payments.reduce((sum, payment) => sum + Number(payment.netSalary || 0), 0);
    const pendingPayments = payments.filter((payment) => payment.paymentStatus === 'pending').length;
    const failedPayments = payments.filter((payment) => payment.paymentStatus === 'failed').length;

    const nextPending = payments
      .filter((payment) => payment.paymentStatus === 'pending')
      .sort((a, b) => new Date(a.paymentDate || a.createdAt) - new Date(b.paymentDate || b.createdAt))[0];

    return {
      paidThisMonth: paidThisMonth.length,
      totalAmountDisbursed,
      pendingPayments,
      failedPayments,
      nextPayrollDate: nextPending?.paymentDate ? new Date(nextPending.paymentDate).toLocaleDateString('en-US') : t('staff.payroll.salaryPayments.insights.noPending'),
      byMethod: groupCountBy(payments, (payment) => payment.paymentMethod || 'unknown'),
      byStatus: groupCountBy(payments, (payment) => payment.paymentStatus || 'unknown'),
      monthlyPayroll: getLastMonths(payments, (payment) => payment.paymentDate || payment.createdAt, (payment) => payment.netSalary)
    };
  }, [payments, t]);

  if (loading) {
    return (
      <StaffPageLayout eyebrow={t('staff.payroll.salaryPayments.eyebrow')} title={t('staff.payroll.salaryPayments.title')} subtitle={t('staff.payroll.salaryPayments.loadingSubtitle')}>
        <PageSkeleton type="dashboard" />
      </StaffPageLayout>
    );
  }

  const headerContent = (
    <>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: t('staff.payroll.salaryPayments.cards.paidThisMonth'), value: insights.paidThisMonth, icon: FiCheckCircle, tone: 'from-emerald-50 to-teal-50', chip: 'bg-emerald-100 text-emerald-700' },
          { label: t('staff.payroll.salaryPayments.cards.amountDisbursed'), value: formatCurrency(insights.totalAmountDisbursed), icon: FiDollarSign, tone: 'from-sky-50 to-cyan-50', chip: 'bg-sky-100 text-sky-700' },
          { label: t('staff.payroll.salaryPayments.cards.pendingPayments'), value: insights.pendingPayments, icon: FiCreditCard, tone: 'from-amber-50 to-yellow-50', chip: 'bg-amber-100 text-amber-700' },
          { label: t('staff.payroll.salaryPayments.cards.failedPayments'), value: insights.failedPayments, icon: FiAlertTriangle, tone: 'from-rose-50 to-red-50', chip: 'bg-rose-100 text-rose-700' },
          { label: t('staff.payroll.salaryPayments.cards.nextPayrollDate'), value: insights.nextPayrollDate, icon: FiCalendar, tone: 'from-violet-50 to-fuchsia-50', chip: 'bg-violet-100 text-violet-700' }
        ].map((item) => (
          <Card key={item.label} className={`rounded-[26px] border border-slate-200 bg-gradient-to-br ${item.tone} p-5 shadow-none dark:border-slate-700 dark:bg-none dark:bg-slate-800/50`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">{item.label}</p>
                <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">{item.value}</p>
              </div>
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.chip} dark:bg-slate-700 dark:text-slate-200`}>
                <item.icon size={22} />
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <BarChartComponent title={t('staff.payroll.salaryPayments.charts.monthlyPayroll')} data={insights.monthlyPayroll} dataKey="value" nameKey="name" height={320} />
        <PieChartComponent title={t('staff.payroll.salaryPayments.charts.paymentMethodDistribution')} data={insights.byMethod} height={320} donut />
        <PieChartComponent title={t('staff.payroll.salaryPayments.charts.paymentStatusBreakdown')} data={insights.byStatus} height={320} />
      </div>
    </>
  );

  const columns = salaryPaymentsConfig.columns.map(col => ({
    ...col,
    header: t(`staff.payroll.salaryPayments.columns.${col.key}`)
  }));

  return (
    <ListPage
      title={t('staff.payroll.salaryPayments.title')}
      subtitle={t('staff.payroll.salaryPayments.subtitle')}
      endpoint={salaryPaymentsConfig.endpoint}
      columns={columns}
      createPath="/staff/payroll/salary-payments/create"
      editPathForRow={(row) => `/staff/payroll/salary-payments/edit/${row._id}`}
      viewPathForRow={(row) => `/staff/payroll/salary-payments/view/${row._id}`}
      searchPlaceholder={t('staff.payroll.salaryPayments.searchPlaceholder')}
      eyebrow={t('staff.payroll.salaryPayments.eyebrow')}
      headerContent={headerContent}
      enableExport={true}
    />
  );
};

export default SalaryPayments;
