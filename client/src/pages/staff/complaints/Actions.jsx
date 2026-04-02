import React from 'react';
import ListPage from '../shared/ListPage';

const getId = (row) => row?._id || row?.id;

export const complaintActionsConfig = {
  title: 'Complaint Actions',
  subtitle: 'Manage complaint actions using the same consistent complaints workflow design.',
  endpoint: '/staff/complaint-actions',
  columns: [
    { key: 'complaint', header: 'Complaint', render: (value) => value?.complaintCode || value?.subject || '-' },
    { key: 'actionDescription', header: 'Action Description' },
    { key: 'actionResult', header: 'Action Result' },
    { key: 'followUpDate', header: 'Follow Up Date', render: (value) => value ? new Date(value).toISOString().slice(0, 10) : '-' },
    { key: 'nextActionRequired', header: 'Next Action Required', render: (value) => value ? 'Yes' : 'No' }
  ],
  formFields: [
    { name: 'complaint', label: 'Complaint', type: 'relation', relationEndpoint: '/staff/complaints', relationValue: (row) => row._id || row.id, relationLabel: (row) => `${row.complaintCode || 'No Code'} - ${row.subject || 'Complaint'}` },
    { name: 'actionDescription', label: 'Action Description', type: 'textarea', rows: 3 },
    { name: 'actionResult', label: 'Action Result', type: 'textarea', rows: 3 },
    { name: 'followUpDate', label: 'Follow Up Date', type: 'date' },
    { name: 'nextActionRequired', label: 'Next Action Required', type: 'select', options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' }
    ] }
  ],
  initialForm: { complaint: '', actionDescription: '', actionResult: '', followUpDate: '', nextActionRequired: 'false' },
  mapFormToPayload: (form) => ({ ...form, followUpDate: form.followUpDate || null, nextActionRequired: String(form.nextActionRequired) === 'true' }),
  mapRowToForm: (row) => ({ complaint: row.complaint?._id || row.complaint || '', actionDescription: row.actionDescription || '', actionResult: row.actionResult || '', followUpDate: row.followUpDate ? new Date(row.followUpDate).toISOString().slice(0, 10) : '', nextActionRequired: String(row.nextActionRequired ?? false) })
};

const StaffComplaintActions = () => <ListPage title={complaintActionsConfig.title} subtitle={complaintActionsConfig.subtitle} endpoint={complaintActionsConfig.endpoint} columns={complaintActionsConfig.columns} createPath="/staff/complaints/actions/create" editPathForRow={(row) => `/staff/complaints/actions/edit/${getId(row)}`} viewPathForRow={(row) => `/staff/complaints/actions/view/${getId(row)}`} searchPlaceholder="Search complaint actions..." clientSidePagination={true} />;

export default StaffComplaintActions;
