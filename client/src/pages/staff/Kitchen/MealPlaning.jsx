import React from 'react';
import ListPage from '../shared/ListPage';

export const budgetsConfig = {
  title: 'Kitchen Budgets',
  subtitle: 'Manage monthly kitchen budget plans with the unified planning interface.',
  endpoint: '/kitchen/budgets',
  columns: [
    { key: 'month', header: 'Month' },
    { key: 'year', header: 'Year' },
    { key: 'allocatedAmount', header: 'Allocated' },
    { key: 'approvedAmount', header: 'Approved' },
    { key: 'spentAmount', header: 'Spent' },
    { key: 'budgetStatus', header: 'Status' }
  ],
  formFields: [
    { name: 'month', label: 'Month', type: 'number' },
    { name: 'year', label: 'Year', type: 'number' },
    { name: 'allocatedAmount', label: 'Allocated Amount', type: 'number' },
    { name: 'approvedAmount', label: 'Approved Amount', type: 'number' },
    { name: 'spentAmount', label: 'Spent Amount', type: 'number' },
    { name: 'remainingAmount', label: 'Remaining Amount', type: 'number' },
    { name: 'budgetStatus', label: 'Budget Status', type: 'select', options: [
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' }
    ] }
  ],
  initialForm: { month: 1, year: new Date().getFullYear(), allocatedAmount: 0, approvedAmount: 0, spentAmount: 0, remainingAmount: 0, budgetStatus: 'pending' },
  mapFormToPayload: (form) => ({ ...form, month: Number(form.month || 1), year: Number(form.year || new Date().getFullYear()), allocatedAmount: Number(form.allocatedAmount || 0), approvedAmount: Number(form.approvedAmount || 0), spentAmount: Number(form.spentAmount || 0), remainingAmount: Number(form.remainingAmount || 0) })
};

const MealPlaning = () => <ListPage title={budgetsConfig.title} subtitle={budgetsConfig.subtitle} endpoint={budgetsConfig.endpoint} columns={budgetsConfig.columns} createPath="/staff/kitchen/meals/create" editPathForRow={(row) => `/staff/kitchen/meals/edit/${row._id}`} viewPathForRow={(row) => `/staff/kitchen/meals/view/${row._id}`} searchPlaceholder="Search budget plans..." clientSidePagination={true} deleteEnabled={false} />;

export default MealPlaning;
