import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { complaintFeedbackConfig } from './Feedback';

const ComplaintFeedbackCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  return <FormPage titleCreate={t('staff.complaints.feedbackCreate.titleCreate')} titleEdit={t('staff.complaints.feedbackCreate.titleEdit')} endpoint={complaintFeedbackConfig.endpoint} formFields={complaintFeedbackConfig.formFields} initialForm={complaintFeedbackConfig.initialForm} mapRowToForm={complaintFeedbackConfig.mapRowToForm} mapFormToPayload={complaintFeedbackConfig.mapFormToPayload} mode="create" onSavedPath="/staff/complaints/feedback" />;
};

export default ComplaintFeedbackCreate;
