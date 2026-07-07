import React from 'react';
import ListPage from '../shared/ListPage';

export const hostelRoomsConfig = {
  title: 'Hostel Rooms',
  subtitle: 'Manage hostel rooms, buildings, and accommodation capacity',
  endpoint: '/hostel/rooms',
  createPath: '/staff/registrar/hostel-rooms/create',
  editPathForRow: (row) => `/staff/registrar/hostel-rooms/edit/${row._id}`,
  viewPathForRow: (row) => `/staff/registrar/hostel-rooms/view/${row._id}`,
  columns: [
    { key: 'roomNumber', header: 'Room Number' },
    { key: 'building', header: 'Building' },
    { key: 'floor', header: 'Floor' },
    { key: 'roomType', header: 'Type', render: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '-' },
    { key: 'capacity', header: 'Capacity' },
    { key: 'currentOccupancy', header: 'Occupied', render: (value, row) => `${value || 0} / ${row.capacity}` },
    { key: 'monthlyRent', header: 'Monthly Rent', render: (value) => `$${value || 0}` },
    { key: 'status', header: 'Status' }
  ],
  searchPlaceholder: 'Search by room number or building...',
  formFields: [
    { name: 'roomNumber', label: 'Room Number', type: 'text', required: true },
    { name: 'building', label: 'Building', type: 'text', required: true },
    { name: 'floor', label: 'Floor', type: 'number', required: true },
    { name: 'capacity', label: 'Capacity', type: 'number', required: true },
    { name: 'roomType', label: 'Room Type', type: 'select', options: [
      { value: 'single', label: 'Single' },
      { value: 'double', label: 'Double' },
      { value: 'triple', label: 'Triple' },
      { value: 'quad', label: 'Quad' }
    ]},
    { name: 'monthlyRent', label: 'Monthly Rent', type: 'number' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'notes', label: 'Notes', type: 'textarea' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'available', label: 'Available' },
      { value: 'occupied', label: 'Occupied' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'reserved', label: 'Reserved' }
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
};

const HostelRooms = () => (
  <ListPage {...hostelRoomsConfig} />
);

export default HostelRooms;
