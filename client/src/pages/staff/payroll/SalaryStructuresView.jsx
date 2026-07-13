import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { salaryStructuresConfig } from './SalaryStructures';

const SalaryStructuresView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return <RecordViewPage title={t('staff.payroll.salaryStructures.view.details')} subtitle={t('staff.payroll.salaryStructures.subtitle')} endpoint={salaryStructuresConfig.endpoint} id={id} fields={salaryStructuresConfig.formFields.map(f => ({ name: f.name, label: t(`staff.payroll.salaryStructures.fields.${f.name}`), type: f.type }))} listPath="/staff/payroll/salary-structures" editPath={'/staff/payroll/salary-structures/edit/' + id} />;
};

export default SalaryStructuresView;
