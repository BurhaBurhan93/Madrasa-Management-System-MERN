import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RecordViewPage from '../shared/RecordViewPage';
import { feePaymentsConfig } from './FeePayments';

const FeePaymentsView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  const resolvedTitle = t(feePaymentsConfig.title);
  return <RecordViewPage title={t('finance.feePayments.details', { title: resolvedTitle })} subtitle={feePaymentsConfig.subtitle} endpoint={feePaymentsConfig.endpoint} id={id} fields={feePaymentsConfig.formFields} listPath="/staff/finance/fee-payments" editPath={'/staff/finance/fee-payments/edit/' + id} />;
};

export default FeePaymentsView;
