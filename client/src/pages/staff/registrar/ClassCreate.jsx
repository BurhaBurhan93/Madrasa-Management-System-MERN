import React from 'react';
import FormPage from '../shared/FormPage';
import classManagementConfig from './classManagementConfig';

const ClassCreate = () => (
  <FormPage
    titleCreate="Create New Class"
    titleEdit="Edit Class"
    endpoint={classManagementConfig.endpoint}
    formFields={classManagementConfig.formFields}
    initialForm={classManagementConfig.initialForm}
    mapRowToForm={classManagementConfig.mapRowToForm}
    mapFormToPayload={classManagementConfig.mapFormToPayload}
    mode="create"
    onSavedPath="/staff/registrar/classes"
  />
);

export default ClassCreate;
