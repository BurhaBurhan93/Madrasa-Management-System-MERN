import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { feeStructuresConfig } from './FeeStructures';

const FeeStructuresCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  return (
    <FormPage
      titleCreate={t('staff.finance.feeStructures.create')}
      titleEdit={t('staff.finance.feeStructures.edit')}
      endpoint={feeStructuresConfig.endpoint}
      formFields={feeStructuresConfig.formFields}
      initialForm={feeStructuresConfig.initialForm}
      mapRowToForm={feeStructuresConfig.mapRowToForm}
      mapFormToPayload={feeStructuresConfig.mapFormToPayload}
      mode="create"
      onSavedPath="/staff/finance/fee-structures"
    />
  );
};

export default FeeStructuresCreate;
