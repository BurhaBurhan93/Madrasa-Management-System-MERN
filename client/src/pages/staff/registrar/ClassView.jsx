import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import classManagementConfig from './classManagementConfig';

const ClassView = () => {
  const { id } = useParams();
  return (
    <RecordViewPage
      title="Class Details"
      subtitle={classManagementConfig.subtitle}
      endpoint={classManagementConfig.endpoint}
      id={id}
      fields={classManagementConfig.formFields}
      listPath="/staff/registrar/classes"
      editPath={`/staff/registrar/classes/edit/${id}`}
    />
  );
};

export default ClassView;
