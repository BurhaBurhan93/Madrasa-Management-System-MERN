import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { designationsConfig } from './DesignationRegistration';

const DesignationEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return <FormPage titleCreate={t('hr.designations.createTitle')} titleEdit={t('hr.designations.editTitle')} endpoint={designationsConfig.endpoint} formFields={designationsConfig.formFields} initialForm={designationsConfig.initialForm} mapRowToForm={designationsConfig.mapRowToForm} mapFormToPayload={designationsConfig.mapFormToPayload} mode="edit" id={id} onSavedPath="/staff/hr/designations" />;
};

export default DesignationEdit;
