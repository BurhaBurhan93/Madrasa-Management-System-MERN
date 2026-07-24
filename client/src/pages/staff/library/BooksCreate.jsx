import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { libraryBooksConfig } from './Books';

const BooksCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  return <FormPage titleCreate={t('library.books.titleCreate')} titleEdit={t('library.books.titleEdit')} endpoint={libraryBooksConfig.endpoint} formFields={libraryBooksConfig.formFields} initialForm={libraryBooksConfig.initialForm} mapRowToForm={libraryBooksConfig.mapRowToForm} mapFormToPayload={libraryBooksConfig.mapFormToPayload} mode="create" onSavedPath="/staff/library/books" />;
};

export default BooksCreate;
