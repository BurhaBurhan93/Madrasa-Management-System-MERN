import React from 'react';
import FormPage from '../shared/FormPage';
import { transactionsConfig } from './Transactions';

const TransactionsCreate = () => (
  <FormPage
    titleCreate="Create Transaction"
    titleEdit="Edit Transaction"
    endpoint={transactionsConfig.endpoint}
    formFields={transactionsConfig.formFields}
    initialForm={transactionsConfig.initialForm}
    mapRowToForm={transactionsConfig.mapRowToForm}
    mapFormToPayload={transactionsConfig.mapFormToPayload}
    mode="create"
    onSavedPath="/staff/finance/transactions"
  />
);

export default TransactionsCreate;
