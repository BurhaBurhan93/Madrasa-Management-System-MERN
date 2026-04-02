import React from 'react';
import ListPage from '../shared/ListPage';

export const salaryStructuresConfig = {
  title: 'Salary Structures',
  subtitle: 'Define salary structures by employee type',
  endpoint: '/payroll/salary-structures',
  columns: [
    { key: 'employeeType', header: 'Employee Type' },
    { key: 'basicSalary', header: 'Basic Salary' },
    { key: 'allowanceAmount', header: 'Allowance' },
    { key: 'overtimeRate', header: 'Overtime Rate' },
    { key: 'taxPercentage', header: 'Tax %' },
    { key: 'status', header: 'Status' }
  ],
  formFields: [
    { name: 'employeeType', label: 'Employee Type', type: 'select', options: [
      { value: 'teacher', label: 'Teacher' },
      { value: 'staff', label: 'Staff' },
      { value: 'admin', label: 'Admin' },
      { value: 'support', label: 'Support' }
    ]},
    { name: 'basicSalary', label: 'Basic Salary', type: 'number' },
    { name: 'allowanceAmount', label: 'Allowance Amount', type: 'number' },
    { name: 'housingAllowance', label: 'Housing Allowance', type: 'number' },
    { name: 'foodAllowance', label: 'Food Allowance', type: 'number' },
    { name: 'transportAllowance', label: 'Transport Allowance', type: 'number' },
    { name: 'overtimeRate', label: 'Overtime Rate', type: 'number' },
    { name: 'deductionType', label: 'Deduction Type' },
    { name: 'taxPercentage', label: 'Tax Percentage', type: 'number' },
    { name: 'effectiveFrom', label: 'Effective From', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]}
  ],
  initialForm: {
    employeeType: 'teacher',
    basicSalary: 0,
    allowanceAmount: 0,
    housingAllowance: 0,
    foodAllowance: 0,
    transportAllowance: 0,
    overtimeRate: 0,
    deductionType: '',
    taxPercentage: 0,
    effectiveFrom: '',
    status: 'active'
  },
  mapFormToPayload: (form) => ({
    ...form,
    basicSalary: Number(form.basicSalary),
    allowanceAmount: Number(form.allowanceAmount),
    housingAllowance: Number(form.housingAllowance),
    foodAllowance: Number(form.foodAllowance),
    transportAllowance: Number(form.transportAllowance),
    overtimeRate: Number(form.overtimeRate),
    taxPercentage: Number(form.taxPercentage)
  })
};

const SalaryStructures = () => (
  <ListPage
    title={salaryStructuresConfig.title}
    subtitle={salaryStructuresConfig.subtitle}
    endpoint={salaryStructuresConfig.endpoint}
    columns={salaryStructuresConfig.columns}
    createPath="/staff/payroll/salary-structures/create"
    editPathForRow={(row) => `/staff/payroll/salary-structures/edit/${row._id}`}
    viewPathForRow={(row) => '/staff/payroll/salary-structures/view/' + row._id}
    searchPlaceholder="Search salary structures..."
  />
);

export default SalaryStructures;

