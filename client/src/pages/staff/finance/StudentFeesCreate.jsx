import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { studentFeesConfig } from './StudentFees';

const StudentFeesCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  return (
    <FormPage
      titleCreate={t('staff.finance.studentFees.create')}
      titleEdit={t('staff.finance.studentFees.edit')}
      endpoint={studentFeesConfig.endpoint}
      formFields={studentFeesConfig.formFields}
      initialForm={studentFeesConfig.initialForm}
      mapRowToForm={studentFeesConfig.mapRowToForm}
      mapFormToPayload={studentFeesConfig.mapFormToPayload}
      mode="create"
      onSavedPath="/staff/finance/student-fees"
    />
  );
};

export default StudentFeesCreate;
