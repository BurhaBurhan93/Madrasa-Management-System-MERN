import React from 'react';
import RecordViewPage from '../shared/RecordViewPage';
import { supportTicketsConfig } from './SupportTickets';

const SupportTicketView = () => (
  <RecordViewPage
    endpoint={supportTicketsConfig.endpoint}
    title="Support Ticket"
    listPath="/staff/support/tickets"
    editPathForRow={(row) => `/staff/support/tickets/edit/${row._id}`}
    fields={[
      { key: 'ticketNumber', label: 'Ticket #' },
      { key: 'subject', label: 'Subject' },
      { key: 'description', label: 'Description' },
      { key: 'category', label: 'Category' },
      { key: 'priority', label: 'Priority' },
      { key: 'status', label: 'Status' },
      { key: 'resolution', label: 'Resolution' },
      { key: 'createdAt', label: 'Created' },
      { key: 'updatedAt', label: 'Updated' },
    ]}
  />
);

export default SupportTicketView;
