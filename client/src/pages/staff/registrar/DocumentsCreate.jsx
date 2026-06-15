import React from 'react';
import FormPage from '../shared/FormPage';
import { documentsManagementConfig } from './DocumentsManagement';

const DocumentsCreate = () => (
  <FormPage
    titleCreate="Create Document"
    titleEdit="Edit Document"
    endpoint={documentsManagementConfig.endpoint}
    formFields={documentsManagementConfig.formFields}
    initialForm={documentsManagementConfig.initialForm}
    mapRowToForm={documentsManagementConfig.mapRowToForm}
    mode="create"
    onSavedPath="/staff/registrar/documents"
  />
);

export default DocumentsCreate;
