import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { hostelAllocationsConfig } from './HostelAllocations';

const mapRowToView = (row) => ({
  ...row,
  student: `${row.student?.firstName || ''} ${row.student?.lastName || ''}`.trim() || row.student?.studentCode || '-',
  room: row.room ? `${row.room.roomNumber || ''} (${row.room.building || ''})`.trim() : '-',
  emergencyContact_name: row.emergencyContact?.name || '',
  emergencyContact_relationship: row.emergencyContact?.relationship || '',
  emergencyContact_phone: row.emergencyContact?.phone || '',
  emergencyContact_email: row.emergencyContact?.email || ''
});

const HostelAllocationView = () => {
  const { id } = useParams();
  const fields = [
    { name: 'student', label: 'Student' },
    { name: 'room', label: 'Room' },
    { name: 'bedNumber', label: 'Bed Number' },
    { name: 'checkInDate', label: 'Check-in Date', renderView: (value) => value ? new Date(value).toLocaleDateString() : '-' },
    { name: 'expectedCheckOutDate', label: 'Expected Check-out', renderView: (value) => value ? new Date(value).toLocaleDateString() : '-' },
    { name: 'monthlyRent', label: 'Monthly Rent', renderView: (value) => `$${value || 0}` },
    { name: 'securityDeposit', label: 'Security Deposit', renderView: (value) => `$${value || 0}` },
    { name: 'status', label: 'Status' },
    { name: 'emergencyContact_name', label: 'Emergency Contact Name' },
    { name: 'emergencyContact_relationship', label: 'Emergency Contact Relationship' },
    { name: 'emergencyContact_phone', label: 'Emergency Contact Phone' },
    { name: 'emergencyContact_email', label: 'Emergency Contact Email' },
    { name: 'notes', label: 'Notes' }
  ];

  return (
    <RecordViewPage
      title="Hostel Allocation Details"
      subtitle="View student hostel allocation information"
      endpoint={hostelAllocationsConfig.endpoint}
      id={id}
      fields={fields}
      listPath="/staff/registrar/hostel"
      editPath={`/staff/registrar/hostel-allocations/edit/${id}`}
      readMode="collection"
      readEndpoint={hostelAllocationsConfig.endpoint}
      mapRowToView={mapRowToView}
    />
  );
};

export default HostelAllocationView;
