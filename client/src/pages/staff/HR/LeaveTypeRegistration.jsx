import React from 'react';
import Badge from '../../../components/UIHelper/Badge';
import ListPage from '../shared/ListPage';

export const leaveTypesConfig = {
  title: 'Leave Types',
  subtitle: 'Manage leave policies with consistent filtering, status, and actions.',
  endpoint: '/hr/leave-types',
  columns: [
    { key: 'leaveCode', header: 'Code' },
    { key: 'leaveTypeName', header: 'Leave Type' },
    { key: 'maxDaysAllowed', header: 'Max Days', render: (value) => `${value} days` },
    { key: 'isPaid', header: 'Payment', render: (value) => <Badge variant={value ? 'success' : 'warning'}>{value ? 'Paid' : 'Unpaid'}</Badge> },
    { key: 'carryForward', header: 'Carry Forward', render: (value) => value ? 'Yes' : 'No' },
    { key: 'status', header: 'Status' }
  ],
  formFields: [
    { name: 'leaveTypeName', label: 'Leave Type Name' },
    { name: 'leaveCode', label: 'Leave Code' },
    { name: 'maxDaysAllowed', label: 'Max Days Allowed', type: 'number' },
    { name: 'genderSpecific', label: 'Gender Specific', type: 'select', options: [
      { value: 'both', label: 'Both' },
      { value: 'male', label: 'Male Only' },
      { value: 'female', label: 'Female Only' }
    ] },
    { name: 'isPaid', label: 'Paid Leave', type: 'select', options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' }
    ] },
    { name: 'carryForward', label: 'Carry Forward', type: 'select', options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' }
    ] },
    { name: 'requiresMedicalCertificate', label: 'Medical Certificate Required', type: 'select', options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' }
    ] },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ] },
    { name: 'description', label: 'Description', type: 'textarea', rows: 4 }
  ],
  initialForm: {
    leaveTypeName: '',
    leaveCode: '',
    maxDaysAllowed: 1,
    genderSpecific: 'both',
    isPaid: 'true',
    carryForward: 'false',
    requiresMedicalCertificate: 'false',
    status: 'active',
    description: ''
  },
  mapFormToPayload: (form) => ({
    ...form,
    maxDaysAllowed: Number(form.maxDaysAllowed || 0),
    isPaid: String(form.isPaid) === 'true',
    carryForward: String(form.carryForward) === 'true',
    requiresMedicalCertificate: String(form.requiresMedicalCertificate) === 'true'
  }),
  mapRowToForm: (row) => ({
    leaveTypeName: row.leaveTypeName || '',
    leaveCode: row.leaveCode || '',
    maxDaysAllowed: row.maxDaysAllowed ?? 1,
    genderSpecific: row.genderSpecific || 'both',
    isPaid: String(row.isPaid ?? true),
    carryForward: String(row.carryForward ?? false),
    requiresMedicalCertificate: String(row.requiresMedicalCertificate ?? false),
    status: row.status || 'active',
    description: row.description || ''
  })
};

const LeaveTypeRegistration = () => (
  <ListPage
    title={leaveTypesConfig.title}
    subtitle={leaveTypesConfig.subtitle}
    endpoint={leaveTypesConfig.endpoint}
    columns={leaveTypesConfig.columns}
    createPath="/staff/hr/leave-types/create"
    editPathForRow={(row) => `/staff/hr/leave-types/edit/${row._id}`}
    viewPathForRow={(row) => `/staff/hr/leave-types/view/${row._id}`}
    searchPlaceholder="Search leave types..."
    clientSidePagination={true}
  />
);

export default LeaveTypeRegistration;
