import React from 'react';
import FormPage from '../shared/FormPage';
import { complaintActionsConfig } from './Actions';

const ComplaintActionsCreate = () => <FormPage titleCreate="Create Complaint Action" titleEdit="Edit Complaint Action" endpoint={complaintActionsConfig.endpoint} formFields={complaintActionsConfig.formFields} initialForm={complaintActionsConfig.initialForm} mapRowToForm={complaintActionsConfig.mapRowToForm} mapFormToPayload={complaintActionsConfig.mapFormToPayload} mode="create" onSavedPath="/staff/complaints/actions" />;

export default ComplaintActionsCreate;
