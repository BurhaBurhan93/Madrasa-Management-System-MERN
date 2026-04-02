import React from 'react';
import FormPage from '../shared/FormPage';
import { libraryPurchasesConfig } from './Purchases';

const PurchasesCreate = () => <FormPage titleCreate="Create Purchase" titleEdit="Edit Purchase" endpoint={libraryPurchasesConfig.endpoint} formFields={libraryPurchasesConfig.formFields} initialForm={libraryPurchasesConfig.initialForm} mapRowToForm={libraryPurchasesConfig.mapRowToForm} mapFormToPayload={libraryPurchasesConfig.mapFormToPayload} mode="create" onSavedPath="/staff/library/purchases" />;

export default PurchasesCreate;
