import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { salaryPaymentsConfig } from './SalaryPayments';

const SalaryPaymentsView = () => {
  const { id } = useParams();
  return <RecordViewPage title={salaryPaymentsConfig.title + ' Details'} subtitle={salaryPaymentsConfig.subtitle} endpoint={salaryPaymentsConfig.endpoint} id={id} fields={salaryPaymentsConfig.formFields} listPath="/staff/payroll/salary-payments" editPath={'/staff/payroll/salary-payments/edit/' + id} />;
};

export default SalaryPaymentsView;
