import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { complaintsConfig } from './ComplaintsList';

const ComplaintsEdit = () => {
  const { id } = useParams();
  return <FormPage titleCreate="Create Complaint" titleEdit="Edit Complaint" endpoint={complaintsConfig.endpoint} formFields={complaintsConfig.formFields} initialForm={complaintsConfig.initialForm} mapRowToForm={complaintsConfig.mapRowToForm} mapFormToPayload={complaintsConfig.mapFormToPayload} mode={id ? 'edit' : 'create'} id={id} onSavedPath="/staff/complaints" />;
};

export default ComplaintsEdit;
