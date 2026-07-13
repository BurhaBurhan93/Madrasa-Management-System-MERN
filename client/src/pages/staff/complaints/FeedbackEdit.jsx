import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { complaintFeedbackConfig } from './Feedback';

const ComplaintFeedbackEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return <FormPage titleCreate={t('staff.complaints.feedbackCreate.titleCreate')} titleEdit={t('staff.complaints.feedbackCreate.titleEdit')} endpoint={complaintFeedbackConfig.endpoint} formFields={complaintFeedbackConfig.formFields} initialForm={complaintFeedbackConfig.initialForm} mapRowToForm={complaintFeedbackConfig.mapRowToForm} mapFormToPayload={complaintFeedbackConfig.mapFormToPayload} mode="edit" id={id} onSavedPath="/staff/complaints/feedback" />;
};

export default ComplaintFeedbackEdit;
