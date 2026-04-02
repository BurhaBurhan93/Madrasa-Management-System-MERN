import React from 'react';
import ListPage from '../shared/ListPage';

export const guardianManagementConfig = {
  title: 'Guardian / Guarantor Management',
  subtitle: 'Manage student guardians and guarantors information',
  endpoint: '/students/guardians',
  columns: [
    { key: 'name', header: 'Guardian Name' },
    { key: 'relationship', header: 'Relationship' },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    { key: 'occupation', header: 'Occupation' },
    { key: 'isPrimary', header: 'Primary', render: (value) => value ? '✅ Yes' : 'No' }
  ],
  formFields: [
    { name: 'student', label: 'Student', type: 'relation', relationEndpoint: '/students/all', relationLabel: (row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.user?.name, required: true },
    { name: 'name', label: 'Guardian Name', required: true },
    { name: 'relationship', label: 'Relationship with Student', required: true },
    { name: 'phone', label: 'Phone Number', required: true },
    { name: 'email', label: 'Email Address', type: 'email' },
    { name: 'occupation', label: 'Occupation' },
    { name: 'address', label: 'Address' },
    { name: 'idNumber', label: 'ID Number' },
    { name: 'isPrimary', label: 'Primary Guardian', type: 'select', options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' }
    ]}
  ],
  initialForm: {
    student: '',
    name: '',
    relationship: '',
    phone: '',
    email: '',
    occupation: '',
    address: '',
    idNumber: '',
    isPrimary: 'false'
  },
  mapRowToForm: (row) => ({
    student: row.student?._id || row.student || '',
    name: row.name || '',
    relationship: row.relationship || '',
    phone: row.phone || '',
    email: row.email || '',
    occupation: row.occupation || '',
    address: row.address || '',
    idNumber: row.idNumber || '',
    isPrimary: row.isPrimary?.toString() || 'false'
  })
};

const GuardianManagement = () => {
  return <ListPage {...guardianManagementConfig} />;
};

export default GuardianManagement;
