import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { educationHistoryConfig } from './EducationHistory';

const EducationHistoryEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return (
    <FormPage
      titleCreate={t('staff.registrar.educationHistory.create.titleCreate')}
      titleEdit={t('staff.registrar.educationHistory.create.titleEdit')}
      endpoint={educationHistoryConfig.endpoint}
      formFields={educationHistoryConfig.formFields.map(f => ({
        ...f,
        label: t(`staff.registrar.educationHistory.fields.${f.name}`)
      }))}
      initialForm={educationHistoryConfig.initialForm}
      mapRowToForm={educationHistoryConfig.mapRowToForm}
      mode="edit"
      id={id}
      onSavedPath="/staff/registrar/education-history"
      readMode="collection"
      readEndpoint={educationHistoryConfig.endpoint}
    />
  );
};

export default EducationHistoryEdit;
