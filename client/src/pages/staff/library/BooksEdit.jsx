import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { libraryBooksConfig } from './Books';

const BooksEdit = () => {
  const { id } = useParams();
  return <FormPage titleCreate="Create Book" titleEdit="Edit Book" endpoint={libraryBooksConfig.endpoint} formFields={libraryBooksConfig.formFields} initialForm={libraryBooksConfig.initialForm} mapRowToForm={libraryBooksConfig.mapRowToForm} mapFormToPayload={libraryBooksConfig.mapFormToPayload} mode="edit" id={id} onSavedPath="/staff/library/books" readMode="collection" readEndpoint={libraryBooksConfig.endpoint} />;
};

export default BooksEdit;
