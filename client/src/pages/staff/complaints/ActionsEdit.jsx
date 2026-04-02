import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { complaintActionsConfig } from './Actions';

const ComplaintActionsEdit = () => {
  const { id } = useParams();
  return <FormPage titleCreate="Create Complaint Action" titleEdit="Edit Complaint Action" endpoint={complaintActionsConfig.endpoint} formFields={complaintActionsConfig.formFields} initialForm={complaintActionsConfig.initialForm} mapRowToForm={complaintActionsConfig.mapRowToForm} mapFormToPayload={complaintActionsConfig.mapFormToPayload} mode="edit" id={id} onSavedPath="/staff/complaints/actions" readMode="collection" readEndpoint={complaintActionsConfig.endpoint} />;
};

export default ComplaintActionsEdit;
