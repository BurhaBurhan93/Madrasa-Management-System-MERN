import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { educationHistoryConfig } from './EducationHistory';

const mapRowToView = (row) => ({
  ...row,
  student: `${row.student?.firstName || ''} ${row.student?.lastName || ''}`.trim() || row.student?.studentCode || row.student?._id || ''
});

const EducationHistoryView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  const fields = educationHistoryConfig.formFields.map((field) => ({ name: field.name, label: t(`staff.registrar.educationHistory.fields.${field.name}`) }));

  return (
    <RecordViewPage
      title={t('staff.registrar.educationHistory.view.title')}
      subtitle={t('staff.registrar.educationHistory.view.subtitle')}
      endpoint={educationHistoryConfig.endpoint}
      id={id}
      fields={fields}
      listPath="/staff/registrar/education-history"
      editPath={`/staff/registrar/education-history/edit/${id}`}
      readMode="collection"
      readEndpoint={educationHistoryConfig.endpoint}
      mapRowToView={mapRowToView}
    />
  );
};

export default EducationHistoryView;
