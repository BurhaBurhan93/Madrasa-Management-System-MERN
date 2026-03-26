import React from 'react';
import FormPage from '../shared/FormPage';
import { studentFeesConfig } from './StudentFees';

const StudentFeesCreate = () => (
  <FormPage
    titleCreate="Create Student Fee"
    titleEdit="Edit Student Fee"
    endpoint={studentFeesConfig.endpoint}
    formFields={studentFeesConfig.formFields}
    initialForm={studentFeesConfig.initialForm}
    mapRowToForm={studentFeesConfig.mapRowToForm}
    mapFormToPayload={studentFeesConfig.mapFormToPayload}
    mode="create"
    onSavedPath="/staff/finance/student-fees"
  />
);

export default StudentFeesCreate;
