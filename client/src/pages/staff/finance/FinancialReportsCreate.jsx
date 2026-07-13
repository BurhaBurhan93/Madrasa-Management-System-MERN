import React from "react";
import { useTranslation } from "react-i18next";
import FormPage from "../shared/FormPage";
import financialReportsConfig from "./financialReportsConfig";

const FinancialReportsCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  return (
    <FormPage
      titleCreate={t('staff.finance.financialReports.create')}
      titleEdit={t('staff.finance.financialReports.edit')}
      endpoint={financialReportsConfig.endpoint}
      formFields={financialReportsConfig.formFields}
      initialForm={financialReportsConfig.initialForm}
      mapRowToForm={financialReportsConfig.mapRowToForm}
      mapFormToPayload={financialReportsConfig.mapFormToPayload}
      mode="create"
      onSavedPath="/staff/finance/reports"
    />
  );
};

export default FinancialReportsCreate;
