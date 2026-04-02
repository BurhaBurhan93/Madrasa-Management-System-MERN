import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { salaryAdvancesConfig } from './SalaryAdvances';

const SalaryAdvancesView = () => {
  const { id } = useParams();
  return <RecordViewPage title={salaryAdvancesConfig.title + ' Details'} subtitle={salaryAdvancesConfig.subtitle} endpoint={salaryAdvancesConfig.endpoint} id={id} fields={salaryAdvancesConfig.formFields} listPath="/staff/payroll/salary-advances" editPath={'/staff/payroll/salary-advances/edit/' + id} />;
};

export default SalaryAdvancesView;
