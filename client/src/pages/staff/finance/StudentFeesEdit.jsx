import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { studentFeesConfig } from './StudentFees';

const StudentFeesEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return (
    <FormPage
      titleCreate={t('staff.finance.studentFees.create')}
      titleEdit={t('staff.finance.studentFees.edit')}
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
