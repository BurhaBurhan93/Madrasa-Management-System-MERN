import React from 'react';
import ListPage from '../shared/ListPage';

export const salaryDeductionsConfig = {
  title: 'Salary Deductions',
  subtitle: 'Manage salary deduction records',
  endpoint: '/payroll/salary-deductions',
  columns: [
    { key: 'employee', header: 'Employee ID' },
    { key: 'deductionType', header: 'Deduction Type' },
    { key: 'deductionAmount', header: 'Amount' },
    { key: 'deductionMonth', header: 'Month' },
    { key: 'deductionYear', header: 'Year' },
    { key: 'status', header: 'Status' }
  ],
  formFields: [
    { name: 'employee', label: 'Employee', type: 'relation', relationEndpoint: '/payroll/employees', relationLabel: (r) => `${r.fullName} (${r.employeeCode})` },
    { name: 'deductionType', label: 'Deduction Type' },
    { name: 'deductionReason', label: 'Deduction Reason' },
    { name: 'deductionAmount', label: 'Deduction Amount', type: 'number' },
    { name: 'deductionMonth', label: 'Deduction Month', type: 'number' },
    { name: 'deductionYear', label: 'Deduction Year', type: 'number' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' }
    ]}
  ],
  initialForm: {
    employee: '',
    deductionType: '',
    deductionReason: '',
    deductionAmount: 0,
    deductionMonth: 1,
    deductionYear: new Date().getFullYear(),
    status: 'pending'
  },
  mapFormToPayload: (form) => ({
    ...form,
    deductionAmount: Number(form.deductionAmount),
    deductionMonth: Number(form.deductionMonth),
    deductionYear: Number(form.deductionYear)
  })
};

const SalaryDeductions = () => (
  <ListPage
    title={salaryDeductionsConfig.title}
    subtitle={salaryDeductionsConfig.subtitle}
    endpoint={salaryDeductionsConfig.endpoint}
    columns={salaryDeductionsConfig.columns}
    createPath="/staff/payroll/salary-deductions/create"
    editPathForRow={(row) => `/staff/payroll/salary-deductions/edit/${row._id}`}
    searchPlaceholder="Search salary deductions..."
  />
);

export default SalaryDeductions;
