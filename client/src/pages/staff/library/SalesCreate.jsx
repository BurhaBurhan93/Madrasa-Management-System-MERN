import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { librarySalesConfig } from './Sales';

const SalesCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  return <FormPage titleCreate={t('library.sales.titleCreate')} titleEdit={t('library.sales.titleEdit')} endpoint={librarySalesConfig.endpoint} formFields={librarySalesConfig.formFields} initialForm={librarySalesConfig.initialForm} mapRowToForm={librarySalesConfig.mapRowToForm} mapFormToPayload={librarySalesConfig.mapFormToPayload} mode="create" onSavedPath="/staff/library/sales" />;
};

export default SalesCreate;
