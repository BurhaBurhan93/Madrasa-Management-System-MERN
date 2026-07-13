import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { salaryDeductionsConfig } from './SalaryDeductions';

const SalaryDeductionsCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  return (
    <FormPage
      titleCreate={t('staff.payroll.salaryDeductions.create.titleCreate')}
      titleEdit={t('staff.payroll.salaryDeductions.create.titleEdit')}
      endpoint={salaryDeductionsConfig.endpoint}
      formFields={salaryDeductionsConfig.formFields.map(field => ({
        ...field,
        label: t(`staff.payroll.salaryDeductions.fields.${field.name}`),
        options: field.options?.map(opt => ({ ...opt, label: t(`staff.payroll.salaryDeductions.options.${field.name}.${opt.value}`) }))
      }))}
      initialForm={salaryDeductionsConfig.initialForm}
      mapRowToForm={salaryDeductionsConfig.mapRowToForm}
      mapFormToPayload={salaryDeductionsConfig.mapFormToPayload}
      mode="create"
      onSavedPath="/staff/payroll/salary-deductions"
    />
  );
};

export default SalaryDeductionsCreate;
