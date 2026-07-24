import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { feePaymentsConfig } from './FeePayments';

const FeePaymentsEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return (
    <FormPage
      titleCreate={t('finance.feePayments.create')}
      titleEdit={t('finance.feePayments.edit')}
      endpoint={feePaymentsConfig.endpoint}
      formFields={feePaymentsConfig.formFields}
      initialForm={feePaymentsConfig.initialForm}
      mapRowToForm={feePaymentsConfig.mapRowToForm}
      mapFormToPayload={feePaymentsConfig.mapFormToPayload}
      mode="edit"
      id={id}
      onSavedPath="/staff/finance/fee-payments"
    />
  );
};

export default FeePaymentsEdit;
