import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { leaveTypesConfig } from './LeaveTypeRegistration';

const LeaveTypeEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return <FormPage titleCreate={t('hr.leaveTypes.createTitle')} titleEdit={t('hr.leaveTypes.editTitle')} endpoint={leaveTypesConfig.endpoint} formFields={leaveTypesConfig.formFields} initialForm={leaveTypesConfig.initialForm} mapRowToForm={leaveTypesConfig.mapRowToForm} mapFormToPayload={leaveTypesConfig.mapFormToPayload} mode="edit" id={id} onSavedPath="/staff/hr/leave-types" />;
};

export default LeaveTypeEdit;
