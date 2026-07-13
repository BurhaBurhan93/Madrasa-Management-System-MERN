import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { complaintActionsConfig } from './Actions';

const ComplaintActionsEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return <FormPage titleCreate={t('staff.complaints.actionsCreate.titleCreate')} titleEdit={t('staff.complaints.actionsCreate.titleEdit')} endpoint={complaintActionsConfig.endpoint} formFields={complaintActionsConfig.formFields} initialForm={complaintActionsConfig.initialForm} mapRowToForm={complaintActionsConfig.mapRowToForm} mapFormToPayload={complaintActionsConfig.mapFormToPayload} mode="edit" id={id} onSavedPath="/staff/complaints/actions" />;
};

export default ComplaintActionsEdit;
