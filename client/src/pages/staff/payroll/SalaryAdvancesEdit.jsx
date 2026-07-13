import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { salaryAdvancesConfig } from './SalaryAdvances';

const SalaryAdvancesEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return (
    <FormPage
      titleCreate={t('staff.payroll.salaryAdvances.create.titleCreate')}
      titleEdit={t('staff.payroll.salaryAdvances.create.titleEdit')}
      endpoint={salaryAdvancesConfig.endpoint}
      formFields={salaryAdvancesConfig.formFields.map(field => ({
        ...field,
        label: t(`staff.payroll.salaryAdvances.fields.${field.name}`),
        options: field.options?.map(opt => ({ ...opt, label: t(`staff.payroll.salaryAdvances.options.${field.name}.${opt.value}`) }))
      }))}
      initialForm={salaryAdvancesConfig.initialForm}
      mapRowToForm={salaryAdvancesConfig.mapRowToForm}
      mapFormToPayload={salaryAdvancesConfig.mapFormToPayload}
      mode="edit"
      id={id}
      onSavedPath="/staff/payroll/salary-advances"
    />
  );
};

export default SalaryAdvancesEdit;
