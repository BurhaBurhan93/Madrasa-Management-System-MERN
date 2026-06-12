import React from 'react';
import ListPage from '../shared/ListPage';

const HostelAllocations = () => (
  <ListPage
    title="Hostel Allocations"
    subtitle="Manage student room assignments and hostel residency"
    endpoint="/hostel/allocations"
    createPath="/staff/registrar/hostel-allocations/create"
    editPathForRow={(row) => `/staff/registrar/hostel-allocations/edit/${row._id}`}
    viewPathForRow={(row) => `/staff/registrar/hostel-allocations/view/${row._id}`}
    columns={[
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
    ]}
    searchPlaceholder="Search by student name or room number..."
  />
);

export default HostelAllocations;
