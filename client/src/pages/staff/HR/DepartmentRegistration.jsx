import React from 'react';
import { useTranslation } from 'react-i18next';
import ListPage from '../shared/ListPage';

export const departmentsConfig = {
  title: 'Departments',
  subtitle: 'Manage organizational departments with a consistent HR table design.',
  endpoint: '/hr/departments',
  columns: [
    { key: 'departmentCode', header: 'Code' },
    { key: 'departmentName', header: 'Department Name' },
    { key: 'departmentHead', header: 'Department Head', render: (value) => value?.fullName || '-' },
    { key: 'location', header: 'Location' },
    { key: 'status', header: 'Status' }
  ],
  formFields: [
    { name: 'departmentName', label: 'Department Name' },
    { name: 'departmentCode', label: 'Department Code' },
    { name: 'departmentHead', label: 'Department Head', type: 'relation', relationEndpoint: '/hr/employees', relationLabel: (row) => `${row.fullName} (${row.employeeCode || 'No Code'})` },
    { name: 'location', label: 'Location' },
    { name: 'contactExtension', label: 'Contact Extension' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ] },
    { name: 'description', label: 'Description', type: 'textarea', rows: 4 }
  ],
  initialForm: {
    departmentName: '',
    departmentCode: '',
    departmentHead: '',
    location: '',
    contactExtension: '',
    status: 'active',
    description: ''
  },
  mapRowToForm: (row) => ({
    departmentName: row.departmentName || '',
    departmentCode: row.departmentCode || '',
    departmentHead: row.departmentHead?._id || row.departmentHead || '',
    location: row.location || '',
    contactExtension: row.contactExtension || '',
    status: row.status || 'active',
    description: row.description || ''
  })
};

const DepartmentRegistration = () => {
  const { t } = useTranslation(['staff', 'common']);
  return (
    <ListPage
      title={t('staff.hr.departments.title')}
      subtitle={t('staff.hr.departments.subtitle')}
      endpoint={departmentsConfig.endpoint}
      columns={departmentsConfig.columns.map(col => ({ ...col, header: t(`staff.hr.departments.col${col.key}`) }))}
      createPath="/staff/hr/departments/create"
      editPathForRow={(row) => `/staff/hr/departments/edit/${row._id}`}
      viewPathForRow={(row) => `/staff/hr/departments/view/${row._id}`}
      searchPlaceholder={t('staff.hr.departments.searchPlaceholder')}
      clientSidePagination={true}
    />
  );
};

export default DepartmentRegistration;
