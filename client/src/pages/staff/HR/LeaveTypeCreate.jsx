import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { leaveTypesConfig } from './LeaveTypeRegistration';

const LeaveTypeCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  return <FormPage titleCreate={t('hr.leaveTypes.createTitle')} titleEdit={t('hr.leaveTypes.editTitle')} endpoint={leaveTypesConfig.endpoint} formFields={leaveTypesConfig.formFields} initialForm={leaveTypesConfig.initialForm} mapRowToForm={leaveTypesConfig.mapRowToForm} mapFormToPayload={leaveTypesConfig.mapFormToPayload} mode="create" onSavedPath="/staff/hr/leave-types" />;
};

export default LeaveTypeCreate;
