import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RecordViewPage from '../shared/RecordViewPage';
import { transactionsConfig } from './Transactions';

const TransactionsView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  const resolvedTitle = t(transactionsConfig.title);
  return <RecordViewPage title={t('finance.transactions.details', { title: resolvedTitle })} subtitle={transactionsConfig.subtitle} endpoint={transactionsConfig.endpoint} id={id} fields={transactionsConfig.formFields} listPath="/staff/finance/transactions" editPath={'/staff/finance/transactions/edit/' + id} />;
};

export default TransactionsView;
