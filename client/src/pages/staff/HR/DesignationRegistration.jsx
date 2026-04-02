import React from 'react';
import ListPage from '../shared/ListPage';

export const designationsConfig = {
  title: 'Designations',
  subtitle: 'Manage job roles and hierarchy with the unified HR interface.',
  endpoint: '/hr/designations',
  columns: [
    { key: 'designationTitle', header: 'Designation' },
    { key: 'department', header: 'Department', render: (value) => value?.departmentName || '-' },
    { key: 'jobLevel', header: 'Job Level' },
    { key: 'salaryRangeMin', header: 'Salary Min' },
    { key: 'salaryRangeMax', header: 'Salary Max' },
    { key: 'status', header: 'Status' }
  ],
  formFields: [
    { name: 'designationTitle', label: 'Designation Title' },
    { name: 'department', label: 'Department', type: 'relation', relationEndpoint: '/hr/departments', relationLabel: (row) => `${row.departmentName} (${row.departmentCode})` },
    { name: 'jobLevel', label: 'Job Level', type: 'select', options: [
      { value: 'entry', label: 'Entry Level' },
      { value: 'mid', label: 'Mid Level' },
      { value: 'senior', label: 'Senior Level' },
      { value: 'manager', label: 'Manager' }
    ] },
    { name: 'minQualification', label: 'Minimum Qualification' },
    { name: 'salaryRangeMin', label: 'Salary Range Min', type: 'number' },
    { name: 'salaryRangeMax', label: 'Salary Range Max', type: 'number' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ] },
    { name: 'jobDescription', label: 'Job Description', type: 'textarea', rows: 4 },
    { name: 'responsibilities', label: 'Responsibilities', type: 'textarea', rows: 4 }
  ],
  initialForm: {
    designationTitle: '',
    department: '',
    jobLevel: 'entry',
    minQualification: '',
    salaryRangeMin: 0,
    salaryRangeMax: 0,
    status: 'active',
    jobDescription: '',
    responsibilities: ''
  },
  mapFormToPayload: (form) => ({
    ...form,
    salaryRangeMin: Number(form.salaryRangeMin || 0),
    salaryRangeMax: Number(form.salaryRangeMax || 0)
  }),
  mapRowToForm: (row) => ({
    designationTitle: row.designationTitle || '',
    department: row.department?._id || row.department || '',
    jobLevel: row.jobLevel || 'entry',
    minQualification: row.minQualification || '',
    salaryRangeMin: row.salaryRangeMin ?? 0,
    salaryRangeMax: row.salaryRangeMax ?? 0,
    status: row.status || 'active',
    jobDescription: row.jobDescription || '',
    responsibilities: row.responsibilities || ''
  })
};

const DesignationRegistration = () => (
  <ListPage
    title={designationsConfig.title}
    subtitle={designationsConfig.subtitle}
    endpoint={designationsConfig.endpoint}
    columns={designationsConfig.columns}
    createPath="/staff/hr/designations/create"
    editPathForRow={(row) => `/staff/hr/designations/edit/${row._id}`}
    viewPathForRow={(row) => `/staff/hr/designations/view/${row._id}`}
    searchPlaceholder="Search designations..."
    clientSidePagination={true}
  />
);

export default DesignationRegistration;
