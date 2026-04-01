import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { salaryPaymentsConfig } from './SalaryPayments';

const SalaryPaymentsEdit = () => {
  const { id } = useParams();
  return (
    <FormPage
      titleCreate="Create Salary Payment"
      titleEdit="Edit Salary Payment"
      endpoint={salaryPaymentsConfig.endpoint}
      formFields={salaryPaymentsConfig.formFields}
      initialForm={salaryPaymentsConfig.initialForm}
      mapRowToForm={salaryPaymentsConfig.mapRowToForm}
      mapFormToPayload={salaryPaymentsConfig.mapFormToPayload}
      mode="edit"
      id={id}
      onSavedPath="/staff/payroll/salary-payments"
    />
  );
};

export default SalaryPaymentsEdit;
