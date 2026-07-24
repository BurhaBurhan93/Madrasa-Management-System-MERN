import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { educationHistoryConfig } from './EducationHistory';

const EducationHistoryCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  return (
    <FormPage
      titleCreate={t('registrar.educationHistory.create.titleCreate')}
      titleEdit={t('registrar.educationHistory.create.titleEdit')}
      endpoint={educationHistoryConfig.endpoint}
      formFields={educationHistoryConfig.formFields.map(f => ({
        ...f,
        label: t(`registrar.educationHistory.fields.${f.name}`)
      }))}
      initialForm={educationHistoryConfig.initialForm}
      mapRowToForm={educationHistoryConfig.mapRowToForm}
      mode="create"
      onSavedPath="/staff/registrar/education-history"
    />
  );
};

export default EducationHistoryCreate;
