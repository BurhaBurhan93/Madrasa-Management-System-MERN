import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { financialReportsConfig } from './FinancialReports';

const FinancialReportsView = () => {
  const { id } = useParams();
  return <RecordViewPage title={financialReportsConfig.title + ' Details'} subtitle={financialReportsConfig.subtitle} endpoint={financialReportsConfig.endpoint} id={id} fields={financialReportsConfig.formFields} listPath="/staff/finance/reports" editPath={'/staff/finance/reports/edit/' + id} />;
};

export default FinancialReportsView;
