import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { salaryPaymentsConfig } from './SalaryPayments';

const SalaryPaymentsEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return (
    <FormPage
      titleCreate={t('staff.payroll.salaryPayments.create.titleCreate')}
      titleEdit={t('staff.payroll.salaryPayments.create.titleEdit')}
      endpoint={salaryPaymentsConfig.endpoint}
      formFields={salaryPaymentsConfig.formFields.map(field => ({
        ...field,
        label: t(`staff.payroll.salaryPayments.fields.${field.name}`),
        options: field.options?.map(opt => ({ ...opt, label: t(`staff.payroll.salaryPayments.options.${field.name}.${opt.value}`) }))
      }))}
      initialForm={salaryPaymentsConfig.initialForm}
      mapRowToForm={salaryPaymentsConfig.mapRowToForm}
      mapFormToPayload={salaryPaymentsConfig.mapFormToPayload}
      mode="edit"
      id={id}
      onSavedPath="/staff/payroll/salary-payments"
    />
  );
};

export default SalaryPaymentsEdit;
