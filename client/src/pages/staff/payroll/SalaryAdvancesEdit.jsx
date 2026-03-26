import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { salaryAdvancesConfig } from './SalaryAdvances';

const SalaryAdvancesEdit = () => {
  const { id } = useParams();
  return (
    <FormPage
      titleCreate="Create Salary Advance"
      titleEdit="Edit Salary Advance"
      endpoint={salaryAdvancesConfig.endpoint}
      formFields={salaryAdvancesConfig.formFields}
      initialForm={salaryAdvancesConfig.initialForm}
      mapRowToForm={salaryAdvancesConfig.mapRowToForm}
      mapFormToPayload={salaryAdvancesConfig.mapFormToPayload}
      mode="edit"
      id={id}
      onSavedPath="/staff/payroll/salary-advances"
    />
  );
};

export default SalaryAdvancesEdit;
