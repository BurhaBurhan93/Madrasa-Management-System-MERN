import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { libraryPurchasesConfig } from './Purchases';

const PurchasesEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return <FormPage titleCreate={t('library.purchases.titleCreate')} titleEdit={t('library.purchases.titleEdit')} endpoint={libraryPurchasesConfig.endpoint} formFields={libraryPurchasesConfig.formFields} initialForm={libraryPurchasesConfig.initialForm} mapRowToForm={libraryPurchasesConfig.mapRowToForm} mapFormToPayload={libraryPurchasesConfig.mapFormToPayload} mode="edit" id={id} onSavedPath="/staff/library/purchases" />;
};

export default PurchasesEdit;
