import React from 'react';
import FormPage from '../shared/FormPage';
import { libraryBorrowedConfig } from './Borrowed';

const BorrowedCreate = () => <FormPage titleCreate="Create Borrow Record" titleEdit="Edit Borrow Record" endpoint={libraryBorrowedConfig.endpoint} formFields={libraryBorrowedConfig.formFields} initialForm={libraryBorrowedConfig.initialForm} mapRowToForm={libraryBorrowedConfig.mapRowToForm} mode="create" onSavedPath="/staff/library/borrowed" />;

export default BorrowedCreate;
