import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { salaryPaymentsConfig } from './SalaryPayments';

const SalaryPaymentsView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return <RecordViewPage title={t('staff.payroll.salaryPayments.view.details')} subtitle={t('staff.payroll.salaryPayments.subtitle')} endpoint={salaryPaymentsConfig.endpoint} id={id} fields={salaryPaymentsConfig.formFields.map(f => ({ name: f.name, label: t(`staff.payroll.salaryPayments.fields.${f.name}`), type: f.type }))} listPath="/staff/payroll/salary-payments" editPath={'/staff/payroll/salary-payments/edit/' + id} />;
};

export default SalaryPaymentsView;
