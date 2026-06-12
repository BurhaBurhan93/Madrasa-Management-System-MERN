import React from 'react';
import ListPage from '../shared/ListPage';

const HostelRooms = () => (
  <ListPage
    title="Hostel Rooms"
    subtitle="Manage hostel rooms, buildings, and accommodation capacity"
    endpoint="/hostel/rooms"
    createPath="/staff/registrar/hostel-rooms/create"
    editPathForRow={(row) => `/staff/registrar/hostel-rooms/edit/${row._id}`}
    viewPathForRow={(row) => `/staff/registrar/hostel-rooms/view/${row._id}`}
    columns={[
      { key: 'roomNumber', header: 'Room Number' },
      { key: 'building', header: 'Building' },
      { key: 'floor', header: 'Floor' },
      { key: 'roomType', header: 'Type', render: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '-' },
      { key: 'capacity', header: 'Capacity' },
      { key: 'currentOccupancy', header: 'Occupied', render: (value, row) => `${value || 0} / ${row.capacity}` },
      { key: 'monthlyRent', header: 'Monthly Rent', render: (value) => `$${value || 0}` },
      { key: 'status', header: 'Status' }
    ]}
    searchPlaceholder="Search by room number or building..."
  />
);

export default HostelRooms;
