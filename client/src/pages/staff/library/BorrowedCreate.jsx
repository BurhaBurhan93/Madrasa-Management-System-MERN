import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { libraryBorrowedConfig } from './Borrowed';

const BorrowedCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  return <FormPage titleCreate={t('staff.library.borrowed.titleCreate')} titleEdit={t('staff.library.borrowed.titleEdit')} endpoint={libraryBorrowedConfig.endpoint} formFields={libraryBorrowedConfig.formFields} initialForm={libraryBorrowedConfig.initialForm} mapRowToForm={libraryBorrowedConfig.mapRowToForm} mode="create" onSavedPath="/staff/library/borrowed" />;
};

export default BorrowedCreate;
