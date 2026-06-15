import React from 'react';
import FormPage from '../shared/FormPage';
import { studentAdmissionsConfig } from './StudentAdmissions';

const StudentAdmissionsCreate = () => (
  <FormPage
    titleCreate="Create Student Admission"
    titleEdit="Edit Student Admission"
    endpoint={studentAdmissionsConfig.endpoint}
    formFields={studentAdmissionsConfig.formFields}
    initialForm={studentAdmissionsConfig.initialForm}
    mapRowToForm={studentAdmissionsConfig.mapRowToForm}
    mode="create"
    onSavedPath="/staff/registrar/admissions"
  />
);

export default StudentAdmissionsCreate;
