import React from 'react';
import FormPage from '../shared/FormPage';
import { salaryPaymentsConfig } from './SalaryPayments';

const SalaryPaymentsCreate = () => (
  <FormPage
    titleCreate="Create Salary Payment"
    titleEdit="Edit Salary Payment"
    endpoint={salaryPaymentsConfig.endpoint}
    formFields={salaryPaymentsConfig.formFields}
    initialForm={salaryPaymentsConfig.initialForm}
    mapRowToForm={salaryPaymentsConfig.mapRowToForm}
    mapFormToPayload={salaryPaymentsConfig.mapFormToPayload}
    mode="create"
    onSavedPath="/staff/payroll/salary-payments"
  />
);

export default SalaryPaymentsCreate;
