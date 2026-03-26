import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { studentFeesConfig } from './StudentFees';

const StudentFeesEdit = () => {
  const { id } = useParams();
  return (
    <FormPage
      titleCreate="Create Student Fee"
      titleEdit="Edit Student Fee"
      endpoint={studentFeesConfig.endpoint}
      formFields={studentFeesConfig.formFields}
      initialForm={studentFeesConfig.initialForm}
      mapRowToForm={studentFeesConfig.mapRowToForm}
      mapFormToPayload={studentFeesConfig.mapFormToPayload}
      mode="edit"
      id={id}
      onSavedPath="/staff/finance/student-fees"
    />
  );
};

export default StudentFeesEdit;
