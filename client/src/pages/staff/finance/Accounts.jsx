import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiDollarSign, FiPieChart, FiSlash, FiWallet } from 'react-icons/fi';
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
            { label: 'Total Accounts', value: accounts.length, helper: 'All finance accounts in the ledger', tone: 'blue', icon: FiWallet },
            { label: 'Active Accounts', value: activeCount, helper: 'Ready for transaction use', tone: 'emerald', icon: FiCheckCircle },
            { label: 'Inactive Accounts', value: inactiveCount, helper: 'Currently unavailable or retired', tone: 'rose', icon: FiSlash },
            { label: 'Total Balance', value: formatCurrency(totalBalance), helper: `Avg ${formatCurrency(averageBalance)} per account`, tone: 'violet', icon: FiDollarSign },
            { label: 'Account Types', value: groupCountByKey(accounts, 'accountType').length, helper: 'Cash and petty cash mix', tone: 'amber', icon: FiPieChart }
          ],
          charts: [
            { title: 'Account Type Distribution', type: 'pie', data: groupCountByKey(accounts, 'accountType') },
            { title: 'Account Status Distribution', type: 'bar', data: groupCountByKey(accounts, 'status') }
          ],
          insight: {
            eyebrow: 'Balance Coverage',
            title: 'Account monitoring now reflects the live schema',
            description: 'Balances, account states, and account types are summarized above the table so the staff panel matches the richer student-side dashboard experience.'
          }
        });
      } catch (error) {
        if (!active) return;
        setAnalytics({ loading: false, stats: [], charts: [], insight: { title: 'Account analytics could not be loaded', description: error.message || 'The account table is still available below.' } });
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
      title={accountsConfig.title}
      subtitle={accountsConfig.subtitle}
      endpoint={accountsConfig.endpoint}
      columns={accountsConfig.columns}
      createPath="/staff/finance/accounts/create"
      editPathForRow={(row) => `/staff/finance/accounts/edit/${row._id}`}
      viewPathForRow={(row) => `/staff/finance/accounts/view/${row._id}`}
      searchPlaceholder="Search accounts..."
      enableExport={true}
      headerContent={!analytics.loading ? <StaffAnalyticsContent stats={analytics.stats} charts={analytics.charts} insight={analytics.insight} /> : null}
    />
  );
};

export default Accounts;
