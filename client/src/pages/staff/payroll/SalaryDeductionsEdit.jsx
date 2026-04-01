import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { salaryDeductionsConfig } from './SalaryDeductions';

const SalaryDeductionsEdit = () => {
  const { id } = useParams();
  return (
    <FormPage
      titleCreate="Create Salary Deduction"
      titleEdit="Edit Salary Deduction"
      endpoint={salaryDeductionsConfig.endpoint}
      formFields={salaryDeductionsConfig.formFields}
      initialForm={salaryDeductionsConfig.initialForm}
      mapRowToForm={salaryDeductionsConfig.mapRowToForm}
      mapFormToPayload={salaryDeductionsConfig.mapFormToPayload}
      mode="edit"
      id={id}
      onSavedPath="/staff/payroll/salary-deductions"
    />
  );
};

export default SalaryDeductionsEdit;
