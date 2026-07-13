import React from 'react';
import { useTranslation } from 'react-i18next';
import ListPage from '../shared/ListPage';

export const hostelRoomsConfig = (t) => ({
  title: t('staff.hostel.rooms.title'),
  subtitle: t('staff.hostel.rooms.subtitle'),
  endpoint: '/hostel/rooms',
  createPath: '/staff/registrar/hostel-rooms/create',
  editPathForRow: (row) => `/staff/registrar/hostel-rooms/edit/${row._id}`,
  viewPathForRow: (row) => `/staff/registrar/hostel-rooms/view/${row._id}`,
  columns: [
    { key: 'roomNumber', header: t('staff.hostel.rooms.columns.roomNumber') },
    { key: 'building', header: t('common.building') },
    { key: 'floor', header: t('common.floor') },
    { key: 'roomType', header: t('staff.hostel.rooms.columns.type'), render: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '-' },
    { key: 'capacity', header: t('common.capacity') },
    { key: 'currentOccupancy', header: t('staff.hostel.rooms.columns.occupied'), render: (value, row) => `${value || 0} / ${row.capacity}` },
    { key: 'monthlyRent', header: t('staff.hostel.rooms.columns.monthlyRent'), render: (value) => `$${value || 0}` },
    { key: 'status', header: t('common.status') }
  ],
  searchPlaceholder: t('staff.hostel.rooms.searchPlaceholder'),
  formFields: [
    { name: 'roomNumber', label: t('staff.hostel.rooms.form.roomNumber'), type: 'text', required: true },
    { name: 'building', label: t('common.building'), type: 'text', required: true },
    { name: 'floor', label: t('common.floor'), type: 'number', required: true },
    { name: 'capacity', label: t('common.capacity'), type: 'number', required: true },
    { name: 'roomType', label: t('staff.hostel.rooms.form.roomType'), type: 'select', options: [
      { value: 'single', label: t('staff.hostel.rooms.roomType.single') },
      { value: 'double', label: t('staff.hostel.rooms.roomType.double') },
      { value: 'triple', label: t('staff.hostel.rooms.roomType.triple') },
      { value: 'quad', label: t('staff.hostel.rooms.roomType.quad') }
    ]},
    { name: 'monthlyRent', label: t('staff.hostel.rooms.form.monthlyRent'), type: 'number' },
    { name: 'description', label: t('common.description'), type: 'textarea' },
    { name: 'notes', label: t('common.notes'), type: 'textarea' },
    { name: 'status', label: t('common.status'), type: 'select', options: [
      { value: 'available', label: t('staff.hostel.rooms.status.available') },
      { value: 'occupied', label: t('staff.hostel.rooms.status.occupied') },
      { value: 'maintenance', label: t('staff.hostel.rooms.status.maintenance') },
      { value: 'reserved', label: t('staff.hostel.rooms.status.reserved') }
    ]}
  ],
  initialForm: {
    roomNumber: '',
    building: '',
    floor: 1,
    capacity: 2,
    roomType: 'double',
    monthlyRent: 0,
    description: '',
    notes: '',
    status: 'available'
  },
  mapRowToForm: (row) => ({
    roomNumber: row.roomNumber || '',
    building: row.building || '',
    floor: row.floor || 1,
    capacity: row.capacity || 2,
    roomType: row.roomType || 'double',
    monthlyRent: row.monthlyRent || 0,
    description: row.description || '',
    notes: row.notes || '',
    status: row.status || 'available'
  })
});

const HostelRooms = () => {
  const { t } = useTranslation(['staff', 'common']);
  return <ListPage {...hostelRoomsConfig(t)} />;
};

export default HostelRooms;
