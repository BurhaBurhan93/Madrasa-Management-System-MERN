import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { designationsConfig } from './DesignationRegistration';

const DesignationCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  return <FormPage titleCreate={t('staff.hr.designations.createTitle')} titleEdit={t('staff.hr.designations.editTitle')} endpoint={designationsConfig.endpoint} formFields={designationsConfig.formFields} initialForm={designationsConfig.initialForm} mapRowToForm={designationsConfig.mapRowToForm} mapFormToPayload={designationsConfig.mapFormToPayload} mode="create" onSavedPath="/staff/hr/designations" />;
};

export default DesignationCreate;
