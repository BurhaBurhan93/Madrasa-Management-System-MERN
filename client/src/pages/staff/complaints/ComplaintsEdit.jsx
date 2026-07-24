import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { complaintsConfig } from './ComplaintsList';

const ComplaintsEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  const formFields = complaintsConfig.formFields.map(field => ({
    ...field,
    label: t(`staff.complaints.list.fields.${field.name}`),
    options: field.options?.map(opt => ({ ...opt, label: t(`staff.complaints.list.options.${field.name}.${opt.value}`) }))
  }));
  return <FormPage titleCreate={t('staff.complaints.complaintsEdit.titleCreate')} titleEdit={t('staff.complaints.complaintsEdit.titleEdit')} endpoint={complaintsConfig.endpoint} formFields={formFields} initialForm={complaintsConfig.initialForm} mapRowToForm={complaintsConfig.mapRowToForm} mapFormToPayload={complaintsConfig.mapFormToPayload} mode={id ? 'edit' : 'create'} id={id} onSavedPath="/staff/complaints" />;
};

export default ComplaintsEdit;
