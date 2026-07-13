import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { employeesConfig } from './Employees';

const EmployeeEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return <FormPage titleCreate={t('staff.hr.employees.createTitle')} titleEdit={t('staff.hr.employees.editTitle')} endpoint={employeesConfig.endpoint} formFields={employeesConfig.formFields} initialForm={employeesConfig.initialForm} mapRowToForm={employeesConfig.mapRowToForm} mapFormToPayload={employeesConfig.mapFormToPayload} mode="edit" id={id} onSavedPath="/staff/hr/employees" />;
};

export default EmployeeEdit;
