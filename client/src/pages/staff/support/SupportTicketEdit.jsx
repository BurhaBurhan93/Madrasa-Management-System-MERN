import React from 'react';
import FormPage from '../shared/FormPage';
import { supportTicketsConfig } from './SupportTickets';

const SupportTicketEdit = () => (
  <FormPage
    titleCreate="Create Support Ticket"
    titleEdit="Edit Support Ticket"
    endpoint={supportTicketsConfig.endpoint}
    formFields={supportTicketsConfig.formFields}
    initialForm={supportTicketsConfig.initialForm}
    mapFormToPayload={supportTicketsConfig.mapFormToPayload}
    mode="edit"
    onSavedPath="/staff/support/tickets"
  />
);

export default SupportTicketEdit;
