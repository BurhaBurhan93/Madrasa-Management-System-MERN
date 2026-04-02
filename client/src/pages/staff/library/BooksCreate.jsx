import React from 'react';
import FormPage from '../shared/FormPage';
import { libraryBooksConfig } from './Books';

const BooksCreate = () => <FormPage titleCreate="Create Book" titleEdit="Edit Book" endpoint={libraryBooksConfig.endpoint} formFields={libraryBooksConfig.formFields} initialForm={libraryBooksConfig.initialForm} mapRowToForm={libraryBooksConfig.mapRowToForm} mapFormToPayload={libraryBooksConfig.mapFormToPayload} mode="create" onSavedPath="/staff/library/books" />;

export default BooksCreate;
