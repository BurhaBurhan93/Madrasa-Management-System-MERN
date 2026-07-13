import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import classManagementConfig from './classManagementConfig';

const ClassCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  return (
    <FormPage
      titleCreate={t('staff.registrar.classManagement.create.titleCreate')}
      titleEdit={t('staff.registrar.classManagement.create.titleEdit')}
      endpoint={classManagementConfig.endpoint}
      formFields={classManagementConfig.formFields.map(f => ({
        ...f,
        label: t(`staff.registrar.classManagement.fields.${f.name}`),
        placeholder: f.placeholder ? t(`staff.registrar.classManagement.placeholders.${f.name}`) : undefined,
        options: f.options?.map(opt => ({ ...opt, label: t(`staff.registrar.classManagement.options.${f.name}.${opt.value}`) }))
      }))}
      initialForm={classManagementConfig.initialForm}
      mapRowToForm={classManagementConfig.mapRowToForm}
      mapFormToPayload={classManagementConfig.mapFormToPayload}
      mode="create"
      onSavedPath="/staff/registrar/classes"
    />
  );
};

export default ClassCreate;
