import React, { useEffect, useState } from 'react';
import { FiActivity, FiAlertCircle, FiDollarSign, FiTrendingDown, FiTrendingUp } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import ListPage from '../shared/ListPage';
import StaffAnalyticsContent, { fetchCollectionData, formatCurrency, groupAmountByMonth, groupCountByKey } from '../shared/StaffAnalyticsContent';
import { staffApi } from '../../../api/staffApi';

export const transactionsConfig = {
  title: 'finance.transactions.title',
  subtitle: 'finance.transactions.subtitle',
  endpoint: staffApi.finance.transactions,
  columns: [
    { key: 'transactionDate', header: 'finance.transactions.column.transactionDate', render: (value) => new Date(value).toISOString().slice(0, 10) },
    { key: 'transactionCode', header: 'finance.transactions.column.transactionCode' },
    { key: 'description', header: 'finance.transactions.column.description' },
    { key: 'transactionType', header: 'finance.transactions.column.transactionType' },
    { key: 'amount', header: 'finance.transactions.column.amount' },
    { key: 'verificationStatus', header: 'finance.transactions.column.verificationStatus' }
  ],
  formFields: [
    { name: 'transactionType', label: 'finance.transactions.formField.transactionType', type: 'select', options: [{ value: 'income', label: 'finance.transactions.formField.transactionType.income' }, { value: 'expense', label: 'finance.transactions.formField.transactionType.expense' }] },
    { name: 'account', label: 'finance.transactions.formField.account', type: 'relation', relationEndpoint: '/finance/accounts', relationLabel: (r) => `${r.accountName} (${r.accountCode})` },
    { name: 'amount', label: 'finance.transactions.formField.amount', type: 'number' },
    { name: 'transactionDate', label: 'finance.transactions.formField.transactionDate', type: 'date' },
    { name: 'referenceType', label: 'finance.transactions.formField.referenceType' },
    { name: 'description', label: 'finance.transactions.formField.description' },
    { name: 'verificationStatus', label: 'finance.transactions.formField.verificationStatus', type: 'select', options: [{ value: 'verified', label: 'finance.transactions.formField.verificationStatus.verified' }, { value: 'pending', label: 'finance.transactions.formField.verificationStatus.pending' }, { value: 'rejected', label: 'finance.transactions.formField.verificationStatus.rejected' }] },
    { name: 'accountCode', label: 'finance.transactions.formField.accountCode' }
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
          { name: t('finance.transactions.chart.income'), value: Math.round(totalIncome) },
          { name: t('finance.transactions.chart.expense'), value: Math.round(totalExpenses) }
        ];

        setAnalytics({
          loading: false,
          stats: [
            { label: t('finance.transactions.statTotalTransactions'), value: transactions.length, helper: t('finance.transactions.statTotalTransactionsHelper'), tone: 'blue', icon: FiActivity },
            { label: t('finance.transactions.statTotalIncome'), value: formatCurrency(totalIncome), helper: t('finance.transactions.statTotalIncomeHelper'), tone: 'emerald', icon: FiTrendingUp },
            { label: t('finance.transactions.statTotalExpenses'), value: formatCurrency(totalExpenses), helper: t('finance.transactions.statTotalExpensesHelper'), tone: 'rose', icon: FiTrendingDown },
            { label: t('finance.transactions.statNetBalance'), value: formatCurrency(netBalance), helper: netBalance >= 0 ? t('finance.transactions.statNetBalancePositive') : t('finance.transactions.statNetBalanceNegative'), tone: 'violet', icon: FiDollarSign },
            { label: t('finance.transactions.statVerificationQueue'), value: pendingCount, helper: t('finance.transactions.statVerificationQueueHelper'), tone: 'amber', icon: FiAlertCircle }
          ],
          charts: [
            { title: t('finance.transactions.chart.incomeVsExpenseMix'), type: 'pie', data: typeMix },
            { title: t('finance.transactions.chart.verificationStatusBreakdown'), type: 'bar', data: groupCountByKey(transactions, 'verificationStatus') },
            { title: t('finance.transactions.chart.monthlyTransactionVolume'), type: 'line', data: monthlyFlow }
          ],
          insight: {
            eyebrow: t('finance.transactions.insight.eyebrow'),
            title: t('finance.transactions.insight.title'),
            description: t('finance.transactions.insight.description')
          }
        });
      } catch (error) {
        if (!active) return;
        setAnalytics({
          loading: false,
          stats: [],
          charts: [],
          insight: {
            eyebrow: t('finance.transactions.insightEyebrowUnavailable'),
            title: t('finance.transactions.errorTitle'),
            description: error.message || t('finance.transactions.errorDescription')
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
      eyebrow={t('finance.eyebrow')}
      title={transactionsConfig.title}
      subtitle={transactionsConfig.subtitle}
      endpoint={transactionsConfig.endpoint}
      columns={transactionsConfig.columns}
      createPath="/staff/finance/transactions/create"
      editPathForRow={(row) => `/staff/finance/transactions/edit/${row._id}`}
      viewPathForRow={(row) => `/staff/finance/transactions/view/${row._id}`}
      searchPlaceholder={t('finance.transactions.searchPlaceholder')}
      enableExport={true}
      headerContent={!analytics.loading ? <StaffAnalyticsContent stats={analytics.stats} charts={analytics.charts} insight={analytics.insight} /> : null}
    />
  );
};

export default Transactions;
