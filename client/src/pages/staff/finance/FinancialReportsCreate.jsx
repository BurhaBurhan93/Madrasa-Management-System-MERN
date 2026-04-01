import React from 'react';
import FormPage from '../shared/FormPage';
import { financialReportsConfig } from './FinancialReports';

const FinancialReportsCreate = () => (
  <FormPage
    titleCreate="Create Financial Report"
    titleEdit="Edit Financial Report"
    endpoint={financialReportsConfig.endpoint}
    formFields={financialReportsConfig.formFields}
    initialForm={financialReportsConfig.initialForm}
    mapRowToForm={financialReportsConfig.mapRowToForm}
    mapFormToPayload={financialReportsConfig.mapFormToPayload}
    mode="create"
    onSavedPath="/staff/finance/reports"
  />
);

export default FinancialReportsCreate;
