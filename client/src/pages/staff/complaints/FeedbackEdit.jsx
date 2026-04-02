import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { complaintFeedbackConfig } from './Feedback';

const ComplaintFeedbackEdit = () => {
  const { id } = useParams();
  return <FormPage titleCreate="Create Complaint Feedback" titleEdit="Edit Complaint Feedback" endpoint={complaintFeedbackConfig.endpoint} formFields={complaintFeedbackConfig.formFields} initialForm={complaintFeedbackConfig.initialForm} mapRowToForm={complaintFeedbackConfig.mapRowToForm} mapFormToPayload={complaintFeedbackConfig.mapFormToPayload} mode="edit" id={id} onSavedPath="/staff/complaints/feedback" readMode="collection" readEndpoint={complaintFeedbackConfig.endpoint} />;
};

export default ComplaintFeedbackEdit;
