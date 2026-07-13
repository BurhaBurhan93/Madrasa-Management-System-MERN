import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { complaintActionsConfig } from './Actions';

const ComplaintActionsView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return <RecordViewPage title={t('staff.complaints.actionsView.title')} subtitle={t('staff.complaints.actions.subtitle')} endpoint={complaintActionsConfig.endpoint} id={id} fields={complaintActionsConfig.formFields} listPath="/staff/complaints/actions" editPath={`/staff/complaints/actions/edit/${id}`} />;
};

export default ComplaintActionsView;
