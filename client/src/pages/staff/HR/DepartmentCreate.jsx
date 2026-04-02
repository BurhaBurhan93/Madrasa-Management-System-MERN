import React from 'react';
import FormPage from '../shared/FormPage';
import { departmentsConfig } from './DepartmentRegistration';

const DepartmentCreate = () => (
  <FormPage
    titleCreate="Create Department"
    titleEdit="Edit Department"
    endpoint={departmentsConfig.endpoint}
    formFields={departmentsConfig.formFields}
    initialForm={departmentsConfig.initialForm}
    mapRowToForm={departmentsConfig.mapRowToForm}
    mode="create"
    onSavedPath="/staff/hr/departments"
  />
);

export default DepartmentCreate;
