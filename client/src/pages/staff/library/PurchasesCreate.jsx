import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { libraryPurchasesConfig } from './Purchases';

const PurchasesCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  return <FormPage titleCreate={t('library.purchases.titleCreate')} titleEdit={t('library.purchases.titleEdit')} endpoint={libraryPurchasesConfig.endpoint} formFields={libraryPurchasesConfig.formFields} initialForm={libraryPurchasesConfig.initialForm} mapRowToForm={libraryPurchasesConfig.mapRowToForm} mapFormToPayload={libraryPurchasesConfig.mapFormToPayload} mode="create" onSavedPath="/staff/library/purchases" />;
};

export default PurchasesCreate;
