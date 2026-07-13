import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { libraryBooksConfig } from './Books';

const BooksView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return <RecordViewPage title={t('staff.library.books.viewTitle')} subtitle={t('staff.library.books.subtitle')} endpoint={libraryBooksConfig.endpoint} id={id} fields={libraryBooksConfig.formFields} listPath="/staff/library/books" editPath={`/staff/library/books/edit/${id}`} />;
};

export default BooksView;
