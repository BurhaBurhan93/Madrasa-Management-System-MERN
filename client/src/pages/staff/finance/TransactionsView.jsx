import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { transactionsConfig } from './Transactions';

const TransactionsView = () => {
  const { id } = useParams();
  return <RecordViewPage title={transactionsConfig.title + ' Details'} subtitle={transactionsConfig.subtitle} endpoint={transactionsConfig.endpoint} id={id} fields={transactionsConfig.formFields} listPath="/staff/finance/transactions" editPath={'/staff/finance/transactions/edit/' + id} />;
};

export default TransactionsView;
