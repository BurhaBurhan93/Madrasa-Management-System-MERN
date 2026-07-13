import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { complaintsConfig } from './ComplaintsList';

const ComplaintsEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return <FormPage titleCreate={t('staff.complaints.complaintsEdit.titleCreate')} titleEdit={t('staff.complaints.complaintsEdit.titleEdit')} endpoint={complaintsConfig.endpoint} formFields={complaintsConfig.formFields} initialForm={complaintsConfig.initialForm} mapRowToForm={complaintsConfig.mapRowToForm} mapFormToPayload={complaintsConfig.mapFormToPayload} mode={id ? 'edit' : 'create'} id={id} onSavedPath="/staff/complaints" />;
};

export default ComplaintsEdit;
