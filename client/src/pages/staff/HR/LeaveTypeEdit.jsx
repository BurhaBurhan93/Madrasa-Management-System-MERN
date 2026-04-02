import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { leaveTypesConfig } from './LeaveTypeRegistration';

const LeaveTypeEdit = () => {
  const { id } = useParams();
  return <FormPage titleCreate="Create Leave Type" titleEdit="Edit Leave Type" endpoint={leaveTypesConfig.endpoint} formFields={leaveTypesConfig.formFields} initialForm={leaveTypesConfig.initialForm} mapRowToForm={leaveTypesConfig.mapRowToForm} mapFormToPayload={leaveTypesConfig.mapFormToPayload} mode="edit" id={id} onSavedPath="/staff/hr/leave-types" />;
};

export default LeaveTypeEdit;
