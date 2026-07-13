import React from 'react';
import { useTranslation } from 'react-i18next';
import ListPage from '../shared/ListPage';

export const hostelAllocationsConfig = (t) => ({
  title: t('staff.hostel.allocations.title'),
  subtitle: t('staff.hostel.allocations.subtitle'),
  endpoint: '/hostel/allocations',
  createPath: '/staff/registrar/hostel-allocations/create',
  editPathForRow: (row) => `/staff/registrar/hostel-allocations/edit/${row._id}`,
  viewPathForRow: (row) => `/staff/registrar/hostel-allocations/view/${row._id}`,
  columns: [
    { 
      key: 'student', 
      header: t('common.student'), 
      render: (value) => value ? `${value.firstName || ''} ${value.lastName || ''}`.trim() : '-' 
    },
    { 
      key: 'studentCode', 
      header: t('staff.hostel.allocations.columns.studentCode'), 
      render: (value, row) => row.student?.studentCode || '-' 
    },
    { 
      key: 'room', 
      header: t('common.room'), 
      render: (value) => value ? `${value.roomNumber} (${value.building})` : '-' 
    },
    { 
      key: 'checkInDate', 
      header: t('staff.hostel.allocations.columns.checkInDate'), 
      render: (value) => value ? new Date(value).toLocaleDateString() : '-' 
    },
    { 
      key: 'monthlyRent', 
      header: t('staff.hostel.allocations.columns.monthlyRent'), 
      render: (value) => `$${value || 0}` 
    },
    { 
      key: 'status', 
      header: t('common.status')
    }
  ],
  searchPlaceholder: t('staff.hostel.allocations.searchPlaceholder'),
  formFields: [
    { name: 'student', label: t('common.student'), type: 'relation', relationEndpoint: '/student/all', relationLabel: (row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.user?.name, required: true },
    { name: 'room', label: t('common.room'), type: 'relation', relationEndpoint: '/hostel/rooms', relationLabel: (row) => `${row.roomNumber} (${row.building})`, required: true },
    { name: 'bedNumber', label: t('staff.hostel.allocations.form.bedNumber'), type: 'number' },
    { name: 'checkInDate', label: t('staff.hostel.allocations.form.checkInDate'), type: 'date', required: true },
    { name: 'expectedCheckOutDate', label: t('staff.hostel.allocations.form.expectedCheckOutDate'), type: 'date' },
    { name: 'monthlyRent', label: t('staff.hostel.allocations.form.monthlyRent'), type: 'number', required: true },
    { name: 'securityDeposit', label: t('staff.hostel.allocations.form.securityDeposit'), type: 'number' },
    { name: 'emergencyContact_name', label: t('staff.hostel.allocations.form.emergencyContactName'), type: 'text', required: true },
    { name: 'emergencyContact_relationship', label: t('staff.hostel.allocations.form.emergencyContactRelationship'), type: 'text', required: true },
    { name: 'emergencyContact_phone', label: t('staff.hostel.allocations.form.emergencyContactPhone'), type: 'text', required: true },
    { name: 'emergencyContact_email', label: t('staff.hostel.allocations.form.emergencyContactEmail'), type: 'text' },
    { name: 'notes', label: t('common.notes'), type: 'textarea' },
    { name: 'status', label: t('common.status'), type: 'select', options: [
      { value: 'active', label: t('common.active') },
      { value: 'pending', label: t('common.pending') },
      { value: 'checked-out', label: t('staff.hostel.allocations.status.checkedOut') },
      { value: 'suspended', label: t('staff.hostel.allocations.status.suspended') }
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
});

const HostelAllocations = () => {
  const { t } = useTranslation(['staff', 'common']);
  return <ListPage {...hostelAllocationsConfig(t)} />;
};

export default HostelAllocations;
