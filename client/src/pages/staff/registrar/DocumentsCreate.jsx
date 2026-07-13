import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { documentsManagementConfig } from './DocumentsManagement';

const DocumentsCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  return (
    <FormPage
      titleCreate={t('staff.registrar.documentsManagement.create.titleCreate')}
      titleEdit={t('staff.registrar.documentsManagement.create.titleEdit')}
      endpoint={documentsManagementConfig.endpoint}
      formFields={documentsManagementConfig.formFields.map(f => ({
        ...f,
        label: t(`staff.registrar.documentsManagement.fields.${f.name}`),
        options: f.options?.map(opt => ({ ...opt, label: t(`staff.registrar.documentsManagement.options.${f.name}.${opt.value}`) }))
      }))}
      initialForm={documentsManagementConfig.initialForm}
      mapRowToForm={documentsManagementConfig.mapRowToForm}
      mode="create"
      onSavedPath="/staff/registrar/documents"
    />
  );
};

export default DocumentsCreate;
