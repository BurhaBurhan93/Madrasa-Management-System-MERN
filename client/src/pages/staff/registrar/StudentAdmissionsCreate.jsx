import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { studentAdmissionsConfig } from './StudentAdmissions';

const StudentAdmissionsCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  return (
    <FormPage
      titleCreate={t('registrar.studentAdmissions.create.titleCreate')}
      titleEdit={t('registrar.studentAdmissions.create.titleEdit')}
      endpoint={studentAdmissionsConfig.endpoint}
      formFields={studentAdmissionsConfig.formFields.map(f => ({
        ...f,
        label: t(`registrar.studentAdmissions.fields.${f.name}`),
        placeholder: f.placeholder ? t(`registrar.studentAdmissions.placeholders.${f.name}`) : undefined,
        options: f.options?.map(opt => ({ ...opt, label: t(`registrar.studentAdmissions.options.${f.name}.${opt.value}`) }))
      }))}
      initialForm={studentAdmissionsConfig.initialForm}
      mapRowToForm={studentAdmissionsConfig.mapRowToForm}
      mode="create"
      onSavedPath="/staff/registrar/admissions"
    />
  );
};

export default StudentAdmissionsCreate;
