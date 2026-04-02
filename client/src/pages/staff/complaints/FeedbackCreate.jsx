import React from 'react';
import FormPage from '../shared/FormPage';
import { complaintFeedbackConfig } from './Feedback';

const ComplaintFeedbackCreate = () => <FormPage titleCreate="Create Complaint Feedback" titleEdit="Edit Complaint Feedback" endpoint={complaintFeedbackConfig.endpoint} formFields={complaintFeedbackConfig.formFields} initialForm={complaintFeedbackConfig.initialForm} mapRowToForm={complaintFeedbackConfig.mapRowToForm} mapFormToPayload={complaintFeedbackConfig.mapFormToPayload} mode="create" onSavedPath="/staff/complaints/feedback" />;

export default ComplaintFeedbackCreate;
