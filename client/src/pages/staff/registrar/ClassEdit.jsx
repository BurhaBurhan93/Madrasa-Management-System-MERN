import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import classManagementConfig from './classManagementConfig';

const ClassEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return (
    <FormPage
      titleCreate={t('registrar.classManagement.create.titleCreate')}
      titleEdit={t('registrar.classManagement.create.titleEdit')}
      endpoint={classManagementConfig.endpoint}
      formFields={classManagementConfig.formFields.map(f => ({
        ...f,
        label: t(`registrar.classManagement.fields.${f.name}`),
        placeholder: f.placeholder ? t(`registrar.classManagement.placeholders.${f.name}`) : undefined,
        options: f.options?.map(opt => ({ ...opt, label: t(`registrar.classManagement.options.${f.name}.${opt.value}`) }))
      }))}
      initialForm={classManagementConfig.initialForm}
      mapRowToForm={classManagementConfig.mapRowToForm}
      mapFormToPayload={classManagementConfig.mapFormToPayload}
      mode="edit"
      id={id}
      onSavedPath="/staff/registrar/classes"
    />
  );
};

export default ClassEdit;
