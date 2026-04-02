import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { salaryStructuresConfig } from './SalaryStructures';

const SalaryStructuresView = () => {
  const { id } = useParams();
  return <RecordViewPage title={salaryStructuresConfig.title + ' Details'} subtitle={salaryStructuresConfig.subtitle} endpoint={salaryStructuresConfig.endpoint} id={id} fields={salaryStructuresConfig.formFields} listPath="/staff/payroll/salary-structures" editPath={'/staff/payroll/salary-structures/edit/' + id} />;
};

export default SalaryStructuresView;
