import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { complaintActionsConfig } from './Actions';

const ComplaintActionsView = () => {
  const { id } = useParams();
  return <RecordViewPage title="Complaint Action Details" subtitle={complaintActionsConfig.subtitle} endpoint={complaintActionsConfig.endpoint} id={id} fields={complaintActionsConfig.formFields} listPath="/staff/complaints/actions" editPath={`/staff/complaints/actions/edit/${id}`} />;
};

export default ComplaintActionsView;
