import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { documentsManagementConfig } from './DocumentsManagement';

const DocumentsView = () => {
  const { id } = useParams();
  const fields = documentsManagementConfig.formFields.map((field) => ({ name: field.name, label: field.label }));

  return (
    <RecordViewPage
      title="Document Details"
      subtitle="View uploaded document metadata"
      endpoint={documentsManagementConfig.endpoint}
      id={id}
      fields={fields}
      listPath="/staff/registrar/documents"
      editPath={`/staff/registrar/documents/edit/${id}`}
      readMode="collection"
      readEndpoint={documentsManagementConfig.endpoint}
    />
  );
};

export default DocumentsView;
