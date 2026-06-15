import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { educationHistoryConfig } from './EducationHistory';

const EducationHistoryEdit = () => {
  const { id } = useParams();
  return (
    <FormPage
      titleCreate="Create Education Record"
      titleEdit="Edit Education Record"
      endpoint={educationHistoryConfig.endpoint}
      formFields={educationHistoryConfig.formFields}
      initialForm={educationHistoryConfig.initialForm}
      mapRowToForm={educationHistoryConfig.mapRowToForm}
      mode="edit"
      id={id}
      onSavedPath="/staff/registrar/education-history"
      readMode="collection"
      readEndpoint={educationHistoryConfig.endpoint}
    />
  );
};

export default EducationHistoryEdit;
