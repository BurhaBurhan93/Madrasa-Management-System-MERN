import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { salaryStructuresConfig } from './SalaryStructures';

const SalaryStructuresEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return (
    <FormPage
      titleCreate={t('staff.payroll.salaryStructures.create.titleCreate')}
      titleEdit={t('staff.payroll.salaryStructures.create.titleEdit')}
      endpoint={salaryStructuresConfig.endpoint}
      formFields={salaryStructuresConfig.formFields.map(field => ({
        ...field,
        label: t(`staff.payroll.salaryStructures.fields.${field.name}`),
        options: field.options?.map(opt => ({ ...opt, label: t(`staff.payroll.salaryStructures.options.${field.name}.${opt.value}`) }))
      }))}
      initialForm={salaryStructuresConfig.initialForm}
      mapRowToForm={salaryStructuresConfig.mapRowToForm}
      mapFormToPayload={salaryStructuresConfig.mapFormToPayload}
      mode="edit"
      id={id}
      onSavedPath="/staff/payroll/salary-structures"
    />
  );
};

export default SalaryStructuresEdit;
