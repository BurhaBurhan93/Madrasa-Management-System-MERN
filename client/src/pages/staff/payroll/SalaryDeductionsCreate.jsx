import React from 'react';
import FormPage from '../shared/FormPage';
import { salaryDeductionsConfig } from './SalaryDeductions';

const SalaryDeductionsCreate = () => (
  <FormPage
    titleCreate="Create Salary Deduction"
    titleEdit="Edit Salary Deduction"
    endpoint={salaryDeductionsConfig.endpoint}
    formFields={salaryDeductionsConfig.formFields}
    initialForm={salaryDeductionsConfig.initialForm}
    mapRowToForm={salaryDeductionsConfig.mapRowToForm}
    mapFormToPayload={salaryDeductionsConfig.mapFormToPayload}
    mode="create"
    onSavedPath="/staff/payroll/salary-deductions"
  />
);

export default SalaryDeductionsCreate;
