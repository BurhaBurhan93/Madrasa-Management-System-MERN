import React, { useEffect, useState } from 'react';
import { FiActivity, FiAlertCircle, FiDollarSign, FiTrendingDown, FiTrendingUp } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['staff', 'common']);
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
            { label: t('staff.finance.transactions.statTotalTransactions'), value: transactions.length, helper: t('staff.finance.transactions.statTotalTransactionsHelper'), tone: 'blue', icon: FiActivity },
            { label: t('staff.finance.transactions.statTotalIncome'), value: formatCurrency(totalIncome), helper: t('staff.finance.transactions.statTotalIncomeHelper'), tone: 'emerald', icon: FiTrendingUp },
            { label: t('staff.finance.transactions.statTotalExpenses'), value: formatCurrency(totalExpenses), helper: t('staff.finance.transactions.statTotalExpensesHelper'), tone: 'rose', icon: FiTrendingDown },
            { label: t('staff.finance.transactions.statNetBalance'), value: formatCurrency(netBalance), helper: netBalance >= 0 ? t('staff.finance.transactions.statNetBalancePositive') : t('staff.finance.transactions.statNetBalanceNegative'), tone: 'violet', icon: FiDollarSign },
            { label: t('staff.finance.transactions.statVerificationQueue'), value: pendingCount, helper: t('staff.finance.transactions.statVerificationQueueHelper'), tone: 'amber', icon: FiAlertCircle }
          ],
          charts: [
            { title: t('staff.finance.transactions.chartIncomeVsExpenseMix'), type: 'pie', data: typeMix },
            { title: t('staff.finance.transactions.chartVerificationStatusBreakdown'), type: 'bar', data: groupCountByKey(transactions, 'verificationStatus') },
            { title: t('staff.finance.transactions.chartMonthlyTransactionVolume'), type: 'line', data: monthlyFlow }
          ],
          insight: {
            eyebrow: t('staff.finance.transactions.insightEyebrow'),
            title: t('staff.finance.transactions.insightTitle'),
            description: t('staff.finance.transactions.insightDescription')
          }
        });
      } catch (error) {
        if (!active) return;
        setAnalytics({
          loading: false,
          stats: [],
          charts: [],
          insight: {
            eyebrow: t('staff.finance.transactions.insightEyebrowUnavailable'),
            title: t('staff.finance.transactions.errorTitle'),
            description: error.message || t('staff.finance.transactions.errorDescription')
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
      eyebrow={t('staff.finance.eyebrow')}
      title={transactionsConfig.title}
      subtitle={transactionsConfig.subtitle}
      endpoint={transactionsConfig.endpoint}
      columns={transactionsConfig.columns}
      createPath="/staff/finance/transactions/create"
      editPathForRow={(row) => `/staff/finance/transactions/edit/${row._id}`}
      viewPathForRow={(row) => `/staff/finance/transactions/view/${row._id}`}
      searchPlaceholder={t('staff.finance.transactions.searchPlaceholder')}
      enableExport={true}
      headerContent={!analytics.loading ? <StaffAnalyticsContent stats={analytics.stats} charts={analytics.charts} insight={analytics.insight} /> : null}
    />
  );
};

export default Transactions;
