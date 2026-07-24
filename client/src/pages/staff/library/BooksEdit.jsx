import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { libraryBooksConfig } from './Books';

const BooksEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return <FormPage titleCreate={t('library.books.titleCreate')} titleEdit={t('library.books.titleEdit')} endpoint={libraryBooksConfig.endpoint} formFields={libraryBooksConfig.formFields} initialForm={libraryBooksConfig.initialForm} mapRowToForm={libraryBooksConfig.mapRowToForm} mapFormToPayload={libraryBooksConfig.mapFormToPayload} mode="edit" id={id} onSavedPath="/staff/library/books" />;
};

export default BooksEdit;
