import React from 'react';
import ListPage from '../shared/ListPage';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const budgetsConfig = {
  title: 'Budget Requests',
  subtitle: 'Manage monthly kitchen budget requests and approvals.',
  endpoint: '/kitchen/budgets',
  columns: [
    { key: 'month', header: 'Month', render: (v) => MONTH_NAMES[(v || 1) - 1] || v },
    { key: 'year',  header: 'Year' },
    { key: 'allocatedAmount', header: 'Allocated (AFN)', render: (v) => Number(v || 0).toLocaleString() },
    { key: 'approvedAmount',  header: 'Approved (AFN)',  render: (v) => Number(v || 0).toLocaleString() },
    { key: 'spentAmount',     header: 'Spent (AFN)',     render: (v) => Number(v || 0).toLocaleString() },
    { key: 'remainingAmount', header: 'Remaining (AFN)', render: (v) => Number(v || 0).toLocaleString() },
    { key: 'budgetStatus',    header: 'Status' },
  ],
  formFields: [
    { name: 'month', label: 'Month', type: 'select', options: MONTH_NAMES.map((m, i) => ({ value: String(i + 1), label: m })) },
    { name: 'year',  label: 'Year',  type: 'number' },
    { name: 'allocatedAmount', label: 'Allocated Amount (AFN)', type: 'number' },
    { name: 'approvedAmount',  label: 'Approved Amount (AFN)',  type: 'number' },
    { name: 'spentAmount',     label: 'Spent Amount (AFN)',     type: 'number' },
    { name: 'remainingAmount', label: 'Remaining Amount (AFN)', type: 'number' },
    { name: 'budgetStatus', label: 'Budget Status', type: 'select', options: [
      { value: 'pending',  label: 'Pending'  },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
    ]},
  ],
  initialForm: {
    month: String(new Date().getMonth() + 1),
    year: new Date().getFullYear(),
    allocatedAmount: 0,
    approvedAmount: 0,
    spentAmount: 0,
    remainingAmount: 0,
    budgetStatus: 'pending',
  },
  mapRowToForm: (row) => ({
    month: String(row.month || 1),
    year: row.year || new Date().getFullYear(),
    allocatedAmount: row.allocatedAmount || 0,
    approvedAmount:  row.approvedAmount  || 0,
    spentAmount:     row.spentAmount     || 0,
    remainingAmount: row.remainingAmount || 0,
    budgetStatus:    row.budgetStatus    || 'pending',
  }),
  mapFormToPayload: (form) => ({
    month:           Number(form.month           || 1),
    year:            Number(form.year            || new Date().getFullYear()),
    allocatedAmount: Number(form.allocatedAmount || 0),
    approvedAmount:  Number(form.approvedAmount  || 0),
    spentAmount:     Number(form.spentAmount     || 0),
    remainingAmount: Number(form.remainingAmount || 0),
    budgetStatus:    form.budgetStatus || 'pending',
  }),
};

const MealPlaning = () => (
  <ListPage
    title={budgetsConfig.title}
    subtitle={budgetsConfig.subtitle}
    endpoint={budgetsConfig.endpoint}
    columns={budgetsConfig.columns}
    createPath="/staff/kitchen/meals/create"
    editPathForRow={(row) => `/staff/kitchen/meals/edit/${row._id}`}
    viewPathForRow={(row) => `/staff/kitchen/meals/view/${row._id}`}
    searchPlaceholder="Search budget requests..."
    clientSidePagination={true}
  />
);

export default MealPlaning;
