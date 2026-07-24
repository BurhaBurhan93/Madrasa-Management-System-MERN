import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { leaveTypesConfig } from './LeaveTypeRegistration';

const LeaveTypeView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return <RecordViewPage title={t('hr.leaveTypes.viewTitle')} subtitle={t('hr.leaveTypes.subtitle')} endpoint={leaveTypesConfig.endpoint} id={id} fields={leaveTypesConfig.formFields} listPath="/staff/hr/leave-types" editPath={`/staff/hr/leave-types/edit/${id}`} />;
};

export default LeaveTypeView;
