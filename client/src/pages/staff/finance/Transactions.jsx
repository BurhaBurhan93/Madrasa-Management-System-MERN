import React from 'react';
import ListPage from '../shared/ListPage';
import Badge from '../../../components/UIHelper/Badge';

export const transactionsConfig = {
  title: 'Financial Transactions',
  subtitle: 'Manage income and expense transactions',
  endpoint: '/finance/transactions',
  columns: [
    { key: 'transactionDate', header: 'Date', render: (value) => new Date(value).toISOString().slice(0, 10) },
    { key: 'transactionCode', header: 'Code' },
    { key: 'description', header: 'Description' },
    { key: 'transactionType', header: 'Type', render: (value) => (
      <Badge variant={value === 'income' ? 'success' : 'danger'}>
        {value === 'income' ? 'Income' : 'Expense'}
      </Badge>
    ) },
    { key: 'amount', header: 'Amount' },
    { key: 'verificationStatus', header: 'Status' }
  ],
  formFields: [
    { name: 'transactionType', label: 'Transaction Type', type: 'select', options: [
      { value: 'income', label: 'Income' },
      { value: 'expense', label: 'Expense' }
    ]},
    { name: 'account', label: 'Account', type: 'relation', relationEndpoint: '/finance/accounts', relationLabel: (r) => `${r.accountName} (${r.accountCode})` },
    { name: 'amount', label: 'Amount', type: 'number' },
    { name: 'transactionDate', label: 'Transaction Date', type: 'date' },
    { name: 'referenceType', label: 'Reference Type' },
    { name: 'description', label: 'Description' },
    { name: 'verificationStatus', label: 'Verification Status', type: 'select', options: [
      { value: 'verified', label: 'Verified' },
      { value: 'pending', label: 'Pending' },
      { value: 'rejected', label: 'Rejected' }
    ]},
    { name: 'accountCode', label: 'Account Code' }
  ],
  initialForm: {
    transactionType: 'income',
    account: '',
    amount: 0,
    transactionDate: '',
    referenceType: '',
    description: '',
    verificationStatus: 'verified',
  },
  mapFormToPayload: (form) => ({
    ...form,
    amount: Number(form.amount)
  }),
  mapRowToForm: (row) => ({
    transactionType: row.transactionType || 'income',
    account: row.account?._id || row.account || '',
    amount: row.amount ?? 0,
    transactionDate: row.transactionDate ? new Date(row.transactionDate).toISOString().slice(0, 10) : '',
    referenceType: row.referenceType || '',
    description: row.description || '',
    verificationStatus: row.verificationStatus || 'verified',
  })
};

const Transactions = () => (
  <ListPage
    title={transactionsConfig.title}
    subtitle={transactionsConfig.subtitle}
    endpoint={transactionsConfig.endpoint}
    columns={transactionsConfig.columns}
    createPath="/staff/finance/transactions/create"
    editPathForRow={(row) => `/staff/finance/transactions/edit/${row._id}`}
    viewPathForRow={(row) => '/staff/finance/transactions/view/' + row._id}
    searchPlaceholder="Search transactions..."
  />
);

export default Transactions;

