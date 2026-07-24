import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { transactionsConfig } from './Transactions';

const TransactionsCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  return (
    <FormPage
      titleCreate={t('finance.transactions.create')}
      titleEdit={t('finance.transactions.edit')}
      endpoint={transactionsConfig.endpoint}
      formFields={transactionsConfig.formFields}
      initialForm={transactionsConfig.initialForm}
      mapRowToForm={transactionsConfig.mapRowToForm}
      mapFormToPayload={transactionsConfig.mapFormToPayload}
      mode="create"
      onSavedPath="/staff/finance/transactions"
    />
  );
};

export default TransactionsCreate;
