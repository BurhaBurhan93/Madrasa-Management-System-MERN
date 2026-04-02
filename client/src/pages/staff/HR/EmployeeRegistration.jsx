import React from 'react';
import FormPage from '../shared/FormPage';
import { employeesConfig } from './Employees';

const EmployeeRegistration = () => (
  <FormPage titleCreate="Create Employee" titleEdit="Edit Employee" endpoint={employeesConfig.endpoint} formFields={employeesConfig.formFields} initialForm={employeesConfig.initialForm} mapRowToForm={employeesConfig.mapRowToForm} mapFormToPayload={employeesConfig.mapFormToPayload} mode="create" onSavedPath="/staff/hr/employees" />
);

export default EmployeeRegistration;
