import React from 'react';
import FormPage from '../shared/FormPage';
import { feePaymentsConfig } from './FeePayments';

const FeePaymentsCreate = () => (
  <FormPage
    titleCreate="Create Fee Payment"
    titleEdit="Edit Fee Payment"
    endpoint={feePaymentsConfig.endpoint}
    formFields={feePaymentsConfig.formFields}
    initialForm={feePaymentsConfig.initialForm}
    mapRowToForm={feePaymentsConfig.mapRowToForm}
    mapFormToPayload={feePaymentsConfig.mapFormToPayload}
    mode="create"
    onSavedPath="/staff/finance/fee-payments"
  />
);

export default FeePaymentsCreate;
