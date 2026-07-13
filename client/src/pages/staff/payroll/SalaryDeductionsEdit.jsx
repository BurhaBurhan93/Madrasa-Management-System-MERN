import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { salaryDeductionsConfig } from './SalaryDeductions';

const SalaryDeductionsEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
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
      mode="edit"
      id={id}
      onSavedPath="/staff/payroll/salary-deductions"
    />
  );
};

export default SalaryDeductionsEdit;
