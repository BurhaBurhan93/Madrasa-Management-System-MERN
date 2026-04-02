import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { complaintsConfig } from './ComplaintsList';

const ComplaintsView = () => {
  const { id } = useParams();
  return <RecordViewPage title="Complaint Details" subtitle={complaintsConfig.subtitle} endpoint={complaintsConfig.endpoint} id={id} fields={complaintsConfig.formFields} listPath="/staff/complaints" readMode="collection" readEndpoint={complaintsConfig.endpoint} />;
};

export default ComplaintsView;
