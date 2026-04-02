import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { departmentsConfig } from './DepartmentRegistration';

const DepartmentEdit = () => {
  const { id } = useParams();
  return (
    <FormPage
      titleCreate="Create Department"
      titleEdit="Edit Department"
      endpoint={departmentsConfig.endpoint}
      formFields={departmentsConfig.formFields}
      initialForm={departmentsConfig.initialForm}
      mapRowToForm={departmentsConfig.mapRowToForm}
      mode="edit"
      id={id}
      onSavedPath="/staff/hr/departments"
    />
  );
};

export default DepartmentEdit;
