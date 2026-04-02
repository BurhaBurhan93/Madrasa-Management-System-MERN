import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { designationsConfig } from './DesignationRegistration';

const DesignationEdit = () => {
  const { id } = useParams();
  return <FormPage titleCreate="Create Designation" titleEdit="Edit Designation" endpoint={designationsConfig.endpoint} formFields={designationsConfig.formFields} initialForm={designationsConfig.initialForm} mapRowToForm={designationsConfig.mapRowToForm} mapFormToPayload={designationsConfig.mapFormToPayload} mode="edit" id={id} onSavedPath="/staff/hr/designations" />;
};

export default DesignationEdit;
