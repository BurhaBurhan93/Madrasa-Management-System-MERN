import React from 'react';
import { useTranslation } from 'react-i18next';
import ListPage from '../shared/ListPage';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const getBudgetsConfig = (t) => ({
  title: t('staff.kitchen.mealPlaning.title', 'Budget Requests'),
  subtitle: t('staff.kitchen.mealPlaning.subtitle', 'Manage monthly kitchen budget requests and approvals.'),
  endpoint: '/kitchen/budgets',
  columns: [
    { key: 'month', header: t('common.month', 'Month'), render: (v) => MONTH_NAMES[(v || 1) - 1] || v },
    { key: 'year',  header: t('common.year', 'Year') },
    { key: 'allocatedAmount', header: t('staff.kitchen.mealPlaning.allocated', 'Allocated (AFN)'), render: (v) => Number(v || 0).toLocaleString() },
    { key: 'approvedAmount',  header: t('staff.kitchen.mealPlaning.approved', 'Approved (AFN)'),  render: (v) => Number(v || 0).toLocaleString() },
    { key: 'spentAmount',     header: t('staff.kitchen.mealPlaning.spent', 'Spent (AFN)'),     render: (v) => Number(v || 0).toLocaleString() },
    { key: 'remainingAmount', header: t('staff.kitchen.mealPlaning.remaining', 'Remaining (AFN)'), render: (v) => Number(v || 0).toLocaleString() },
    { key: 'budgetStatus',    header: t('common.status', 'Status') },
  ],
  formFields: [
    { name: 'month', label: t('common.month', 'Month'), type: 'select', options: MONTH_NAMES.map((m, i) => ({ value: String(i + 1), label: m })) },
    { name: 'year',  label: t('common.year', 'Year'),  type: 'number' },
    { name: 'allocatedAmount', label: t('staff.kitchen.mealPlaning.allocatedAmount', 'Allocated Amount (AFN)'), type: 'number' },
    { name: 'approvedAmount',  label: t('staff.kitchen.mealPlaning.approvedAmount', 'Approved Amount (AFN)'),  type: 'number' },
    { name: 'spentAmount',     label: t('staff.kitchen.mealPlaning.spentAmount', 'Spent Amount (AFN)'),     type: 'number' },
    { name: 'remainingAmount', label: t('staff.kitchen.mealPlaning.remainingAmount', 'Remaining Amount (AFN)'), type: 'number' },
    { name: 'budgetStatus', label: t('staff.kitchen.mealPlaning.budgetStatus', 'Budget Status'), type: 'select', options: [
      { value: 'pending',  label: t('common.pending', 'Pending')  },
      { value: 'approved', label: t('common.approved', 'Approved') },
      { value: 'rejected', label: t('common.rejected', 'Rejected') },
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
});

const MealPlaning = () => {
  const { t } = useTranslation(['staff', 'common']);
  const config = getBudgetsConfig(t);
  return (
    <ListPage
      title={config.title}
      subtitle={config.subtitle}
      endpoint={config.endpoint}
      columns={config.columns}
      createPath="/staff/kitchen/meals/create"
      editPathForRow={(row) => `/staff/kitchen/meals/edit/${row._id}`}
      viewPathForRow={(row) => `/staff/kitchen/meals/view/${row._id}`}
      searchPlaceholder={t('staff.kitchen.mealPlaning.searchPlaceholder', 'Search budget requests...')}
      clientSidePagination={true}
    />
  );
};

export default MealPlaning;
