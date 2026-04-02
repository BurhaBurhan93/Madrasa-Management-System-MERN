import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { designationsConfig } from './DesignationRegistration';

const DesignationView = () => {
  const { id } = useParams();
  return <RecordViewPage title="Designation Details" subtitle={designationsConfig.subtitle} endpoint={designationsConfig.endpoint} id={id} fields={designationsConfig.formFields} listPath="/staff/hr/designations" editPath={`/staff/hr/designations/edit/${id}`} />;
};

export default DesignationView;
