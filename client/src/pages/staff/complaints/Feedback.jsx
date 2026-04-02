import React from 'react';
import ListPage from '../shared/ListPage';

const getId = (row) => row?._id || row?.id;

export const complaintFeedbackConfig = {
  title: 'Complaint Feedback',
  subtitle: 'Manage feedback records with the same reusable complaints table and form system.',
  endpoint: '/staff/complaint-feedbacks',
  columns: [
    { key: 'complaint', header: 'Complaint', render: (value) => value?.complaintCode || value?.subject || '-' },
    { key: 'satisfactionLevel', header: 'Satisfaction Level' },
    { key: 'comments', header: 'Comments' },
    { key: 'feedbackDate', header: 'Feedback Date', render: (value) => value ? new Date(value).toISOString().slice(0, 10) : '-' }
  ],
  formFields: [
    { name: 'complaint', label: 'Complaint', type: 'relation', relationEndpoint: '/staff/complaints', relationValue: (row) => row._id || row.id, relationLabel: (row) => `${row.complaintCode || 'No Code'} - ${row.subject || 'Complaint'}` },
    { name: 'satisfactionLevel', label: 'Satisfaction Level', type: 'number' },
    { name: 'comments', label: 'Comments', type: 'textarea', rows: 4 },
    { name: 'feedbackDate', label: 'Feedback Date', type: 'date' }
  ],
  initialForm: { complaint: '', satisfactionLevel: 5, comments: '', feedbackDate: '' },
  mapFormToPayload: (form) => ({ ...form, satisfactionLevel: Number(form.satisfactionLevel || 5), feedbackDate: form.feedbackDate || null }),
  mapRowToForm: (row) => ({ complaint: row.complaint?._id || row.complaint || '', satisfactionLevel: row.satisfactionLevel ?? 5, comments: row.comments || '', feedbackDate: row.feedbackDate ? new Date(row.feedbackDate).toISOString().slice(0, 10) : '' })
};

const StaffComplaintFeedback = () => <ListPage title={complaintFeedbackConfig.title} subtitle={complaintFeedbackConfig.subtitle} endpoint={complaintFeedbackConfig.endpoint} columns={complaintFeedbackConfig.columns} createPath="/staff/complaints/feedback/create" editPathForRow={(row) => `/staff/complaints/feedback/edit/${getId(row)}`} viewPathForRow={(row) => `/staff/complaints/feedback/view/${getId(row)}`} searchPlaceholder="Search complaint feedback..." clientSidePagination={true} />;

export default StaffComplaintFeedback;
