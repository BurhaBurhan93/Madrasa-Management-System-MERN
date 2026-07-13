import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RecordViewPage from '../shared/RecordViewPage';
import { studentFeesConfig } from './StudentFees';

const StudentFeesView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return <RecordViewPage title={t('staff.finance.studentFees.details', { title: studentFeesConfig.title })} subtitle={studentFeesConfig.subtitle} endpoint={studentFeesConfig.endpoint} id={id} fields={studentFeesConfig.formFields} listPath="/staff/finance/student-fees" editPath={'/staff/finance/student-fees/edit/' + id} />;
};

export default StudentFeesView;
