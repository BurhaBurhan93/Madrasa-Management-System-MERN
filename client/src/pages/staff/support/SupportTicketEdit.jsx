import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { supportTicketsConfig } from './SupportTickets';

const SupportTicketEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  return (
    <FormPage
      titleCreate={t('staff.support.tickets.createTitle', 'Create Support Ticket')}
      titleEdit={t('staff.support.tickets.editTitle', 'Edit Support Ticket')}
      endpoint={supportTicketsConfig.endpoint}
      formFields={supportTicketsConfig.formFields}
      initialForm={supportTicketsConfig.initialForm}
      mapFormToPayload={supportTicketsConfig.mapFormToPayload}
      mode="edit"
      onSavedPath="/staff/support/tickets"
    />
  );
};

export default SupportTicketEdit;
