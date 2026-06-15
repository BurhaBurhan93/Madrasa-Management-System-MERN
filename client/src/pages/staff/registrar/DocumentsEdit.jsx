import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { documentsManagementConfig } from './DocumentsManagement';

const DocumentsEdit = () => {
  const { id } = useParams();
  return (
    <FormPage
      titleCreate="Create Document"
      titleEdit="Edit Document"
      endpoint={documentsManagementConfig.endpoint}
      formFields={documentsManagementConfig.formFields}
      initialForm={documentsManagementConfig.initialForm}
      mapRowToForm={documentsManagementConfig.mapRowToForm}
      mode="edit"
      id={id}
      onSavedPath="/staff/registrar/documents"
      readMode="collection"
      readEndpoint={documentsManagementConfig.endpoint}
    />
  );
};

export default DocumentsEdit;
