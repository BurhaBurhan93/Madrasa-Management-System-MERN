import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import classManagementConfig from './classManagementConfig';

const ClassEdit = () => {
  const { id } = useParams();
  return (
    <FormPage
      titleCreate="Create New Class"
      titleEdit="Edit Class"
      endpoint={classManagementConfig.endpoint}
      formFields={classManagementConfig.formFields}
      initialForm={classManagementConfig.initialForm}
      mapRowToForm={classManagementConfig.mapRowToForm}
      mapFormToPayload={classManagementConfig.mapFormToPayload}
      mode="edit"
      id={id}
      onSavedPath="/staff/registrar/classes"
    />
  );
};

export default ClassEdit;
