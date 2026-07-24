import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { librarySalesConfig } from './Sales';

const SalesEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return <FormPage titleCreate={t('library.sales.titleCreate')} titleEdit={t('library.sales.titleEdit')} endpoint={librarySalesConfig.endpoint} formFields={librarySalesConfig.formFields} initialForm={librarySalesConfig.initialForm} mapRowToForm={librarySalesConfig.mapRowToForm} mapFormToPayload={librarySalesConfig.mapFormToPayload} mode="edit" id={id} onSavedPath="/staff/library/sales" />;
};

export default SalesEdit;
