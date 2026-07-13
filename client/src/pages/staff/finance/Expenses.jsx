import React, { useEffect, useState } from 'react';
import { FiAlertCircle, FiCheckCircle, FiClock, FiDollarSign, FiTag } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['staff', 'common']);
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
            { label: t('staff.finance.expenses.statTotalExpenses'), value: formatCurrency(totalExpenses), helper: t('staff.finance.expenses.statTotalExpensesHelper'), tone: 'rose', icon: FiDollarSign },
            { label: t('staff.finance.expenses.statPendingApprovals'), value: pendingApprovals, helper: t('staff.finance.expenses.statPendingApprovalsHelper'), tone: 'amber', icon: FiClock },
            { label: t('staff.finance.expenses.statThisMonth'), value: formatCurrency(thisMonthTotal), helper: t('staff.finance.expenses.statThisMonthHelper'), tone: 'blue', icon: FiCheckCircle },
            { label: t('staff.finance.expenses.statExpenseCategories'), value: groupCountByKey(expenses, 'category').length, helper: t('staff.finance.expenses.statExpenseCategoriesHelper'), tone: 'violet', icon: FiTag },
            { label: t('staff.finance.expenses.statRejectedEntries'), value: rejectedCount, helper: t('staff.finance.expenses.statRejectedEntriesHelper'), tone: 'emerald', icon: FiAlertCircle }
          ],
          charts: [
            { title: t('staff.finance.expenses.chartCategoryDistribution'), type: 'pie', data: groupCountByKey(expenses, 'category') },
            { title: t('staff.finance.expenses.chartApprovalStatusBreakdown'), type: 'bar', data: groupCountByKey(expenses, 'approvalStatus') },
            { title: t('staff.finance.expenses.chartMonthlyExpenseTrend'), type: 'line', data: groupAmountByMonth(expenses, 'expenseDate', 'amount') }
          ],
          insight: {
            eyebrow: t('staff.finance.expenses.insightEyebrow'),
            title: t('staff.finance.expenses.insightTitle'),
            description: t('staff.finance.expenses.insightDescription')
          }
        });
      } catch (error) {
        if (!active) return;
        setAnalytics({ loading: false, stats: [], charts: [], insight: { title: t('staff.finance.expenses.errorTitle'), description: error.message || t('staff.finance.expenses.errorDescription') } });
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <ListPage
      eyebrow={t('staff.finance.eyebrow')}
      title={expensesConfig.title}
      subtitle={expensesConfig.subtitle}
      endpoint={expensesConfig.endpoint}
      columns={expensesConfig.columns}
      createPath="/staff/finance/expenses/create"
      editPathForRow={(row) => `/staff/finance/expenses/edit/${row._id}`}
      viewPathForRow={(row) => `/staff/finance/expenses/view/${row._id}`}
      searchPlaceholder={t('staff.finance.expenses.searchPlaceholder')}
      enableExport={true}
      headerContent={!analytics.loading ? <StaffAnalyticsContent stats={analytics.stats} charts={analytics.charts} insight={analytics.insight} /> : null}
    />
  );
};

export default Expenses;
