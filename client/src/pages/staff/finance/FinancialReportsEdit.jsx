import React from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FormPage from "../shared/FormPage";
import financialReportsConfig from "./financialReportsConfig";

const FinancialReportsEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return (
    <FormPage
      titleCreate={t('staff.finance.financialReports.create')}
      titleEdit={t('staff.finance.financialReports.edit')}
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
