import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiCreditCard, FiDollarSign, FiPieChart, FiSlash } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import ListPage from '../shared/ListPage';
import StaffAnalyticsContent, { fetchCollectionData, formatCurrency, groupCountByKey } from '../shared/StaffAnalyticsContent';
import { staffApi } from '../../../api/staffApi';

export const accountsConfig = {
  title: 'Financial Accounts',
  subtitle: 'Manage account balances, status, and account-type distribution.',
  endpoint: staffApi.finance.accounts,
  columns: [
    { key: 'accountCode', header: 'Account Code' },
    { key: 'accountName', header: 'Account Name' },
    { key: 'accountType', header: 'Type' },
    { key: 'openingBalance', header: 'Opening Balance' },
    { key: 'currentBalance', header: 'Current Balance' },
    { key: 'currency', header: 'Currency' },
    { key: 'status', header: 'Status' }
  ],
  formFields: [
    { name: 'accountCode', label: 'Account Code' },
    { name: 'accountName', label: 'Account Name' },
    { name: 'accountType', label: 'Account Type', type: 'select', options: [{ value: 'cash', label: 'Cash' }, { value: 'petty_cash', label: 'Petty Cash' }] },
    { name: 'openingBalance', label: 'Opening Balance', type: 'number' },
    { name: 'currentBalance', label: 'Current Balance', type: 'number' },
    { name: 'currency', label: 'Currency' },
    { name: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] }
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
            { label: t('staff.finance.accounts.statTotalAccounts'), value: accounts.length, helper: t('staff.finance.accounts.statTotalAccountsHelper'), tone: 'blue', icon: FiCreditCard },
            { label: t('staff.finance.accounts.statActiveAccounts'), value: activeCount, helper: t('staff.finance.accounts.statActiveAccountsHelper'), tone: 'emerald', icon: FiCheckCircle },
            { label: t('staff.finance.accounts.statInactiveAccounts'), value: inactiveCount, helper: t('staff.finance.accounts.statInactiveAccountsHelper'), tone: 'rose', icon: FiSlash },
            { label: t('staff.finance.accounts.statTotalBalance'), value: formatCurrency(totalBalance), helper: t('staff.finance.accounts.statTotalBalanceHelper', { avg: formatCurrency(averageBalance) }), tone: 'violet', icon: FiDollarSign },
            { label: t('staff.finance.accounts.statAccountTypes'), value: groupCountByKey(accounts, 'accountType').length, helper: t('staff.finance.accounts.statAccountTypesHelper'), tone: 'amber', icon: FiPieChart }
          ],
          charts: [
            { title: t('staff.finance.accounts.chartAccountTypeDistribution'), type: 'pie', data: groupCountByKey(accounts, 'accountType') },
            { title: t('staff.finance.accounts.chartAccountStatusDistribution'), type: 'bar', data: groupCountByKey(accounts, 'status') }
          ],
          insight: {
            eyebrow: t('staff.finance.accounts.insightEyebrow'),
            title: t('staff.finance.accounts.insightTitle'),
            description: t('staff.finance.accounts.insightDescription')
          }
        });
      } catch (error) {
        if (!active) return;
        setAnalytics({ loading: false, stats: [], charts: [], insight: { title: t('staff.finance.accounts.errorTitle'), description: error.message || t('staff.finance.accounts.errorDescription') } });
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
      title={accountsConfig.title}
      subtitle={accountsConfig.subtitle}
      endpoint={accountsConfig.endpoint}
      columns={accountsConfig.columns}
      createPath="/staff/finance/accounts/create"
      editPathForRow={(row) => `/staff/finance/accounts/edit/${row._id}`}
      viewPathForRow={(row) => `/staff/finance/accounts/view/${row._id}`}
      searchPlaceholder={t('staff.finance.accounts.searchPlaceholder')}
      enableExport={true}
      headerContent={!analytics.loading ? <StaffAnalyticsContent stats={analytics.stats} charts={analytics.charts} insight={analytics.insight} /> : null}
    />
  );
};

export default Accounts;
