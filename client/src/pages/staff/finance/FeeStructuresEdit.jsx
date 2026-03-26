import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { feeStructuresConfig } from './FeeStructures';

const FeeStructuresEdit = () => {
  const { id } = useParams();
  return (
    <FormPage
      titleCreate="Create Fee Structure"
      titleEdit="Edit Fee Structure"
      endpoint={feeStructuresConfig.endpoint}
      formFields={feeStructuresConfig.formFields}
      initialForm={feeStructuresConfig.initialForm}
      mapRowToForm={feeStructuresConfig.mapRowToForm}
      mapFormToPayload={feeStructuresConfig.mapFormToPayload}
      mode="edit"
      id={id}
      onSavedPath="/staff/finance/fee-structures"
    />
  );
};

export default FeeStructuresEdit;
