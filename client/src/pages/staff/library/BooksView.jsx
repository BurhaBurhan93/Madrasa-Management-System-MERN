import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { libraryBooksConfig } from './Books';

const BooksView = () => {
  const { id } = useParams();
  return <RecordViewPage title="Book Details" subtitle={libraryBooksConfig.subtitle} endpoint={libraryBooksConfig.endpoint} id={id} fields={libraryBooksConfig.formFields} listPath="/staff/library/books" editPath={`/staff/library/books/edit/${id}`} readMode="collection" readEndpoint={libraryBooksConfig.endpoint} />;
};

export default BooksView;
