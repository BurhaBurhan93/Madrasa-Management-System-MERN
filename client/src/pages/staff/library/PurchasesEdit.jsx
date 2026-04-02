import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { libraryPurchasesConfig } from './Purchases';

const PurchasesEdit = () => {
  const { id } = useParams();
  return <FormPage titleCreate="Create Purchase" titleEdit="Edit Purchase" endpoint={libraryPurchasesConfig.endpoint} formFields={libraryPurchasesConfig.formFields} initialForm={libraryPurchasesConfig.initialForm} mapRowToForm={libraryPurchasesConfig.mapRowToForm} mapFormToPayload={libraryPurchasesConfig.mapFormToPayload} mode="edit" id={id} onSavedPath="/staff/library/purchases" readMode="collection" readEndpoint={libraryPurchasesConfig.endpoint} />;
};

export default PurchasesEdit;
