import React from 'react';
import ListPage from '../shared/ListPage';

const getId = (row) => row?._id || row?.id;
const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const complaintsConfig = {
  title: 'Complaints',
  subtitle: 'Track complaint records with the same clean table, filters, and status workflow.',
  endpoint: '/staff/complaints',
  columns: [
    { key: 'complaintCode', header: 'Complaint Code' },
    { key: 'subject', header: 'Subject' },
    { key: 'complaintCategory', header: 'Category' },
    { key: 'priorityLevel', header: 'Priority' },
    { key: 'complaintStatus', header: 'Status' },
    { key: 'assignedTo', header: 'Assigned To', render: (value) => value?.name || '-' },
    { key: 'submittedDate', header: 'Submitted Date', render: (value, row) => value || row.createdAt ? new Date(value || row.createdAt).toISOString().slice(0, 10) : '-' }
  ],
  formFields: [
    { name: 'complaintCode', label: 'Complaint Code' },
    { name: 'subject', label: 'Subject' },
    { name: 'complaintCategory', label: 'Category' },
    { name: 'priorityLevel', label: 'Priority Level' },
    { name: 'complaintStatus', label: 'Complaint Status' },
    { name: 'description', label: 'Description', type: 'textarea', rows: 4 }
  ]
};

const StaffComplaintsList = () => (
  <ListPage
    title={complaintsConfig.title}
    subtitle={complaintsConfig.subtitle}
    endpoint={complaintsConfig.endpoint}
    columns={complaintsConfig.columns}
    viewPathForRow={(row) => `/staff/complaints/view/${getId(row)}`}
    searchPlaceholder="Search complaints..."
    clientSidePagination={true}
    deleteEnabled={false}
    extraActionItemsForRow={(row) => [
      row.complaintStatus !== 'in_progress' ? { label: 'Mark In Progress', className: 'text-amber-700 hover:bg-amber-50', onClick: async () => { await fetch(`${apiBase}/staff/complaints/${getId(row)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ status: 'in_progress' }) }); window.location.reload(); } } : null,
      row.complaintStatus !== 'closed' ? { label: 'Close Complaint', className: 'text-rose-700 hover:bg-rose-50', onClick: async () => { await fetch(`${apiBase}/staff/complaints/${getId(row)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ status: 'closed' }) }); window.location.reload(); } } : null
    ].filter(Boolean)}
  />
);

export default StaffComplaintsList;
