import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { complaintFeedbackConfig } from './Feedback';

const ComplaintFeedbackCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  const formFields = complaintFeedbackConfig.formFields.map(field => ({
    ...field,
    label: t(`staff.complaints.feedback.fields.${field.name}`),
    options: field.options?.map(opt => ({ ...opt, label: t(`staff.complaints.feedback.options.${field.name}.${opt.value}`) }))
  }));
  return <FormPage titleCreate={t('staff.complaints.feedbackCreate.titleCreate')} titleEdit={t('staff.complaints.feedbackCreate.titleEdit')} endpoint={complaintFeedbackConfig.endpoint} formFields={formFields} initialForm={complaintFeedbackConfig.initialForm} mapRowToForm={complaintFeedbackConfig.mapRowToForm} mapFormToPayload={complaintFeedbackConfig.mapFormToPayload} mode="create" onSavedPath="/staff/complaints/feedback" />;
};

export default ComplaintFeedbackCreate;
