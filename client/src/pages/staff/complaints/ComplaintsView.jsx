import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { complaintsConfig } from './ComplaintsList';

const ComplaintsView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  const fields = complaintsConfig.formFields.map(f => ({ name: f.name, label: t(`staff.complaints.list.fields.${f.name}`), type: f.type }));
  return <RecordViewPage title={t('staff.complaints.complaintsView.title')} subtitle={t('staff.complaints.list.subtitle')} endpoint={complaintsConfig.endpoint} id={id} fields={fields} listPath="/staff/complaints" />;
};

export default ComplaintsView;
