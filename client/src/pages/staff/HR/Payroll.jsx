import { useEffect, useMemo, useState } from 'react';
import ListPage from '../shared/ListPage';
import Card from '../../../components/UIHelper/Card';
import StaffPageLayout from '../shared/StaffPageLayout';
import { PageSkeleton } from '../../../components/UIHelper/SkeletonLoader';
import { BarChartComponent, PieChartComponent } from '../../../components/UIHelper/ECharts';
import { apiFetch, parseJsonSafe } from '../../../lib/apiFetch';
import { formatCurrency, getLastMonths, groupCountBy } from '../shared/staffInsights';
import { staffApi } from '../../../api/staffApi';
import { FiAlertTriangle, FiCalendar, FiCheckCircle, FiCreditCard, FiDollarSign } from 'react-icons/fi';

const HRPayroll = () => {
  const [payments, setPayments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [payRes, empRes] = await Promise.all([
          apiFetch(`${staffApi.payroll.salaryPayments}?limit=200`),
          apiFetch(staffApi.hr.employees)
        ]);
        const payData = await parseJsonSafe(payRes);
        const empData = await parseJsonSafe(empRes);
        if (payRes.ok && payData.success) setPayments(Array.isArray(payData.data) ? payData.data : []);
        if (empRes.ok && empData.success) setEmployees(Array.isArray(empData.data) ? empData.data : []);
      } catch (error) {
        console.error('Failed to load HR payroll data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

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
      nextPayrollDate: nextPending?.paymentDate ? new Date(nextPending.paymentDate).toLocaleDateString('en-US') : 'No pending payroll',
      byMethod: groupCountBy(payments, (payment) => payment.paymentMethod || 'unknown'),
      byStatus: groupCountBy(payments, (payment) => payment.paymentStatus || 'unknown'),
      monthlyPayroll: getLastMonths(payments, (payment) => payment.paymentDate || payment.createdAt, (payment) => payment.netSalary)
    };
  }, [payments]);

  const getEmployeeName = (empId) => {
    if (!empId) return '-';
    const id = empId._id || empId;
    const emp = employees.find(e => e._id?.toString() === id.toString());
    return emp ? `${emp.fullName} (${emp.employeeCode || ''})` : '-';
  };

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const columns = [
    {
      key: 'employee',
      header: 'Employee',
      render: (value, row) => {
        const empId = value?._id || value;
        const emp = employees.find(e => e._id?.toString() === empId?.toString());
        return emp?.fullName || '-';
      }
    },
    {
      key: 'salaryMonth',
      header: 'Month',
      render: (value, row) => `${months[value - 1] || ''} ${row.salaryYear || ''}`
    },
    { key: 'grossSalary', header: 'Gross Salary', render: (value) => `${(value || 0).toLocaleString()} AFN` },
    { key: 'totalDeduction', header: 'Deductions', render: (value) => `${(value || 0).toLocaleString()} AFN` },
    { key: 'netSalary', header: 'Net Salary', render: (value) => `${(value || 0).toLocaleString()} AFN` },
    { key: 'paymentMethod', header: 'Method' },
    {
      key: 'paymentStatus',
      header: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
          value === 'paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
          value === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
          'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
        }`}>
          {value}
        </span>
      )
    }
  ];

  if (loading) {
    return (
      <StaffPageLayout eyebrow="HR" title="Payroll" subtitle="Employee salary payment records, disbursement totals, and payment status monitoring.">
        <PageSkeleton type="dashboard" />
      </StaffPageLayout>
    );
  }

  const headerContent = (
    <>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: 'Paid This Month', value: insights.paidThisMonth, icon: FiCheckCircle, tone: 'from-emerald-50 to-teal-50', chip: 'bg-emerald-100 text-emerald-700' },
          { label: 'Amount Disbursed', value: formatCurrency(insights.totalAmountDisbursed), icon: FiDollarSign, tone: 'from-sky-50 to-cyan-50', chip: 'bg-sky-100 text-sky-700' },
          { label: 'Pending Payments', value: insights.pendingPayments, icon: FiCreditCard, tone: 'from-amber-50 to-yellow-50', chip: 'bg-amber-100 text-amber-700' },
          { label: 'Failed Payments', value: insights.failedPayments, icon: FiAlertTriangle, tone: 'from-rose-50 to-red-50', chip: 'bg-rose-100 text-rose-700' },
          { label: 'Next Payroll Date', value: insights.nextPayrollDate, icon: FiCalendar, tone: 'from-violet-50 to-fuchsia-50', chip: 'bg-violet-100 text-violet-700' }
        ].map((item) => (
          <Card key={item.label} className={`rounded-[26px] border border-slate-200 bg-gradient-to-br ${item.tone} p-5 shadow-none`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                <p className="mt-3 text-2xl font-bold text-slate-900">{item.value}</p>
              </div>
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.chip}`}>
                <item.icon size={22} />
              </span>
            </div>
          </Card>
        ))}
      </div>
      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <BarChartComponent title="Monthly Payroll" data={insights.monthlyPayroll} dataKey="value" nameKey="name" height={320} />
        <PieChartComponent title="Payment Method Distribution" data={insights.byMethod} height={320} donut />
        <PieChartComponent title="Payment Status Breakdown" data={insights.byStatus} height={320} />
      </div>
    </>
  );

  return (
    <ListPage
      title="HR Payroll"
      subtitle="Employee salary payment records, disbursement totals, and payment status monitoring."
      endpoint={staffApi.payroll.salaryPayments}
      columns={columns}
      createPath="/staff/payroll/salary-payments/create"
      editPathForRow={(row) => `/staff/payroll/salary-payments/edit/${row._id}`}
      viewPathForRow={(row) => `/staff/payroll/salary-payments/view/${row._id}`}
      searchPlaceholder="Search salary payments..."
      eyebrow="HR"
      headerContent={headerContent}
      enableExport={true}
    />
  );
};

export default HRPayroll;
