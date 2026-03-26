import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { financialReportsConfig } from './FinancialReports';

const FinancialReportsEdit = () => {
  const { id } = useParams();
  return (
    <FormPage
      titleCreate="Create Financial Report"
      titleEdit="Edit Financial Report"
      endpoint={financialReportsConfig.endpoint}
      formFields={financialReportsConfig.formFields}
      initialForm={financialReportsConfig.initialForm}
      mapRowToForm={financialReportsConfig.mapRowToForm}
      mapFormToPayload={financialReportsConfig.mapFormToPayload}
      mode="edit"
      id={id}
      onSavedPath="/staff/finance/reports"
    />
  );
};

export default FinancialReportsEdit;
