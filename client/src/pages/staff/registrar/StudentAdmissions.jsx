import React from 'react';
import ListPage from '../shared/ListPage';

export const studentAdmissionsConfig = {
  title: 'Student Admissions',
  subtitle: 'Manage new student admissions - Complete registration with all required information',
  endpoint: '/students/admissions',
  columns: [
    { key: 'studentCode', header: 'Student Code' },
    { key: 'name', header: 'Student Name', render: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || '-' },
    { key: 'fatherName', header: 'Father Name' },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    { key: 'degree', header: 'Degree', render: (value) => value?.degreeName || '-' },
    { key: 'currentClass', header: 'Class', render: (value) => value?.className || '-' },
    { key: 'status', header: 'Status', render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'accepted' ? 'bg-green-100 text-green-800' :
        value === 'rejected' ? 'bg-red-100 text-red-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>
        {value || 'pending'}
      </span>
    )},
    { key: 'createdAt', header: 'Applied Date', render: (value) => value ? new Date(value).toLocaleDateString() : '-' }
  ],
  formFields: [
    // ===== BASIC INFORMATION =====
    { name: 'user', label: 'User Account (if exists)', type: 'relation', relationEndpoint: '/users/students', relationLabel: (row) => `${row.name || row.email}`, group: 'Basic Information' },
    { name: 'studentCode', label: 'Student Code', required: true, group: 'Basic Information', placeholder: 'e.g., STU-2024-001' },
    { name: 'firstName', label: 'First Name', required: true, group: 'Basic Information' },
    { name: 'lastName', label: 'Last Name', group: 'Basic Information' },
    { name: 'fatherName', label: 'Father Name', required: true, group: 'Basic Information' },
    { name: 'grandfatherName', label: 'Grandfather Name', group: 'Basic Information' },
    { name: 'dob', label: 'Date of Birth', type: 'date', required: true, group: 'Basic Information' },
    { name: 'bloodType', label: 'Blood Type', type: 'select', options: [
      { value: '', label: 'Select' },
      { value: 'A+', label: 'A+' },
      { value: 'A-', label: 'A-' },
      { value: 'B+', label: 'B+' },
      { value: 'B-', label: 'B-' },
      { value: 'AB+', label: 'AB+' },
      { value: 'AB-', label: 'AB-' },
      { value: 'O+', label: 'O+' },
      { value: 'O-', label: 'O-'}
    ], group: 'Basic Information' },
      
    // ===== CONTACT INFORMATION =====
    { name: 'phone', label: 'Phone Number', required: true, group: 'Contact Information' },
    { name: 'whatsapp', label: 'WhatsApp Number', group: 'Contact Information' },
    { name: 'email', label: 'Email Address', type: 'email', group: 'Contact Information' },
      
    // ===== ADDRESS INFORMATION =====
    { name: 'permanentAddress_province', label: 'Province (Permanent)', group: 'Address Information' },
    { name: 'permanentAddress_district', label: 'District (Permanent)', group: 'Address Information' },
    { name: 'permanentAddress_village', label: 'Village/Street (Permanent)', group: 'Address Information' },
    { name: 'currentAddress_province', label: 'Province (Current)', group: 'Address Information' },
    { name: 'currentAddress_district', label: 'District (Current)', group: 'Address Information' },
    { name: 'currentAddress_village', label: 'Village/Street (Current)', group: 'Address Information' },
      
    // ===== GUARDIAN INFORMATION =====
    { name: 'guardianName', label: 'Guardian Name', required: true, group: 'Guardian Information' },
    { name: 'guardianRelationship', label: 'Relationship with Guardian', required: true, group: 'Guardian Information', placeholder: 'e.g., Father, Mother, Uncle' },
    { name: 'guardianPhone', label: 'Guardian Phone', required: true, group: 'Guardian Information' },
    { name: 'guardianEmail', label: 'Guardian Email', type: 'email', group: 'Guardian Information' },
      
    // ===== ACADEMIC INFORMATION =====
    { name: 'degree', label: 'Enrolled Degree', type: 'relation', relationEndpoint: '/academic/degrees', relationLabel: (row) => row.degreeName || row.name, required: true, group: 'Academic Information' },
    { name: 'currentClass', label: 'Assigned Class', type: 'relation', relationEndpoint: '/academic/classes', relationLabel: (row) => row.className || row.name, group: 'Academic Information' },
    { name: 'currentLevel', label: 'Academic Level', group: 'Academic Information', placeholder: 'e.g., Level 1, Beginner' },
    { name: 'admissionDate', label: 'Admission Date', type: 'date', required: true, group: 'Academic Information' },
    { name: 'status', label: 'Admission Status', type: 'select', options: [
      { value: 'pending', label: 'Pending' },
      { value: 'accepted', label: 'Accepted' },
      { value: 'rejected', label: 'Rejected' }
    ], required: true, group: 'Academic Information' },
      
    // ===== PREVIOUS EDUCATION =====
    { name: 'previousDegree', label: 'Previous Degree/Certificate', group: 'Previous Education' },
    { name: 'previousInstitution', label: 'Previous Institution', group: 'Previous Education' },
    { name: 'locationOfInstitution', label: 'Institution Location', group: 'Previous Education' }
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
    
    // Guardian
    guardianName: '',
    guardianRelationship: '',
    guardianPhone: '',
    guardianEmail: '',
    
    // Academic
    degree: '',
    currentClass: '',
    currentLevel: '',
    admissionDate: '',
    status: 'pending',
    
    // Previous Education
    previousDegree: '',
    previousInstitution: '',
    locationOfInstitution: ''
  },
  mapRowToForm: (row) => ({
    // Basic
    user: row.user?._id || row.user || '',
    studentCode: row.studentCode || '',
    firstName: row.firstName || '',
    lastName: row.lastName || '',
    fatherName: row.fatherName || '',
    grandfatherName: row.grandfatherName || '',
    dob: row.dob ? row.dob.split('T')[0] : '',
    bloodType: row.bloodType || '',
    
    // Contact
    phone: row.phone || '',
    whatsapp: row.whatsapp || '',
    email: row.email || '',
    
    // Address
    permanentAddress_province: row.permanentAddress?.province || '',
    permanentAddress_district: row.permanentAddress?.district || '',
    permanentAddress_village: row.permanentAddress?.village || '',
    currentAddress_province: row.currentAddress?.province || '',
    currentAddress_district: row.currentAddress?.district || '',
    currentAddress_village: row.currentAddress?.village || '',
    
    // Guardian
    guardianName: row.guardianName || '',
    guardianRelationship: row.guardianRelationship || '',
    guardianPhone: row.guardianPhone || '',
    guardianEmail: row.guardianEmail || '',
    
    // Academic
    degree: row.degree?._id || row.degree || '',
    currentClass: row.currentClass?._id || row.currentClass || '',
    currentLevel: row.currentLevel || '',
    admissionDate: row.admissionDate ? row.admissionDate.split('T')[0] : '',
    status: row.status || 'pending',
    
    // Previous Education
    previousDegree: row.previousDegree || '',
    previousInstitution: row.previousInstitution || '',
    locationOfInstitution: row.locationOfInstitution || ''
  })
};

const StudentAdmissions = () => {
  return <ListPage {...studentAdmissionsConfig} />;
};

export default StudentAdmissions;
