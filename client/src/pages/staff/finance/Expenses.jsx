import React, { useEffect, useState } from 'react';
import { FiAlertCircle, FiCheckCircle, FiClock, FiDollarSign, FiTag } from 'react-icons/fi';
import ListPage from '../shared/ListPage';
import StaffAnalyticsContent, { fetchCollectionData, formatCurrency, groupAmountByMonth, groupCountByKey } from '../shared/StaffAnalyticsContent';
import { staffApi } from '../../../api/staffApi';

export const expensesConfig = {
  title: 'Expenses',
  subtitle: 'Review spending, approval workload, and category mix from live expense records.',
  endpoint: staffApi.finance.expenses,
  columns: [
    { key: 'expenseCode', header: 'Expense Code' },
    { key: 'category', header: 'Category' },
    { key: 'title', header: 'Title' },
    { key: 'amount', header: 'Amount' },
    { key: 'expenseDate', header: 'Expense Date' },
    { key: 'paymentMethod', header: 'Payment Method' },
    { key: 'approvalStatus', header: 'Approval Status' }
  ],
  formFields: [
    { name: 'expenseCode', label: 'Expense Code' },
    { name: 'category', label: 'Category' },
    { name: 'title', label: 'Title' },
    { name: 'amount', label: 'Amount', type: 'number' },
    { name: 'expenseDate', label: 'Expense Date', type: 'date' },
    { name: 'paymentMethod', label: 'Payment Method', type: 'select', options: [{ value: 'cash', label: 'Cash' }, { value: 'card', label: 'Card' }, { value: 'other', label: 'Other' }] },
    { name: 'referenceNo', label: 'Reference No' },
    { name: 'paidTo', label: 'Paid To' },
    { name: 'approvalStatus', label: 'Approval Status', type: 'select', options: [{ value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }] },
    { name: 'remarks', label: 'Remarks' }
  ],
  initialForm: {
    expenseCode: '',
    category: '',
    title: '',
    amount: 0,
    expenseDate: '',
    paymentMethod: 'cash',
    referenceNo: '',
    paidTo: '',
    approvalStatus: 'pending',
    remarks: ''
  },
  mapFormToPayload: (form) => ({ ...form, amount: Number(form.amount) })
};

const Expenses = () => {
  const [analytics, setAnalytics] = useState({ loading: true, stats: [], charts: [], insight: null });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const expenses = await fetchCollectionData(staffApi.finance.expenses);
        if (!active) return;

        const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const pendingApprovals = expenses.filter((item) => item.approvalStatus === 'pending').length;
        const rejectedCount = expenses.filter((item) => item.approvalStatus === 'rejected').length;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const thisMonthTotal = expenses
          .filter((item) => {
            const date = new Date(item.expenseDate || item.createdAt);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
          })
          .reduce((sum, item) => sum + Number(item.amount || 0), 0);

        setAnalytics({
          loading: false,
          stats: [
            { label: 'Total Expenses', value: formatCurrency(totalExpenses), helper: 'All recorded outgoing spend', tone: 'rose', icon: FiDollarSign },
            { label: 'Pending Approvals', value: pendingApprovals, helper: 'Awaiting approval action', tone: 'amber', icon: FiClock },
            { label: 'This Month', value: formatCurrency(thisMonthTotal), helper: 'Current-month expense burn', tone: 'blue', icon: FiCheckCircle },
            { label: 'Expense Categories', value: groupCountByKey(expenses, 'category').length, helper: 'Distinct spending buckets', tone: 'violet', icon: FiTag },
            { label: 'Rejected Entries', value: rejectedCount, helper: 'Require review or correction', tone: 'emerald', icon: FiAlertCircle }
          ],
          charts: [
            { title: 'Category Distribution', type: 'pie', data: groupCountByKey(expenses, 'category') },
            { title: 'Approval Status Breakdown', type: 'bar', data: groupCountByKey(expenses, 'approvalStatus') },
            { title: 'Monthly Expense Trend', type: 'line', data: groupAmountByMonth(expenses, 'expenseDate', 'amount') }
          ],
          insight: {
            eyebrow: 'Approval Flow',
            title: 'Expense oversight now includes category and approval visibility',
            description: 'The staff panel now surfaces current-month burn, approval backlog, and schema-backed category patterns before the detailed records table.'
          }
        });
      } catch (error) {
        if (!active) return;
        setAnalytics({ loading: false, stats: [], charts: [], insight: { title: 'Expense analytics could not be loaded', description: error.message || 'The expense table is still available below.' } });
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <ListPage
      eyebrow="Finance"
      title={expensesConfig.title}
      subtitle={expensesConfig.subtitle}
      endpoint={expensesConfig.endpoint}
      columns={expensesConfig.columns}
      createPath="/staff/finance/expenses/create"
      editPathForRow={(row) => `/staff/finance/expenses/edit/${row._id}`}
      viewPathForRow={(row) => `/staff/finance/expenses/view/${row._id}`}
      searchPlaceholder="Search expenses..."
      enableExport={true}
      headerContent={!analytics.loading ? <StaffAnalyticsContent stats={analytics.stats} charts={analytics.charts} insight={analytics.insight} /> : null}
    />
  );
};

export default Expenses;
