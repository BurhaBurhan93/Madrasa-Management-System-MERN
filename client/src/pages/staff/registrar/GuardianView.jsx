import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { guardianManagementConfig } from './GuardianManagement';

const mapRowToView = (row) => ({
  ...row,
  student: `${row.student?.firstName || ''} ${row.student?.lastName || ''}`.trim() || row.student?.studentCode || row.student?._id || ''
});

const GuardianView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  const fields = guardianManagementConfig.formFields.map((field) => ({ name: field.name, label: t(`registrar.guardianManagement.fields.${field.name}`) }));

  return (
    <RecordViewPage
      title={t('registrar.guardianManagement.view.title')}
      subtitle={t('registrar.guardianManagement.view.subtitle')}
      endpoint={guardianManagementConfig.endpoint}
      id={id}
      fields={fields}
      listPath="/staff/registrar/guardians"
      editPath={`/staff/registrar/guardians/edit/${id}`}
      readMode="collection"
      readEndpoint={guardianManagementConfig.endpoint}
      mapRowToView={mapRowToView}
    />
  );
};

export default GuardianView;
