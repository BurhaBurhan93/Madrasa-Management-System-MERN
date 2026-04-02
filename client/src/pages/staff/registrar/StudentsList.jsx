import React from 'react';
import ListPage from '../shared/ListPage';

export const studentsConfig = {
  title: 'All Students',
  subtitle: 'Manage enrolled students and their information',
  endpoint: '/students/all',
  columns: [
    { key: 'studentCode', header: 'Student Code' },
    { key: 'name', header: 'Student Name', render: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || '-' },
    { key: 'fatherName', header: 'Father Name' },
    { key: 'phone', header: 'Phone' },
    { key: 'currentClass', header: 'Class', render: (value) => value?.className || '-' },
    { key: 'currentLevel', header: 'Level' },
    { key: 'status', header: 'Status' },
    { key: 'admissionDate', header: 'Admission Date', render: (value) => value ? new Date(value).toLocaleDateString() : '-' }
  ],
  formFields: [
    { name: 'user', label: 'User Account', type: 'relation', relationEndpoint: '/users/students', relationLabel: (row) => `${row.name || row.email}` },
    { name: 'studentCode', label: 'Student Code', required: true },
    { name: 'currentClass', label: 'Current Class', type: 'relation', relationEndpoint: '/academic/classes', relationLabel: (row) => row.className || row.name },
    { name: 'currentLevel', label: 'Current Level' },
    { name: 'admissionDate', label: 'Admission Date', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]}
  ],
  initialForm: {
    user: '',
    studentCode: '',
    currentClass: '',
    currentLevel: '',
    admissionDate: '',
    status: 'active'
  },
  mapRowToForm: (row) => ({
    user: row.user?._id || row.user || '',
    studentCode: row.studentCode || '',
    currentClass: row.currentClass?._id || row.currentClass || '',
    currentLevel: row.currentLevel || '',
    admissionDate: row.admissionDate ? row.admissionDate.split('T')[0] : '',
    status: row.status || 'active'
  })
};

const StudentsList = () => {
  return <ListPage {...studentsConfig} />;
};

export default StudentsList;
