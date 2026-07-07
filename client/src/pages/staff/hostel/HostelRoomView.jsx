import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { hostelRoomsConfig } from './HostelRooms';

const mapRowToView = (row) => ({
  ...row,
  roomType: row.roomType ? row.roomType.charAt(0).toUpperCase() + row.roomType.slice(1) : '-',
  amenities: row.amenities && row.amenities.length > 0 ? row.amenities.join(', ') : 'None'
});

const HostelRoomView = () => {
  const { id } = useParams();
  const fields = [
    { name: 'roomNumber', label: 'Room Number' },
    { name: 'building', label: 'Building' },
    { name: 'floor', label: 'Floor' },
    { name: 'roomType', label: 'Room Type' },
    { name: 'capacity', label: 'Capacity' },
    { name: 'currentOccupancy', label: 'Current Occupancy' },
    { name: 'monthlyRent', label: 'Monthly Rent', renderView: (value) => `$${value || 0}` },
    { name: 'amenities', label: 'Amenities' },
    { name: 'description', label: 'Description' },
    { name: 'notes', label: 'Notes' },
    { name: 'status', label: 'Status' }
  ];

  return (
    <RecordViewPage
      title="Hostel Room Details"
      subtitle="View hostel room information"
      endpoint={hostelRoomsConfig.endpoint}
      id={id}
      fields={fields}
      listPath="/staff/registrar/hostel-rooms"
      editPath={`/staff/registrar/hostel-rooms/edit/${id}`}
      readMode="collection"
      readEndpoint={hostelRoomsConfig.endpoint}
      mapRowToView={mapRowToView}
    />
  );
};

export default HostelRoomView;
