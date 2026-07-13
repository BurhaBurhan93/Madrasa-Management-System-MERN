import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { studentProfilesConfig } from './StudentProfiles';

const StudentEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return (
    <FormPage
      titleCreate={t('staff.registrar.studentProfiles.create.titleCreate')}
      titleEdit={t('staff.registrar.studentProfiles.create.titleEdit')}
      endpoint={studentProfilesConfig.endpoint}
      formFields={studentProfilesConfig.formFields.map(f => ({
        ...f,
        label: t(`staff.registrar.studentProfiles.fields.${f.name}`),
        options: f.options?.map(opt => ({ ...opt, label: t(`staff.registrar.studentProfiles.options.${f.name}.${opt.value}`) }))
      }))}
      initialForm={studentProfilesConfig.initialForm}
      mapRowToForm={studentProfilesConfig.mapRowToForm}
      mapFormToPayload={studentProfilesConfig.mapFormToPayload}
      mode="edit"
      id={id}
      onSavedPath="/staff/registrar/students"
    />
  );
};

export default StudentEdit;
