import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { employeesConfig } from './Employees';

const EmployeeEdit = () => {
  const { id } = useParams();
  return <FormPage titleCreate="Create Employee" titleEdit="Edit Employee" endpoint={employeesConfig.endpoint} formFields={employeesConfig.formFields} initialForm={employeesConfig.initialForm} mapRowToForm={employeesConfig.mapRowToForm} mapFormToPayload={employeesConfig.mapFormToPayload} mode="edit" id={id} onSavedPath="/staff/hr/employees" />;
};

export default EmployeeEdit;
