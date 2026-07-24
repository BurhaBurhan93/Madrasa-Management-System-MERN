import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import classManagementConfig from './classManagementConfig';

const ClassView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return (
    <RecordViewPage
      title={t('registrar.classManagement.view.title')}
      subtitle={t('registrar.classManagement.subtitle')}
      endpoint={classManagementConfig.endpoint}
      id={id}
      fields={classManagementConfig.formFields.map(f => ({
        name: f.name,
        label: t(`registrar.classManagement.fields.${f.name}`)
      }))}
      listPath="/staff/registrar/classes"
      editPath={`/staff/registrar/classes/edit/${id}`}
    />
  );
};

export default ClassView;
