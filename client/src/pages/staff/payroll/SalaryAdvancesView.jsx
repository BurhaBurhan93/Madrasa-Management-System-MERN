import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { salaryAdvancesConfig } from './SalaryAdvances';

const SalaryAdvancesView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return <RecordViewPage title={t('staff.payroll.salaryAdvances.view.details')} subtitle={t('staff.payroll.salaryAdvances.subtitle')} endpoint={salaryAdvancesConfig.endpoint} id={id} fields={salaryAdvancesConfig.formFields.map(f => ({ name: f.name, label: t(`staff.payroll.salaryAdvances.fields.${f.name}`), type: f.type }))} listPath="/staff/payroll/salary-advances" editPath={'/staff/payroll/salary-advances/edit/' + id} />;
};

export default SalaryAdvancesView;
