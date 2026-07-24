import React, { useEffect, useState } from 'react';
import { FiAlertCircle, FiCheckCircle, FiClock, FiDollarSign, FiTag } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import ListPage from '../shared/ListPage';
import StaffAnalyticsContent, { fetchCollectionData, formatCurrency, groupAmountByMonth, groupCountByKey } from '../shared/StaffAnalyticsContent';
import { staffApi } from '../../../api/staffApi';

export const expensesConfig = {
  title: 'finance.expenses.title',
  subtitle: 'finance.expenses.subtitle',
  endpoint: staffApi.finance.expenses,
  columns: [
    { key: 'expenseCode', header: 'finance.expenses.column.expenseCode' },
    { key: 'category', header: 'finance.expenses.column.category' },
    { key: 'title', header: 'finance.expenses.column.title' },
    { key: 'amount', header: 'finance.expenses.column.amount' },
    { key: 'expenseDate', header: 'finance.expenses.column.expenseDate' },
    { key: 'paymentMethod', header: 'finance.expenses.column.paymentMethod' },
    { key: 'approvalStatus', header: 'finance.expenses.column.approvalStatus' }
  ],
  formFields: [
    { name: 'expenseCode', label: 'finance.expenses.formField.expenseCode' },
    { name: 'category', label: 'finance.expenses.formField.category' },
    { name: 'title', label: 'finance.expenses.formField.title' },
    { name: 'amount', label: 'finance.expenses.formField.amount', type: 'number' },
    { name: 'expenseDate', label: 'finance.expenses.formField.expenseDate', type: 'date' },
    { name: 'paymentMethod', label: 'finance.expenses.formField.paymentMethod', type: 'select', options: [{ value: 'cash', label: 'finance.expenses.formField.paymentMethod.cash' }, { value: 'card', label: 'finance.expenses.formField.paymentMethod.card' }, { value: 'other', label: 'finance.expenses.formField.paymentMethod.other' }] },
    { name: 'referenceNo', label: 'finance.expenses.formField.referenceNo' },
    { name: 'paidTo', label: 'finance.expenses.formField.paidTo' },
    { name: 'approvalStatus', label: 'finance.expenses.formField.approvalStatus', type: 'select', options: [{ value: 'pending', label: 'finance.expenses.formField.approvalStatus.pending' }, { value: 'approved', label: 'finance.expenses.formField.approvalStatus.approved' }, { value: 'rejected', label: 'finance.expenses.formField.approvalStatus.rejected' }] },
    { name: 'remarks', label: 'finance.expenses.formField.remarks' }
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
            { label: t('finance.expenses.statTotalExpenses'), value: formatCurrency(totalExpenses), helper: t('finance.expenses.statTotalExpensesHelper'), tone: 'rose', icon: FiDollarSign },
            { label: t('finance.expenses.statPendingApprovals'), value: pendingApprovals, helper: t('finance.expenses.statPendingApprovalsHelper'), tone: 'amber', icon: FiClock },
            { label: t('finance.expenses.statThisMonth'), value: formatCurrency(thisMonthTotal), helper: t('finance.expenses.statThisMonthHelper'), tone: 'blue', icon: FiCheckCircle },
            { label: t('finance.expenses.statExpenseCategories'), value: groupCountByKey(expenses, 'category').length, helper: t('finance.expenses.statExpenseCategoriesHelper'), tone: 'violet', icon: FiTag },
            { label: t('finance.expenses.statRejectedEntries'), value: rejectedCount, helper: t('finance.expenses.statRejectedEntriesHelper'), tone: 'emerald', icon: FiAlertCircle }
          ],
          charts: [
            { title: t('finance.expenses.chart.categoryDistribution'), type: 'pie', data: groupCountByKey(expenses, 'category') },
            { title: t('finance.expenses.chart.approvalStatusBreakdown'), type: 'bar', data: groupCountByKey(expenses, 'approvalStatus') },
            { title: t('finance.expenses.chart.monthlyExpenseTrend'), type: 'line', data: groupAmountByMonth(expenses, 'expenseDate', 'amount') }
          ],
          insight: {
            eyebrow: t('finance.expenses.insight.eyebrow'),
            title: t('finance.expenses.insight.title'),
            description: t('finance.expenses.insight.description')
          }
        });
      } catch (error) {
        if (!active) return;
        setAnalytics({ loading: false, stats: [], charts: [], insight: { title: t('finance.expenses.errorTitle'), description: error.message || t('finance.expenses.errorDescription') } });
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <ListPage
      eyebrow={t('finance.eyebrow')}
      title={expensesConfig.title}
      subtitle={expensesConfig.subtitle}
      endpoint={expensesConfig.endpoint}
      columns={expensesConfig.columns}
      createPath="/staff/finance/expenses/create"
      editPathForRow={(row) => `/staff/finance/expenses/edit/${row._id}`}
      viewPathForRow={(row) => `/staff/finance/expenses/view/${row._id}`}
      searchPlaceholder={t('finance.expenses.searchPlaceholder')}
      enableExport={true}
      headerContent={!analytics.loading ? <StaffAnalyticsContent stats={analytics.stats} charts={analytics.charts} insight={analytics.insight} /> : null}
    />
  );
};

export default Expenses;
