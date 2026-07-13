import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { feePaymentsConfig } from './FeePayments';

const FeePaymentsCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  return (
    <FormPage
      titleCreate={t('staff.finance.feePayments.create')}
      titleEdit={t('staff.finance.feePayments.edit')}
      endpoint={feePaymentsConfig.endpoint}
      formFields={feePaymentsConfig.formFields}
      initialForm={feePaymentsConfig.initialForm}
      mapRowToForm={feePaymentsConfig.mapRowToForm}
      mapFormToPayload={feePaymentsConfig.mapFormToPayload}
      mode="create"
      onSavedPath="/staff/finance/fee-payments"
    />
  );
};

export default FeePaymentsCreate;
