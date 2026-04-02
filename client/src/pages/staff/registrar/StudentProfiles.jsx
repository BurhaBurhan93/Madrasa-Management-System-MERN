import React from 'react';
import ListPage from '../shared/ListPage';

export const studentProfilesConfig = {
  title: 'Student Profile Management',
  subtitle: 'Manage complete student profiles, personal information, and academic records',
  endpoint: '/students/all',
  columns: [
    { key: 'studentCode', header: 'Student Code' },
    { key: 'name', header: 'Student Name', render: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.user?.name || '-' },
    { key: 'fatherName', header: 'Father Name' },
    { key: 'phone', header: 'Phone' },
    { key: 'currentClass', header: 'Class', render: (value) => value?.className || '-' },
    { key: 'currentLevel', header: 'Level' },
    { key: 'status', header: 'Status', render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {value || 'N/A'}
      </span>
    )},
    { key: 'admissionDate', header: 'Admission Date', render: (value) => value ? new Date(value).toLocaleDateString() : '-' }
  ],
  formFields: [
    // Basic Information
    { name: 'user', label: 'User Account', type: 'relation', relationEndpoint: '/users/students', relationLabel: (row) => `${row.name || row.email}`, required: true, group: 'Basic Information' },
    { name: 'studentCode', label: 'Student Code', required: true, group: 'Basic Information' },
    { name: 'firstName', label: 'First Name', required: true, group: 'Basic Information' },
    { name: 'lastName', label: 'Last Name', group: 'Basic Information' },
    { name: 'fatherName', label: 'Father Name', required: true, group: 'Basic Information' },
    { name: 'grandfatherName', label: 'Grandfather Name', group: 'Basic Information' },
    { name: 'dob', label: 'Date of Birth', type: 'date', group: 'Basic Information' },
    { name: 'bloodType', label: 'Blood Type', type: 'select', options: [
      { value: '', label: 'Select' },
      { value: 'A+', label: 'A+' },
      { value: 'A-', label: 'A-' },
      { value: 'B+', label: 'B+' },
      { value: 'B-', label: 'B-' },
      { value: 'AB+', label: 'AB+' },
      { value: 'AB-', label: 'AB-' },
      { value: 'O+', label: 'O+' },
      { value: 'O-', label: 'O-' }
    ], group: 'Basic Information' },
    
    // Contact Information
    { name: 'phone', label: 'Phone Number', required: true, group: 'Contact Information' },
    { name: 'whatsapp', label: 'WhatsApp Number', group: 'Contact Information' },
    { name: 'email', label: 'Email Address', type: 'email', group: 'Contact Information' },
    
    // Address Information
    { name: 'permanentAddress_province', label: 'Province (Permanent)', group: 'Address Information' },
    { name: 'permanentAddress_district', label: 'District (Permanent)', group: 'Address Information' },
    { name: 'permanentAddress_village', label: 'Village (Permanent)', group: 'Address Information' },
    { name: 'currentAddress_province', label: 'Province (Current)', group: 'Address Information' },
    { name: 'currentAddress_district', label: 'District (Current)', group: 'Address Information' },
    { name: 'currentAddress_village', label: 'Village (Current)', group: 'Address Information' },
    
    // Academic Information
    { name: 'currentClass', label: 'Current Class', type: 'relation', relationEndpoint: '/academic/classes', relationLabel: (row) => row.className || row.name, group: 'Academic Information' },
    { name: 'currentLevel', label: 'Current Level', group: 'Academic Information' },
    { name: 'admissionDate', label: 'Admission Date', type: 'date', group: 'Academic Information' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ], group: 'Academic Information' },
    
    // Guardian Information
    { name: 'guardianName', label: 'Guardian Name', group: 'Guardian Information' },
    { name: 'guardianRelationship', label: 'Relationship with Guardian', group: 'Guardian Information' },
    { name: 'guardianPhone', label: 'Guardian Phone', group: 'Guardian Information' },
    { name: 'guardianEmail', label: 'Guardian Email', type: 'email', group: 'Guardian Information' }
  ],
  initialForm: {
    // Basic
    user: '',
    studentCode: '',
    firstName: '',
    lastName: '',
    fatherName: '',
    grandfatherName: '',
    dob: '',
    bloodType: '',
    
    // Contact
    phone: '',
    whatsapp: '',
    email: '',
    
    // Address
    permanentAddress_province: '',
    permanentAddress_district: '',
    permanentAddress_village: '',
    currentAddress_province: '',
    currentAddress_district: '',
    currentAddress_village: '',
    
    // Academic
    currentClass: '',
    currentLevel: '',
    admissionDate: '',
    status: 'active',
    
    // Guardian
    guardianName: '',
    guardianRelationship: '',
    guardianPhone: '',
    guardianEmail: ''
  },
  mapRowToForm: (row) => ({
    // Basic
    user: row.user?._id || row.user || '',
    studentCode: row.studentCode || '',
    firstName: row.firstName || row.user?.name?.split(' ')[0] || '',
    lastName: row.lastName || row.user?.name?.split(' ')[1] || '',
    fatherName: row.fatherName || '',
    grandfatherName: row.grandfatherName || '',
    dob: row.dob ? row.dob.split('T')[0] : '',
    bloodType: row.bloodType || '',
    
    // Contact
    phone: row.phone || row.user?.phone || '',
    whatsapp: row.whatsapp || '',
    email: row.email || row.user?.email || '',
    
    // Address
    permanentAddress_province: row.permanentAddress?.province || '',
    permanentAddress_district: row.permanentAddress?.district || '',
    permanentAddress_village: row.permanentAddress?.village || '',
    currentAddress_province: row.currentAddress?.province || '',
    currentAddress_district: row.currentAddress?.district || '',
    currentAddress_village: row.currentAddress?.village || '',
    
    // Academic
    currentClass: row.currentClass?._id || row.currentClass || '',
    currentLevel: row.currentLevel || '',
    admissionDate: row.admissionDate ? row.admissionDate.split('T')[0] : '',
    status: row.status || 'active',
    
    // Guardian
    guardianName: row.guardianName || '',
    guardianRelationship: row.guardianRelationship || '',
    guardianPhone: row.guardianPhone || '',
    guardianEmail: row.guardianEmail || ''
  })
};

const StudentProfiles = () => {
  return <ListPage {...studentProfilesConfig} />;
};

export default StudentProfiles;
