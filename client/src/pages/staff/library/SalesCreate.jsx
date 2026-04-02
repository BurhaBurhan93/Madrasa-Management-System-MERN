import React from 'react';
import FormPage from '../shared/FormPage';
import { librarySalesConfig } from './Sales';

const SalesCreate = () => <FormPage titleCreate="Create Sale" titleEdit="Edit Sale" endpoint={librarySalesConfig.endpoint} formFields={librarySalesConfig.formFields} initialForm={librarySalesConfig.initialForm} mapRowToForm={librarySalesConfig.mapRowToForm} mapFormToPayload={librarySalesConfig.mapFormToPayload} mode="create" onSavedPath="/staff/library/sales" />;

export default SalesCreate;
