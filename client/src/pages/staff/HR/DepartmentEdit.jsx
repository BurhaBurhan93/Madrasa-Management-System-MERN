import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { departmentsConfig } from './DepartmentRegistration';

const DepartmentEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return (
    <FormPage
      titleCreate={t('hr.departments.createTitle')}
      titleEdit={t('hr.departments.editTitle')}
      endpoint={departmentsConfig.endpoint}
      formFields={departmentsConfig.formFields}
      initialForm={departmentsConfig.initialForm}
      mapRowToForm={departmentsConfig.mapRowToForm}
      mode="edit"
      id={id}
      onSavedPath="/staff/hr/departments"
    />
  );
};

export default DepartmentEdit;
