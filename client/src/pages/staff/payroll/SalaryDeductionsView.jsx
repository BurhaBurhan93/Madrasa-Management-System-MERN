import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { salaryDeductionsConfig } from './SalaryDeductions';

const SalaryDeductionsView = () => {
  const { id } = useParams();
  return <RecordViewPage title={salaryDeductionsConfig.title + ' Details'} subtitle={salaryDeductionsConfig.subtitle} endpoint={salaryDeductionsConfig.endpoint} id={id} fields={salaryDeductionsConfig.formFields} listPath="/staff/payroll/salary-deductions" editPath={'/staff/payroll/salary-deductions/edit/' + id} />;
};

export default SalaryDeductionsView;
