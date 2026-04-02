import React from 'react';
import ListPage from '../shared/ListPage';

export const employeesConfig = {
  title: 'Employees',
  subtitle: 'Manage employee records with the same polished table and form experience.',
  endpoint: '/hr/employees',
  columns: [
    { key: 'employeeCode', header: 'Code' },
    { key: 'fullName', header: 'Full Name' },
    { key: 'department', header: 'Department', render: (value) => value?.departmentName || '-' },
    { key: 'designation', header: 'Designation', render: (value) => value?.designationTitle || '-' },
    { key: 'phoneNumber', header: 'Phone Number' },
    { key: 'employeeType', header: 'Employee Type' },
    { key: 'status', header: 'Status' }
  ],
  formFields: [
    { name: 'user', label: 'User Account', type: 'relation', relationEndpoint: '/users', relationLabel: (row) => `${row.name || row.fullName} (${row.email || 'No Email'})` },
    { name: 'fullName', label: 'Full Name' },
    { name: 'fullNameArabic', label: 'Full Name Arabic' },
    { name: 'fatherName', label: 'Father Name' },
    { name: 'dateOfBirth', label: 'Date Of Birth', type: 'date' },
    { name: 'gender', label: 'Gender', type: 'select', options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' }
    ] },
    { name: 'cnic', label: 'CNIC' },
    { name: 'phoneNumber', label: 'Phone Number' },
    { name: 'email', label: 'Email' },
    { name: 'currentAddress', label: 'Current Address' },
    { name: 'emergencyContactName', label: 'Emergency Contact Name' },
    { name: 'emergencyContactPhone', label: 'Emergency Contact Phone' },
    { name: 'employeeType', label: 'Employee Type', type: 'select', options: [
      { value: 'teacher', label: 'Teacher' },
      { value: 'admin', label: 'Admin' },
      { value: 'support', label: 'Support' },
      { value: 'kitchen', label: 'Kitchen' },
      { value: 'security', label: 'Security' }
    ] },
    { name: 'department', label: 'Department', type: 'relation', relationEndpoint: '/hr/departments', relationLabel: (row) => `${row.departmentName} (${row.departmentCode})` },
    { name: 'designation', label: 'Designation', type: 'relation', relationEndpoint: '/hr/designations', relationLabel: (row) => row.designationTitle },
    { name: 'joiningDate', label: 'Joining Date', type: 'date' },
    { name: 'employmentType', label: 'Employment Type', type: 'select', options: [
      { value: 'permanent', label: 'Permanent' },
      { value: 'contract', label: 'Contract' },
      { value: 'part-time', label: 'Part Time' }
    ] },
    { name: 'baseSalary', label: 'Base Salary', type: 'number' },
    { name: 'houseAllowance', label: 'House Allowance', type: 'number' },
    { name: 'transportAllowance', label: 'Transport Allowance', type: 'number' },
    { name: 'medicalAllowance', label: 'Medical Allowance', type: 'number' },
    { name: 'paymentMethod', label: 'Payment Method', type: 'select', options: [
      { value: 'cash', label: 'Cash' },
      { value: 'bank', label: 'Bank Transfer' }
    ] },
    { name: 'bankName', label: 'Bank Name' },
    { name: 'accountNumber', label: 'Account Number' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ] }
  ],
  initialForm: {
    user: '',
    fullName: '',
    fullNameArabic: '',
    fatherName: '',
    dateOfBirth: '',
    gender: 'male',
    cnic: '',
    phoneNumber: '',
    email: '',
    currentAddress: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    employeeType: 'support',
    department: '',
    designation: '',
    joiningDate: '',
    employmentType: 'permanent',
    baseSalary: 0,
    houseAllowance: 0,
    transportAllowance: 0,
    medicalAllowance: 0,
    paymentMethod: 'cash',
    bankName: '',
    accountNumber: '',
    status: 'active'
  },
  mapFormToPayload: (form) => ({
    ...form,
    baseSalary: Number(form.baseSalary || 0),
    houseAllowance: Number(form.houseAllowance || 0),
    transportAllowance: Number(form.transportAllowance || 0),
    medicalAllowance: Number(form.medicalAllowance || 0)
  }),
  mapRowToForm: (row) => ({
    user: row.user?._id || row.user || '',
    fullName: row.fullName || '',
    fullNameArabic: row.fullNameArabic || '',
    fatherName: row.fatherName || '',
    dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth).toISOString().slice(0, 10) : '',
    gender: row.gender || 'male',
    cnic: row.cnic || '',
    phoneNumber: row.phoneNumber || '',
    email: row.email || '',
    currentAddress: row.currentAddress || '',
    emergencyContactName: row.emergencyContactName || '',
    emergencyContactPhone: row.emergencyContactPhone || '',
    employeeType: row.employeeType || 'support',
    department: row.department?._id || row.department || '',
    designation: row.designation?._id || row.designation || '',
    joiningDate: row.joiningDate ? new Date(row.joiningDate).toISOString().slice(0, 10) : '',
    employmentType: row.employmentType || 'permanent',
    baseSalary: row.baseSalary ?? 0,
    houseAllowance: row.houseAllowance ?? 0,
    transportAllowance: row.transportAllowance ?? 0,
    medicalAllowance: row.medicalAllowance ?? 0,
    paymentMethod: row.paymentMethod || 'cash',
    bankName: row.bankName || '',
    accountNumber: row.accountNumber || '',
    status: row.status || 'active'
  })
};

const Employees = () => (
  <ListPage
    title={employeesConfig.title}
    subtitle={employeesConfig.subtitle}
    endpoint={employeesConfig.endpoint}
    columns={employeesConfig.columns}
    createPath="/staff/hr/employee-registration"
    editPathForRow={(row) => `/staff/hr/employees/edit/${row._id}`}
    viewPathForRow={(row) => `/staff/hr/employees/view/${row._id}`}
    searchPlaceholder="Search employees..."
    clientSidePagination={true}
  />
);

export default Employees;
