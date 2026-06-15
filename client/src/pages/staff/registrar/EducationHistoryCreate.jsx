import React from 'react';
import FormPage from '../shared/FormPage';
import { educationHistoryConfig } from './EducationHistory';

const EducationHistoryCreate = () => (
  <FormPage
    titleCreate="Create Education Record"
    titleEdit="Edit Education Record"
    endpoint={educationHistoryConfig.endpoint}
    formFields={educationHistoryConfig.formFields}
    initialForm={educationHistoryConfig.initialForm}
    mapRowToForm={educationHistoryConfig.mapRowToForm}
    mode="create"
    onSavedPath="/staff/registrar/education-history"
  />
);

export default EducationHistoryCreate;
