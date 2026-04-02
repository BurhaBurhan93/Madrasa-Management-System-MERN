import React from 'react';
import ListPage from '../shared/ListPage';

export const salaryPaymentsConfig = {
  title: 'Salary Payments',
  subtitle: 'Manage salary payment records',
  endpoint: '/payroll/salary-payments',
  columns: [
    { key: 'employee', header: 'Employee ID' },
    { key: 'salaryMonth', header: 'Month' },
    { key: 'salaryYear', header: 'Year' },
    { key: 'grossSalary', header: 'Gross Salary' },
    { key: 'netSalary', header: 'Net Salary' },
    { key: 'paymentStatus', header: 'Status' }
  ],
  formFields: [
    { name: 'employee', label: 'Employee', type: 'relation', relationEndpoint: '/payroll/employees', relationLabel: (r) => `${r.fullName} (${r.employeeCode})` },
    { name: 'salaryMonth', label: 'Salary Month', type: 'number' },
    { name: 'salaryYear', label: 'Salary Year', type: 'number' },
    { name: 'grossSalary', label: 'Gross Salary', type: 'number' },
    { name: 'totalAllowance', label: 'Total Allowance', type: 'number' },
    { name: 'totalDeduction', label: 'Total Deduction', type: 'number' },
    { name: 'netSalary', label: 'Net Salary', type: 'number' },
    { name: 'paymentDate', label: 'Payment Date', type: 'date' },
    { name: 'paymentMethod', label: 'Payment Method', type: 'select', options: [
      { value: 'cash', label: 'Cash' },
      { value: 'bank', label: 'Bank' },
      { value: 'card', label: 'Card' },
      { value: 'other', label: 'Other' }
    ]},
    { name: 'transactionReference', label: 'Transaction Reference' },
    { name: 'paymentStatus', label: 'Payment Status', type: 'select', options: [
      { value: 'pending', label: 'Pending' },
      { value: 'paid', label: 'Paid' },
      { value: 'failed', label: 'Failed' }
    ]}
  ],
  initialForm: {
    employee: '',
    salaryMonth: 1,
    salaryYear: new Date().getFullYear(),
    grossSalary: 0,
    totalAllowance: 0,
    totalDeduction: 0,
    netSalary: 0,
    paymentDate: '',
    paymentMethod: 'cash',
    transactionReference: '',
    paymentStatus: 'paid'
  },
  mapFormToPayload: (form) => ({
    ...form,
    salaryMonth: Number(form.salaryMonth),
    salaryYear: Number(form.salaryYear),
    grossSalary: Number(form.grossSalary),
    totalAllowance: Number(form.totalAllowance),
    totalDeduction: Number(form.totalDeduction),
    netSalary: Number(form.netSalary)
  })
};

const SalaryPayments = () => (
  <ListPage
    title={salaryPaymentsConfig.title}
    subtitle={salaryPaymentsConfig.subtitle}
    endpoint={salaryPaymentsConfig.endpoint}
    columns={salaryPaymentsConfig.columns}
    createPath="/staff/payroll/salary-payments/create"
    editPathForRow={(row) => `/staff/payroll/salary-payments/edit/${row._id}`}
    viewPathForRow={(row) => '/staff/payroll/salary-payments/view/' + row._id}
    searchPlaceholder="Search salary payments..."
  />
);

export default SalaryPayments;

