import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { feePaymentsConfig } from './FeePayments';

const FeePaymentsEdit = () => {
  const { id } = useParams();
  return (
    <FormPage
      titleCreate="Create Fee Payment"
      titleEdit="Edit Fee Payment"
      endpoint={feePaymentsConfig.endpoint}
      formFields={feePaymentsConfig.formFields}
      initialForm={feePaymentsConfig.initialForm}
      mapRowToForm={feePaymentsConfig.mapRowToForm}
      mapFormToPayload={feePaymentsConfig.mapFormToPayload}
      mode="edit"
      id={id}
      onSavedPath="/staff/finance/fee-payments"
    />
  );
};

export default FeePaymentsEdit;
