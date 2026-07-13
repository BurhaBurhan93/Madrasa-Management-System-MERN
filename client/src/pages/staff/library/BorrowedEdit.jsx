import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { libraryBorrowedConfig } from './Borrowed';

const BorrowedEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return <FormPage titleCreate={t('staff.library.borrowed.titleCreate')} titleEdit={t('staff.library.borrowed.titleEdit')} endpoint={libraryBorrowedConfig.endpoint} formFields={libraryBorrowedConfig.formFields} initialForm={libraryBorrowedConfig.initialForm} mapRowToForm={libraryBorrowedConfig.mapRowToForm} mode="edit" id={id} onSavedPath="/staff/library/borrowed" />;
};

export default BorrowedEdit;
