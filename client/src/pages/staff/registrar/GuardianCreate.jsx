import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { guardianManagementConfig } from './GuardianManagement';

const GuardianCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  return (
    <FormPage
      titleCreate={t('registrar.guardianManagement.create.titleCreate')}
      titleEdit={t('registrar.guardianManagement.create.titleEdit')}
      endpoint={guardianManagementConfig.endpoint}
      formFields={guardianManagementConfig.formFields.map(f => ({
        ...f,
        label: t(`registrar.guardianManagement.fields.${f.name}`),
        options: f.options?.map(opt => ({ ...opt, label: t(`registrar.guardianManagement.options.${f.name}.${opt.value}`) }))
      }))}
      initialForm={guardianManagementConfig.initialForm}
      mapRowToForm={guardianManagementConfig.mapRowToForm}
      mapFormToPayload={guardianManagementConfig.mapFormToPayload}
      mode="create"
      onSavedPath="/staff/registrar/guardians"
    />
  );
};

export default GuardianCreate;
