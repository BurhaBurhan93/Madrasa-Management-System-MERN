import React from 'react';
import { useTranslation } from 'react-i18next';
import ListPage from '../shared/ListPage';

export const salaryAdvancesConfig = {
  title: 'Salary Advances',
  subtitle: 'Manage salary advance requests',
  endpoint: '/payroll/salary-advances',
  columns: [
    { key: 'employee', header: 'Employee ID' },
    { key: 'advanceAmount', header: 'Advance Amount' },
    { key: 'requestDate', header: 'Request Date' },
    { key: 'approvalDate', header: 'Approval Date' },
    { key: 'remainingBalance', header: 'Remaining Balance' },
    { key: 'advanceStatus', header: 'Status' }
  ],
  formFields: [
    { name: 'employee', label: 'Employee', type: 'relation', relationEndpoint: '/payroll/employees', relationLabel: (r) => `${r.fullName} (${r.employeeCode})` },
    { name: 'advanceAmount', label: 'Advance Amount', type: 'number' },
    { name: 'requestDate', label: 'Request Date', type: 'date' },
    { name: 'approvalDate', label: 'Approval Date', type: 'date' },
    { name: 'repaymentStartMonth', label: 'Repayment Start Month', type: 'number' },
    { name: 'monthlyDeductionAmount', label: 'Monthly Deduction Amount', type: 'number' },
    { name: 'remainingBalance', label: 'Remaining Balance', type: 'number' },
    { name: 'advanceStatus', label: 'Status', type: 'select', options: [
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
      { value: 'closed', label: 'Closed' }
    ]}
  ],
  initialForm: {
    employee: '',
    advanceAmount: 0,
    requestDate: '',
    approvalDate: '',
    repaymentStartMonth: 1,
    monthlyDeductionAmount: 0,
    remainingBalance: 0,
    advanceStatus: 'pending'
  },
  mapFormToPayload: (form) => ({
    ...form,
    advanceAmount: Number(form.advanceAmount),
    repaymentStartMonth: Number(form.repaymentStartMonth),
    monthlyDeductionAmount: Number(form.monthlyDeductionAmount),
    remainingBalance: Number(form.remainingBalance)
  })
};

const SalaryAdvances = () => {
  const { t } = useTranslation(['staff', 'common']);
  const columns = salaryAdvancesConfig.columns.map(col => ({
    ...col,
    header: t(`staff.payroll.salaryAdvances.columns.${col.key}`)
  }));
  return (
    <ListPage
      title={t('staff.payroll.salaryAdvances.title')}
      subtitle={t('staff.payroll.salaryAdvances.subtitle')}
      endpoint={salaryAdvancesConfig.endpoint}
      columns={columns}
      createPath="/staff/payroll/salary-advances/create"
      editPathForRow={(row) => `/staff/payroll/salary-advances/edit/${row._id}`}
      viewPathForRow={(row) => '/staff/payroll/salary-advances/view/' + row._id}
      searchPlaceholder={t('staff.payroll.salaryAdvances.searchPlaceholder')}
    />
  );
};

export default SalaryAdvances;
