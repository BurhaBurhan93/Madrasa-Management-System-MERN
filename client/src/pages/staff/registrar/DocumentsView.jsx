import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { documentsManagementConfig } from './DocumentsManagement';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const mapRowToView = (row) => ({
  ...row,
  student: `${row.student?.firstName || ''} ${row.student?.lastName || ''}`.trim() || row.student?.studentCode || row.user?.name || '-'
});

const openFile = (filePath) => {
  const raw = filePath;
  const path = typeof raw === 'object' ? raw.url : raw;
  if (!path) return;
  if (path.startsWith('data:')) {
    const a = document.createElement('a');
    a.href = path;
    a.download = 'document';
    a.click();
  } else if (path.startsWith('http')) {
    window.open(path, '_blank');
  } else {
    window.open(`${API_BASE.replace(/\/api$/, '')}${path}`, '_blank');
  }
};

const DocumentsView = () => {
  const { id } = useParams();
  const fields = documentsManagementConfig.formFields
    .filter((field) => field.name !== 'filePath')
    .map((field) => ({ name: field.name, label: field.label }));
  fields.push({
    name: 'filePath',
    label: 'File',
    renderView: (value) => {
      if (!value) return '-';
      return (
        <button
          type="button"
          onClick={() => openFile(value)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 shadow-sm transition-all duration-200 hover:border-blue-300 hover:bg-blue-100"
        >
          View / Download File
        </button>
      );
    }
  });

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
      mapRowToView={mapRowToView}
    />
  );
};

export default DocumentsView;
