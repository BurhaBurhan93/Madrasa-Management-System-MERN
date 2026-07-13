import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { departmentsConfig } from './DepartmentRegistration';

const DepartmentCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  return (
    <FormPage
      titleCreate={t('staff.hr.departments.createTitle')}
      titleEdit={t('staff.hr.departments.editTitle')}
      endpoint={departmentsConfig.endpoint}
      formFields={departmentsConfig.formFields}
      initialForm={departmentsConfig.initialForm}
      mapRowToForm={departmentsConfig.mapRowToForm}
      mode="create"
      onSavedPath="/staff/hr/departments"
    />
  );
};

export default DepartmentCreate;
