import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { transactionsConfig } from './Transactions';

const TransactionsEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return (
    <FormPage
      titleCreate={t('finance.transactions.create')}
      titleEdit={t('finance.transactions.edit')}
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
