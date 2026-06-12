import React, { useEffect, useState } from 'react';
import { FiActivity, FiAlertCircle, FiDollarSign, FiTrendingDown, FiTrendingUp } from 'react-icons/fi';
import ListPage from '../shared/ListPage';
import StaffAnalyticsContent, { fetchCollectionData, formatCurrency, groupAmountByMonth, groupCountByKey } from '../shared/StaffAnalyticsContent';
import { staffApi } from '../../../api/staffApi';

export const transactionsConfig = {
  title: 'Financial Transactions',
  subtitle: 'Manage income and expense transactions with live balance and verification visibility.',
  endpoint: staffApi.finance.transactions,
  columns: [
    { key: 'transactionDate', header: 'Date', render: (value) => new Date(value).toISOString().slice(0, 10) },
    { key: 'transactionCode', header: 'Code' },
    { key: 'description', header: 'Description' },
    { key: 'transactionType', header: 'Type' },
    { key: 'amount', header: 'Amount' },
    { key: 'verificationStatus', header: 'Status' }
  ],
  formFields: [
    { name: 'transactionType', label: 'Transaction Type', type: 'select', options: [{ value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' }] },
    { name: 'account', label: 'Account', type: 'relation', relationEndpoint: '/finance/accounts', relationLabel: (r) => `${r.accountName} (${r.accountCode})` },
    { name: 'amount', label: 'Amount', type: 'number' },
    { name: 'transactionDate', label: 'Transaction Date', type: 'date' },
    { name: 'referenceType', label: 'Reference Type' },
    { name: 'description', label: 'Description' },
    { name: 'verificationStatus', label: 'Verification Status', type: 'select', options: [{ value: 'verified', label: 'Verified' }, { value: 'pending', label: 'Pending' }, { value: 'rejected', label: 'Rejected' }] },
    { name: 'accountCode', label: 'Account Code' }
  ],
  initialForm: {
    transactionType: 'income',
    account: '',
    amount: 0,
    transactionDate: '',
    referenceType: '',
    description: '',
    verificationStatus: 'verified'
  },
  mapFormToPayload: (form) => ({ ...form, amount: Number(form.amount) }),
  mapRowToForm: (row) => ({
    transactionType: row.transactionType || 'income',
    account: row.account?._id || row.account || '',
    amount: row.amount ?? 0,
    transactionDate: row.transactionDate ? new Date(row.transactionDate).toISOString().slice(0, 10) : '',
    referenceType: row.referenceType || '',
    description: row.description || '',
    verificationStatus: row.verificationStatus || 'verified'
  })
};

const Transactions = () => {
  const [analytics, setAnalytics] = useState({ loading: true, stats: [], charts: [], insight: null });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const transactions = await fetchCollectionData(staffApi.finance.transactions);
        if (!active) return;

        const totalIncome = transactions.filter((item) => item.transactionType === 'income').reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const totalExpenses = transactions.filter((item) => item.transactionType === 'expense').reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const pendingCount = transactions.filter((item) => item.verificationStatus === 'pending').length;
        const netBalance = totalIncome - totalExpenses;
        const monthlyFlow = groupAmountByMonth(transactions, 'transactionDate', 'amount');
        const typeMix = [
          { name: 'Income', value: Math.round(totalIncome) },
          { name: 'Expense', value: Math.round(totalExpenses) }
        ];

        setAnalytics({
          loading: false,
          stats: [
            { label: 'Total Transactions', value: transactions.length, helper: 'All recorded inflow and outflow entries', tone: 'blue', icon: FiActivity },
            { label: 'Total Income', value: formatCurrency(totalIncome), helper: 'Verified and pending income combined', tone: 'emerald', icon: FiTrendingUp },
            { label: 'Total Expenses', value: formatCurrency(totalExpenses), helper: 'Tracked outgoing cash movement', tone: 'rose', icon: FiTrendingDown },
            { label: 'Net Balance', value: formatCurrency(netBalance), helper: netBalance >= 0 ? 'Operating above expense level' : 'Expenses are ahead of income', tone: 'violet', icon: FiDollarSign },
            { label: 'Verification Queue', value: pendingCount, helper: 'Transactions waiting for review', tone: 'amber', icon: FiAlertCircle }
          ],
          charts: [
            { title: 'Income Vs Expense Mix', type: 'pie', data: typeMix },
            { title: 'Verification Status Breakdown', type: 'bar', data: groupCountByKey(transactions, 'verificationStatus') },
            { title: 'Monthly Transaction Volume', type: 'line', data: monthlyFlow }
          ],
          insight: {
            eyebrow: 'Reconciliation',
            title: 'Finance activity is summarized directly from transaction records',
            description: 'This view now surfaces schema-backed totals for income, expenses, monthly movement, and approval workload before the table so staff can act faster.'
          }
        });
      } catch (error) {
        if (!active) return;
        setAnalytics({
          loading: false,
          stats: [],
          charts: [],
          insight: {
            eyebrow: 'Analytics Unavailable',
            title: 'Transaction analytics could not be loaded',
            description: error.message || 'The transactions table is still available below.'
          }
        });
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
      title={transactionsConfig.title}
      subtitle={transactionsConfig.subtitle}
      endpoint={transactionsConfig.endpoint}
      columns={transactionsConfig.columns}
      createPath="/staff/finance/transactions/create"
      editPathForRow={(row) => `/staff/finance/transactions/edit/${row._id}`}
      viewPathForRow={(row) => `/staff/finance/transactions/view/${row._id}`}
      searchPlaceholder="Search transactions..."
      enableExport={true}
      headerContent={!analytics.loading ? <StaffAnalyticsContent stats={analytics.stats} charts={analytics.charts} insight={analytics.insight} /> : null}
    />
  );
};

export default Transactions;
