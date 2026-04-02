import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { feePaymentsConfig } from './FeePayments';

const FeePaymentsView = () => {
  const { id } = useParams();
  return <RecordViewPage title={feePaymentsConfig.title + ' Details'} subtitle={feePaymentsConfig.subtitle} endpoint={feePaymentsConfig.endpoint} id={id} fields={feePaymentsConfig.formFields} listPath="/staff/finance/fee-payments" editPath={'/staff/finance/fee-payments/edit/' + id} />;
};

export default FeePaymentsView;
