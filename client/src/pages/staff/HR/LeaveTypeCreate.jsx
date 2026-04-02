import React from 'react';
import FormPage from '../shared/FormPage';
import { leaveTypesConfig } from './LeaveTypeRegistration';

const LeaveTypeCreate = () => <FormPage titleCreate="Create Leave Type" titleEdit="Edit Leave Type" endpoint={leaveTypesConfig.endpoint} formFields={leaveTypesConfig.formFields} initialForm={leaveTypesConfig.initialForm} mapRowToForm={leaveTypesConfig.mapRowToForm} mapFormToPayload={leaveTypesConfig.mapFormToPayload} mode="create" onSavedPath="/staff/hr/leave-types" />;

export default LeaveTypeCreate;
