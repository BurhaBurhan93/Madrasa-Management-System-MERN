import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { studentProfilesConfig } from './StudentProfiles';

const StudentEdit = () => {
  const { id } = useParams();
  return (
    <FormPage
      titleCreate="Create Student"
      titleEdit="Edit Student"
      endpoint={studentProfilesConfig.endpoint}
      formFields={studentProfilesConfig.formFields}
      initialForm={studentProfilesConfig.initialForm}
      mapRowToForm={studentProfilesConfig.mapRowToForm}
      mapFormToPayload={studentProfilesConfig.mapFormToPayload}
      mode="edit"
      id={id}
      onSavedPath="/staff/registrar/students"
    />
  );
};

export default StudentEdit;
