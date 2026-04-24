import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { libraryBorrowedConfig } from './Borrowed';

const BorrowedEdit = () => {
  const { id } = useParams();
  return <FormPage titleCreate="Create Borrow Record" titleEdit="Edit Borrow Record" endpoint={libraryBorrowedConfig.endpoint} formFields={libraryBorrowedConfig.formFields} initialForm={libraryBorrowedConfig.initialForm} mapRowToForm={libraryBorrowedConfig.mapRowToForm} mode="edit" id={id} onSavedPath="/staff/library/borrowed" />;
};

export default BorrowedEdit;
