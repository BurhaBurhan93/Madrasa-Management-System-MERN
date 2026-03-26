import React from 'react';
import ListPage from '../shared/ListPage';

export const accountsConfig = {
  title: 'Financial Accounts',
  subtitle: 'Manage financial account records',
  endpoint: '/finance/accounts',
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
    { name: 'accountType', label: 'Account Type', type: 'select', options: [
      { value: 'cash', label: 'Cash' },
      { value: 'petty_cash', label: 'Petty Cash' }
    ]},
    { name: 'openingBalance', label: 'Opening Balance', type: 'number' },
    { name: 'currentBalance', label: 'Current Balance', type: 'number' },
    { name: 'currency', label: 'Currency' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]}
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
  mapFormToPayload: (form) => ({
    ...form,
    openingBalance: Number(form.openingBalance),
    currentBalance: Number(form.currentBalance)
  })
};

const Accounts = () => (
  <ListPage
    title={accountsConfig.title}
    subtitle={accountsConfig.subtitle}
    endpoint={accountsConfig.endpoint}
    columns={accountsConfig.columns}
    createPath="/staff/finance/accounts/create"
    editPathForRow={(row) => `/staff/finance/accounts/edit/${row._id}`}
    searchPlaceholder="Search accounts..."
  />
);

export default Accounts;
