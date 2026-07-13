import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { complaintFeedbackConfig } from './Feedback';

const ComplaintFeedbackView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return <RecordViewPage title={t('staff.complaints.feedbackView.title')} subtitle={t('staff.complaints.feedback.subtitle')} endpoint={complaintFeedbackConfig.endpoint} id={id} fields={complaintFeedbackConfig.formFields} listPath="/staff/complaints/feedback" editPath={`/staff/complaints/feedback/edit/${id}`} />;
};

export default ComplaintFeedbackView;
