import React from 'react';
import ListPage from '../shared/ListPage';

export const documentsManagementConfig = {
  title: 'Student Documents Management',
  subtitle: 'Upload, manage, and track student documents and certificates',
  endpoint: '/students/documents',
  columns: [
    { key: 'student', header: 'Student', render: (value, row) => row.student?.user?.name || '-' },
    { key: 'type', header: 'Document Type' },
    { key: 'title', header: 'Title' },
    { key: 'uploadDate', header: 'Upload Date', render: (value) => value ? new Date(value).toLocaleDateString() : '-' },
    { key: 'status', header: 'Status' },
    { key: 'actions', header: 'Actions', render: (value, row, actions) => (
      <div className="flex gap-2">
        <button 
          onClick={() => window.open(row.filePath, '_blank')}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          📄 View
        </button>
        <button 
          onClick={() => actions.onDelete(row)}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          🗑️ Delete
        </button>
      </div>
    )}
  ],
  formFields: [
    { name: 'student', label: 'Student', type: 'relation', relationEndpoint: '/students/all', relationLabel: (row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.user?.name, required: true },
    { name: 'type', label: 'Document Type', type: 'select', options: [
      { value: 'passport', label: 'Passport Photo' },
      { value: 'certificate', label: 'Certificate' },
      { value: 'transcript', label: 'Transcript' },
      { value: 'id_card', label: 'ID Card' },
      { value: 'birth_certificate', label: 'Birth Certificate' },
      { value: 'other', label: 'Other' }
    ], required: true },
    { name: 'title', label: 'Document Title', required: true },
    { name: 'description', label: 'Description' },
    { name: 'filePath', label: 'Upload File', type: 'file', accept: '.pdf,.jpg,.jpeg,.png' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'archived', label: 'Archived' }
    ]}
  ],
  initialForm: {
    student: '',
    type: 'passport',
    title: '',
    description: '',
    filePath: '',
    status: 'active'
  },
  mapRowToForm: (row) => ({
    student: row.student?._id || row.student || '',
    type: row.type || '',
    title: row.title || '',
    description: row.description || '',
    filePath: row.filePath || '',
    status: row.status || 'active'
  })
};

const DocumentsManagement = () => {
  return <ListPage {...documentsManagementConfig} />;
};

export default DocumentsManagement;
