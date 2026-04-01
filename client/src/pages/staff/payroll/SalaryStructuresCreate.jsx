import React from 'react';
import FormPage from '../shared/FormPage';
import { salaryStructuresConfig } from './SalaryStructures';

const SalaryStructuresCreate = () => (
  <FormPage
    titleCreate="Create Salary Structure"
    titleEdit="Edit Salary Structure"
    endpoint={salaryStructuresConfig.endpoint}
    formFields={salaryStructuresConfig.formFields}
    initialForm={salaryStructuresConfig.initialForm}
    mapRowToForm={salaryStructuresConfig.mapRowToForm}
    mapFormToPayload={salaryStructuresConfig.mapFormToPayload}
    mode="create"
    onSavedPath="/staff/payroll/salary-structures"
  />
);

export default SalaryStructuresCreate;
