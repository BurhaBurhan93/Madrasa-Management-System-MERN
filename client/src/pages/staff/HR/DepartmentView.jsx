import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { departmentsConfig } from './DepartmentRegistration';

const DepartmentView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return <RecordViewPage title={t('hr.departments.viewTitle')} subtitle={t('hr.departments.subtitle')} endpoint={departmentsConfig.endpoint} id={id} fields={departmentsConfig.formFields} listPath="/staff/hr/departments" editPath={`/staff/hr/departments/edit/${id}`} />;
};

export default DepartmentView;
