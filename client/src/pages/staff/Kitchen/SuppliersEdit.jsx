import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { suppliersConfig } from './Suppliers';

const SuppliersEdit = () => {
  const { id } = useParams();
  return <FormPage titleCreate="Create Supplier" titleEdit="Edit Supplier" endpoint={suppliersConfig.endpoint} formFields={suppliersConfig.formFields} initialForm={suppliersConfig.initialForm} mapRowToForm={suppliersConfig.mapRowToForm} mapFormToPayload={suppliersConfig.mapFormToPayload} mode="edit" id={id} onSavedPath="/staff/kitchen/suppliers" readMode="collection" readEndpoint={suppliersConfig.endpoint} />;
};

export default SuppliersEdit;
