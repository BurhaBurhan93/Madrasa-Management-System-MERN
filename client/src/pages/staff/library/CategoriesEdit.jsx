import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { libraryCategoriesConfig } from './Categories';

const CategoriesEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return <FormPage titleCreate={t('staff.library.categories.titleCreate')} titleEdit={t('staff.library.categories.titleEdit')} endpoint={libraryCategoriesConfig.endpoint} formFields={libraryCategoriesConfig.formFields} initialForm={libraryCategoriesConfig.initialForm} mapRowToForm={libraryCategoriesConfig.mapRowToForm} mode="edit" id={id} onSavedPath="/staff/library/categories" />;
};

export default CategoriesEdit;
