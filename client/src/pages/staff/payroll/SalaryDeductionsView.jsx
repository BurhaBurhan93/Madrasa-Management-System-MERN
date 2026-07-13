import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { salaryDeductionsConfig } from './SalaryDeductions';

const SalaryDeductionsView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return <RecordViewPage title={t('staff.payroll.salaryDeductions.view.details')} subtitle={t('staff.payroll.salaryDeductions.subtitle')} endpoint={salaryDeductionsConfig.endpoint} id={id} fields={salaryDeductionsConfig.formFields.map(f => ({ name: f.name, label: t(`staff.payroll.salaryDeductions.fields.${f.name}`), type: f.type }))} listPath="/staff/payroll/salary-deductions" editPath={'/staff/payroll/salary-deductions/edit/' + id} />;
};

export default SalaryDeductionsView;
