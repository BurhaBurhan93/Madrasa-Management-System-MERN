import React from 'react';
import ListPage from '../shared/ListPage';

export const hostelAllocationsConfig = {
  title: 'Hostel Allocations',
  subtitle: 'Manage student room assignments and hostel residency',
  endpoint: '/hostel/allocations',
  createPath: '/staff/registrar/hostel-allocations/create',
  editPathForRow: (row) => `/staff/registrar/hostel-allocations/edit/${row._id}`,
  viewPathForRow: (row) => `/staff/registrar/hostel-allocations/view/${row._id}`,
  columns: [
    { 
      key: 'student', 
      header: 'Student', 
      render: (value) => value ? `${value.firstName || ''} ${value.lastName || ''}`.trim() : '-' 
    },
    { 
      key: 'studentCode', 
      header: 'Student Code', 
      render: (value, row) => row.student?.studentCode || '-' 
    },
    { 
      key: 'room', 
      header: 'Room', 
      render: (value) => value ? `${value.roomNumber} (${value.building})` : '-' 
    },
    { 
      key: 'checkInDate', 
      header: 'Check-in Date', 
      render: (value) => value ? new Date(value).toLocaleDateString() : '-' 
    },
    { 
      key: 'monthlyRent', 
      header: 'Monthly Rent', 
      render: (value) => `$${value || 0}` 
    },
    { 
      key: 'status', 
      header: 'Status'
    }
  ],
  searchPlaceholder: 'Search by student name or room number...',
  formFields: [
    { name: 'student', label: 'Student', type: 'relation', relationEndpoint: '/student/all', relationLabel: (row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.user?.name, required: true },
    { name: 'room', label: 'Room', type: 'relation', relationEndpoint: '/hostel/rooms', relationLabel: (row) => `${row.roomNumber} (${row.building})`, required: true },
    { name: 'bedNumber', label: 'Bed Number', type: 'number' },
    { name: 'checkInDate', label: 'Check-in Date', type: 'date', required: true },
    { name: 'expectedCheckOutDate', label: 'Expected Check-out Date', type: 'date' },
    { name: 'monthlyRent', label: 'Monthly Rent', type: 'number', required: true },
    { name: 'securityDeposit', label: 'Security Deposit', type: 'number' },
    { name: 'emergencyContact_name', label: 'Emergency Contact Name', type: 'text', required: true },
    { name: 'emergencyContact_relationship', label: 'Emergency Contact Relationship', type: 'text', required: true },
    { name: 'emergencyContact_phone', label: 'Emergency Contact Phone', type: 'text', required: true },
    { name: 'emergencyContact_email', label: 'Emergency Contact Email', type: 'text' },
    { name: 'notes', label: 'Notes', type: 'textarea' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'pending', label: 'Pending' },
      { value: 'checked-out', label: 'Checked Out' },
      { value: 'suspended', label: 'Suspended' }
    ]}
  ],
  initialForm: {
    student: '',
    room: '',
    bedNumber: 1,
    checkInDate: '',
    expectedCheckOutDate: '',
    monthlyRent: 0,
    securityDeposit: 0,
    emergencyContact_name: '',
    emergencyContact_relationship: '',
    emergencyContact_phone: '',
    emergencyContact_email: '',
    notes: '',
    status: 'active'
  },
  mapRowToForm: (row) => ({
    student: row.student?._id || row.student || '',
    room: row.room?._id || row.room || '',
    bedNumber: row.bedNumber || 1,
    checkInDate: row.checkInDate ? row.checkInDate.split('T')[0] : '',
    expectedCheckOutDate: row.expectedCheckOutDate ? row.expectedCheckOutDate.split('T')[0] : '',
    monthlyRent: row.monthlyRent || 0,
    securityDeposit: row.securityDeposit || 0,
    emergencyContact_name: row.emergencyContact?.name || '',
    emergencyContact_relationship: row.emergencyContact?.relationship || '',
    emergencyContact_phone: row.emergencyContact?.phone || '',
    emergencyContact_email: row.emergencyContact?.email || '',
    notes: row.notes || '',
    status: row.status || 'active'
  }),
  mapFormToPayload: (form) => {
    const payload = {
      student: form.student,
      room: form.room,
      bedNumber: Number(form.bedNumber) || 1,
      checkInDate: form.checkInDate,
      expectedCheckOutDate: form.expectedCheckOutDate || undefined,
      monthlyRent: Number(form.monthlyRent) || 0,
      securityDeposit: Number(form.securityDeposit) || 0,
      notes: form.notes || '',
      status: form.status || 'active'
    };
    if (form.emergencyContact_name || form.emergencyContact_relationship || form.emergencyContact_phone) {
      payload.emergencyContact = {
        name: form.emergencyContact_name || '',
        relationship: form.emergencyContact_relationship || '',
        phone: form.emergencyContact_phone || '',
        email: form.emergencyContact_email || ''
      };
    }
    return payload;
  }
};

const HostelAllocations = () => (
  <ListPage {...hostelAllocationsConfig} />
);

export default HostelAllocations;
