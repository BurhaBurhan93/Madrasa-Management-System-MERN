import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { studentAdmissionsConfig } from './StudentAdmissions';

const StudentAdmissionsEdit = () => {
  const { id } = useParams();
  return (
    <FormPage
      titleCreate="Create Student Admission"
      titleEdit="Edit Student Admission"
      endpoint={studentAdmissionsConfig.endpoint}
      formFields={studentAdmissionsConfig.formFields}
      initialForm={studentAdmissionsConfig.initialForm}
      mapRowToForm={studentAdmissionsConfig.mapRowToForm}
      mode="edit"
      id={id}
      onSavedPath="/staff/registrar/admissions"
      readMode="collection"
      readEndpoint={studentAdmissionsConfig.endpoint}
    />
  );
};

export default StudentAdmissionsEdit;
