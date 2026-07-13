import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { complaintActionsConfig } from './Actions';

const ComplaintActionsCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  return <FormPage titleCreate={t('staff.complaints.actionsCreate.titleCreate')} titleEdit={t('staff.complaints.actionsCreate.titleEdit')} endpoint={complaintActionsConfig.endpoint} formFields={complaintActionsConfig.formFields} initialForm={complaintActionsConfig.initialForm} mapRowToForm={complaintActionsConfig.mapRowToForm} mapFormToPayload={complaintActionsConfig.mapFormToPayload} mode="create" onSavedPath="/staff/complaints/actions" />;
};

export default ComplaintActionsCreate;
