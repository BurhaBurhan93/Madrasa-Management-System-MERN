import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiCreditCard, FiDollarSign, FiPieChart, FiSlash } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import ListPage from '../shared/ListPage';
import StaffAnalyticsContent, { fetchCollectionData, formatCurrency, groupCountByKey } from '../shared/StaffAnalyticsContent';
import { staffApi } from '../../../api/staffApi';

export const accountsConfig = {
  title: 'finance.accounts.title',
  subtitle: 'finance.accounts.subtitle',
  endpoint: staffApi.finance.accounts,
  columns: [
    { key: 'accountCode', header: 'finance.accounts.column.accountCode' },
    { key: 'accountName', header: 'finance.accounts.column.accountName' },
    { key: 'accountType', header: 'finance.accounts.column.accountType' },
    { key: 'openingBalance', header: 'finance.accounts.column.openingBalance' },
    { key: 'currentBalance', header: 'finance.accounts.column.currentBalance' },
    { key: 'currency', header: 'finance.accounts.column.currency' },
    { key: 'status', header: 'finance.accounts.column.status' }
  ],
  formFields: [
    { name: 'accountCode', label: 'finance.accounts.formField.accountCode' },
    { name: 'accountName', label: 'finance.accounts.formField.accountName' },
    { name: 'accountType', label: 'finance.accounts.formField.accountType', type: 'select', options: [{ value: 'cash', label: 'finance.accounts.formField.accountType.cash' }, { value: 'petty_cash', label: 'finance.accounts.formField.accountType.petty_cash' }] },
    { name: 'openingBalance', label: 'finance.accounts.formField.openingBalance', type: 'number' },
    { name: 'currentBalance', label: 'finance.accounts.formField.currentBalance', type: 'number' },
    { name: 'currency', label: 'finance.accounts.formField.currency' },
    { name: 'status', label: 'finance.accounts.formField.status', type: 'select', options: [{ value: 'active', label: 'finance.accounts.formField.status.active' }, { value: 'inactive', label: 'finance.accounts.formField.status.inactive' }] }
  ],
  initialForm: {
    accountCode: '',
    accountName: '',
    accountType: 'cash',
    openingBalance: 0,
    currentBalance: 0,
    currency: 'USD',
    status: 'active'
  },
  mapFormToPayload: (form) => ({ ...form, openingBalance: Number(form.openingBalance), currentBalance: Number(form.currentBalance) })
};

const Accounts = () => {
  const { t } = useTranslation(['staff', 'common']);
  const [analytics, setAnalytics] = useState({ loading: true, stats: [], charts: [], insight: null });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const accounts = await fetchCollectionData(staffApi.finance.accounts);
        if (!active) return;

        const activeCount = accounts.filter((item) => item.status === 'active').length;
        const inactiveCount = accounts.filter((item) => item.status === 'inactive').length;
        const totalBalance = accounts.reduce((sum, item) => sum + Number(item.currentBalance || 0), 0);
        const averageBalance = accounts.length ? totalBalance / accounts.length : 0;

        setAnalytics({
          loading: false,
          stats: [
            { label: t('finance.accounts.statTotalAccounts'), value: accounts.length, helper: t('finance.accounts.statTotalAccountsHelper'), tone: 'blue', icon: FiCreditCard },
            { label: t('finance.accounts.statActiveAccounts'), value: activeCount, helper: t('finance.accounts.statActiveAccountsHelper'), tone: 'emerald', icon: FiCheckCircle },
            { label: t('finance.accounts.statInactiveAccounts'), value: inactiveCount, helper: t('finance.accounts.statInactiveAccountsHelper'), tone: 'rose', icon: FiSlash },
            { label: t('finance.accounts.statTotalBalance'), value: formatCurrency(totalBalance), helper: t('finance.accounts.statTotalBalanceHelper', { avg: formatCurrency(averageBalance) }), tone: 'violet', icon: FiDollarSign },
            { label: t('finance.accounts.statAccountTypes'), value: groupCountByKey(accounts, 'accountType').length, helper: t('finance.accounts.statAccountTypesHelper'), tone: 'amber', icon: FiPieChart }
          ],
          charts: [
            { title: t('finance.accounts.chart.accountTypeDistribution'), type: 'pie', data: groupCountByKey(accounts, 'accountType') },
            { title: t('finance.accounts.chart.accountStatusDistribution'), type: 'bar', data: groupCountByKey(accounts, 'status') }
          ],
          insight: {
            eyebrow: t('finance.accounts.insight.eyebrow'),
            title: t('finance.accounts.insight.title'),
            description: t('finance.accounts.insight.description')
          }
        });
      } catch (error) {
        if (!active) return;
        setAnalytics({ loading: false, stats: [], charts: [], insight: { title: t('finance.accounts.errorTitle'), description: error.message || t('finance.accounts.errorDescription') } });
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
      title={accountsConfig.title}
      subtitle={accountsConfig.subtitle}
      endpoint={accountsConfig.endpoint}
      columns={accountsConfig.columns}
      createPath="/staff/finance/accounts/create"
      editPathForRow={(row) => `/staff/finance/accounts/edit/${row._id}`}
      viewPathForRow={(row) => `/staff/finance/accounts/view/${row._id}`}
      searchPlaceholder={t('finance.accounts.searchPlaceholder')}
      enableExport={true}
      headerContent={!analytics.loading ? <StaffAnalyticsContent stats={analytics.stats} charts={analytics.charts} insight={analytics.insight} /> : null}
    />
  );
};

export default Accounts;
