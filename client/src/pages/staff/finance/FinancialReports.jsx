import React from 'react';
import ListPage from '../shared/ListPage';

export const financialReportsConfig = {
  title: 'Financial Reports',
  subtitle: 'Manage financial report records',
  endpoint: '/finance/reports',
  columns: [
    { key: 'reportType', header: 'Report Type' },
    { key: 'reportPeriod', header: 'Report Period' },
    { key: 'totalIncome', header: 'Total Income' },
    { key: 'totalExpense', header: 'Total Expense' },
    { key: 'netBalance', header: 'Net Balance' },
    { key: 'approvalStatus', header: 'Approval Status' }
  ],
  formFields: [
    { name: 'reportType', label: 'Report Type' },
    { name: 'reportPeriod', label: 'Report Period' },
    { name: 'totalIncome', label: 'Total Income', type: 'number' },
    { name: 'totalExpense', label: 'Total Expense', type: 'number' },
    { name: 'netBalance', label: 'Net Balance', type: 'number' },
    { name: 'generatedAt', label: 'Generated At', type: 'date' },
    { name: 'approvalStatus', label: 'Approval Status', type: 'select', options: [
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' }
    ]},
    { name: 'remarks', label: 'Remarks' }
  ],
  initialForm: {
    reportType: '',
    reportPeriod: '',
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    generatedAt: '',
    approvalStatus: 'pending',
    remarks: ''
  },
  mapFormToPayload: (form) => ({
    ...form,
    totalIncome: Number(form.totalIncome),
    totalExpense: Number(form.totalExpense),
    netBalance: Number(form.netBalance)
  })
};

const FinancialReports = () => (
  <ListPage
    title={financialReportsConfig.title}
    subtitle={financialReportsConfig.subtitle}
    endpoint={financialReportsConfig.endpoint}
    columns={financialReportsConfig.columns}
    createPath="/staff/finance/reports/create"
    editPathForRow={(row) => `/staff/finance/reports/edit/${row._id}`}
    searchPlaceholder="Search reports..."
  />
);

export default FinancialReports;
