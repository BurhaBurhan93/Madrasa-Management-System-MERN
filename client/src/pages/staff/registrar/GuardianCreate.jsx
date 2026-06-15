import React from 'react';
import FormPage from '../shared/FormPage';
import { guardianManagementConfig } from './GuardianManagement';

const GuardianCreate = () => (
  <FormPage
    titleCreate="Create Guardian"
    titleEdit="Edit Guardian"
    endpoint={guardianManagementConfig.endpoint}
    formFields={guardianManagementConfig.formFields}
    initialForm={guardianManagementConfig.initialForm}
    mapRowToForm={guardianManagementConfig.mapRowToForm}
    mapFormToPayload={guardianManagementConfig.mapFormToPayload}
    mode="create"
    onSavedPath="/staff/registrar/guardians"
  />
);

export default GuardianCreate;
