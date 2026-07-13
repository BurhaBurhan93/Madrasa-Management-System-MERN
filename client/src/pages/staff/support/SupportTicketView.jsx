import React from 'react';
import { useTranslation } from 'react-i18next';
import RecordViewPage from '../shared/RecordViewPage';
import { supportTicketsConfig } from './SupportTickets';

const SupportTicketView = () => {
  const { t } = useTranslation(['staff', 'common']);
  return (
    <RecordViewPage
      endpoint={supportTicketsConfig.endpoint}
      title={t('staff.support.tickets.viewTitle', 'Support Ticket')}
      listPath="/staff/support/tickets"
      editPathForRow={(row) => `/staff/support/tickets/edit/${row._id}`}
      fields={[
        { key: 'ticketNumber', label: t('staff.support.tickets.ticketNumber', 'Ticket #') },
        { key: 'subject', label: t('staff.support.tickets.subject', 'Subject') },
        { key: 'description', label: t('staff.support.tickets.description', 'Description') },
        { key: 'category', label: t('staff.support.tickets.category', 'Category') },
        { key: 'priority', label: t('staff.support.tickets.priority', 'Priority') },
        { key: 'status', label: t('staff.support.tickets.status', 'Status') },
        { key: 'resolution', label: t('staff.support.tickets.resolution', 'Resolution') },
        { key: 'createdAt', label: t('staff.support.tickets.createdAt', 'Created') },
        { key: 'updatedAt', label: t('staff.support.tickets.updatedAt', 'Updated') },
      ]}
    />
  );
};

export default SupportTicketView;
