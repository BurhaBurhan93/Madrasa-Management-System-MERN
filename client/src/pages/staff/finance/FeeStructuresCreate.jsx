import React from 'react';
import FormPage from '../shared/FormPage';
import { feeStructuresConfig } from './FeeStructures';

const FeeStructuresCreate = () => (
  <FormPage
    titleCreate="Create Fee Structure"
    titleEdit="Edit Fee Structure"
    endpoint={feeStructuresConfig.endpoint}
    formFields={feeStructuresConfig.formFields}
    initialForm={feeStructuresConfig.initialForm}
    mapRowToForm={feeStructuresConfig.mapRowToForm}
    mapFormToPayload={feeStructuresConfig.mapFormToPayload}
    mode="create"
    onSavedPath="/staff/finance/fee-structures"
  />
);

export default FeeStructuresCreate;
