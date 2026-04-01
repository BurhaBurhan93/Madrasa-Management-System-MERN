import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { salaryStructuresConfig } from './SalaryStructures';

const SalaryStructuresEdit = () => {
  const { id } = useParams();
  return (
    <FormPage
      titleCreate="Create Salary Structure"
      titleEdit="Edit Salary Structure"
      endpoint={salaryStructuresConfig.endpoint}
      formFields={salaryStructuresConfig.formFields}
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
