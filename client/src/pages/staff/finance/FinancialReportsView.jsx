import React from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import RecordViewPage from "../shared/RecordViewPage";
import financialReportsConfig from "./financialReportsConfig";

const FinancialReportsView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  const resolvedTitle = t(financialReportsConfig.title);
  return (
    <RecordViewPage
      title={t('finance.financialReports.details', { title: resolvedTitle })}
      subtitle={financialReportsConfig.subtitle}
      endpoint={financialReportsConfig.endpoint}
      id={id}
      fields={financialReportsConfig.formFields}
      listPath="/staff/finance/reports"
      editPath={"/staff/finance/reports/edit/" + id}
    />
  );
};

export default FinancialReportsView;
