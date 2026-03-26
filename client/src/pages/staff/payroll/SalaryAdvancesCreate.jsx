import React from 'react';
import FormPage from '../shared/FormPage';
import { salaryAdvancesConfig } from './SalaryAdvances';

const SalaryAdvancesCreate = () => (
  <FormPage
    titleCreate="Create Salary Advance"
    titleEdit="Edit Salary Advance"
    endpoint={salaryAdvancesConfig.endpoint}
    formFields={salaryAdvancesConfig.formFields}
    initialForm={salaryAdvancesConfig.initialForm}
    mapRowToForm={salaryAdvancesConfig.mapRowToForm}
    mapFormToPayload={salaryAdvancesConfig.mapFormToPayload}
    mode="create"
    onSavedPath="/staff/payroll/salary-advances"
  />
);

export default SalaryAdvancesCreate;
