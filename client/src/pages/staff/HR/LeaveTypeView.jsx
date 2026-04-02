import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { leaveTypesConfig } from './LeaveTypeRegistration';

const LeaveTypeView = () => {
  const { id } = useParams();
  return <RecordViewPage title="Leave Type Details" subtitle={leaveTypesConfig.subtitle} endpoint={leaveTypesConfig.endpoint} id={id} fields={leaveTypesConfig.formFields} listPath="/staff/hr/leave-types" editPath={`/staff/hr/leave-types/edit/${id}`} />;
};

export default LeaveTypeView;
