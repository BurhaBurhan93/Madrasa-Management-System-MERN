import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { complaintsConfig } from './ComplaintsList';

const ComplaintsView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return <RecordViewPage title={t('staff.complaints.complaintsView.title')} subtitle={t('staff.complaints.list.subtitle')} endpoint={complaintsConfig.endpoint} id={id} fields={complaintsConfig.formFields} listPath="/staff/complaints" />;
};

export default ComplaintsView;
