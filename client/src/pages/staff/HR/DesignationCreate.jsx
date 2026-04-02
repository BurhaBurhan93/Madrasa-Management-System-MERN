import React from 'react';
import FormPage from '../shared/FormPage';
import { designationsConfig } from './DesignationRegistration';

const DesignationCreate = () => (
  <FormPage titleCreate="Create Designation" titleEdit="Edit Designation" endpoint={designationsConfig.endpoint} formFields={designationsConfig.formFields} initialForm={designationsConfig.initialForm} mapRowToForm={designationsConfig.mapRowToForm} mapFormToPayload={designationsConfig.mapFormToPayload} mode="create" onSavedPath="/staff/hr/designations" />
);

export default DesignationCreate;
