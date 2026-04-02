import React from 'react';
import FormPage from '../shared/FormPage';
import { suppliersConfig } from './Suppliers';

const SuppliersCreate = () => <FormPage titleCreate="Create Supplier" titleEdit="Edit Supplier" endpoint={suppliersConfig.endpoint} formFields={suppliersConfig.formFields} initialForm={suppliersConfig.initialForm} mapRowToForm={suppliersConfig.mapRowToForm} mapFormToPayload={suppliersConfig.mapFormToPayload} mode="create" onSavedPath="/staff/kitchen/suppliers" />;

export default SuppliersCreate;
