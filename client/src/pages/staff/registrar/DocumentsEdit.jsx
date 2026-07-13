import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { documentsManagementConfig } from './DocumentsManagement';

const DocumentsEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
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
      mode="edit"
      id={id}
      onSavedPath="/staff/registrar/documents"
      readMode="collection"
      readEndpoint={documentsManagementConfig.endpoint}
    />
  );
};

export default DocumentsEdit;
