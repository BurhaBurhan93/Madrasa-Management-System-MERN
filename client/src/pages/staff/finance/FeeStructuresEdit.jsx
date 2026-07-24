import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { feeStructuresConfig } from './FeeStructures';

const FeeStructuresEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return (
    <FormPage
      titleCreate={t('finance.feeStructures.create')}
      titleEdit={t('finance.feeStructures.edit')}
      endpoint={feeStructuresConfig.endpoint}
      formFields={feeStructuresConfig.formFields}
      initialForm={feeStructuresConfig.initialForm}
      mapRowToForm={feeStructuresConfig.mapRowToForm}
      mapFormToPayload={feeStructuresConfig.mapFormToPayload}
      mode="edit"
      id={id}
      onSavedPath="/staff/finance/fee-structures"
    />
  );
};

export default FeeStructuresEdit;
