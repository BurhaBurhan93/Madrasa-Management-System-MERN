import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { libraryCategoriesConfig } from './Categories';

const CategoriesCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  return <FormPage titleCreate={t('library.categories.titleCreate')} titleEdit={t('library.categories.titleEdit')} endpoint={libraryCategoriesConfig.endpoint} formFields={libraryCategoriesConfig.formFields} initialForm={libraryCategoriesConfig.initialForm} mapRowToForm={libraryCategoriesConfig.mapRowToForm} mode="create" onSavedPath="/staff/library/categories" />;
};

export default CategoriesCreate;
