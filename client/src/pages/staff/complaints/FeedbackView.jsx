import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { complaintFeedbackConfig } from './Feedback';

const ComplaintFeedbackView = () => {
  const { id } = useParams();
  return <RecordViewPage title="Complaint Feedback Details" subtitle={complaintFeedbackConfig.subtitle} endpoint={complaintFeedbackConfig.endpoint} id={id} fields={complaintFeedbackConfig.formFields} listPath="/staff/complaints/feedback" editPath={`/staff/complaints/feedback/edit/${id}`} />;
};

export default ComplaintFeedbackView;
