import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { transactionsConfig } from './Transactions';

const TransactionsEdit = () => {
  const { id } = useParams();
  return (
    <FormPage
      titleCreate="Create Transaction"
      titleEdit="Edit Transaction"
      endpoint={transactionsConfig.endpoint}
      formFields={transactionsConfig.formFields}
      initialForm={transactionsConfig.initialForm}
      mapRowToForm={transactionsConfig.mapRowToForm}
      mapFormToPayload={transactionsConfig.mapFormToPayload}
      mode="edit"
      id={id}
      onSavedPath="/staff/finance/transactions"
    />
  );
};

export default TransactionsEdit;
