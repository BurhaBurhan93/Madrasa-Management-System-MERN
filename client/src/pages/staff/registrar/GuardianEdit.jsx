import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { guardianManagementConfig } from './GuardianManagement';

const GuardianEdit = () => {
  const { id } = useParams();
  return (
    <FormPage
      titleCreate="Create Guardian"
      titleEdit="Edit Guardian"
      endpoint={guardianManagementConfig.endpoint}
      formFields={guardianManagementConfig.formFields}
      initialForm={guardianManagementConfig.initialForm}
      mapRowToForm={guardianManagementConfig.mapRowToForm}
      mapFormToPayload={guardianManagementConfig.mapFormToPayload}
      mode="edit"
      id={id}
      onSavedPath="/staff/registrar/guardians"
      readMode="collection"
      readEndpoint={guardianManagementConfig.endpoint}
    />
  );
};

export default GuardianEdit;
