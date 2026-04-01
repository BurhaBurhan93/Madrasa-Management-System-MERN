import React from 'react';
import ListPage from '../shared/ListPage';

export const expensesConfig = {
  title: 'Expenses',
  subtitle: 'Manage expense records',
  endpoint: '/finance/expenses',
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
    { name: 'paymentMethod', label: 'Payment Method', type: 'select', options: [
      { value: 'cash', label: 'Cash' },
      { value: 'card', label: 'Card' },
      { value: 'other', label: 'Other' }
    ]},
    { name: 'referenceNo', label: 'Reference No' },
    { name: 'paidTo', label: 'Paid To' },
    { name: 'approvalStatus', label: 'Approval Status', type: 'select', options: [
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' }
    ]},
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
  mapFormToPayload: (form) => ({
    ...form,
    amount: Number(form.amount)
  })
};

const Expenses = () => (
  <ListPage
    title={expensesConfig.title}
    subtitle={expensesConfig.subtitle}
    endpoint={expensesConfig.endpoint}
    columns={expensesConfig.columns}
    createPath="/staff/finance/expenses/create"
    editPathForRow={(row) => `/staff/finance/expenses/edit/${row._id}`}
    searchPlaceholder="Search expenses..."
  />
);

export default Expenses;
