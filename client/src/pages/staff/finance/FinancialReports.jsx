import React from "react";
import ListPage from "../shared/ListPage";
import financialReportsConfig from "./financialReportsConfig";

const FinancialReports = () => (
  <ListPage
    title={financialReportsConfig.title}
    subtitle={financialReportsConfig.subtitle}
    endpoint={financialReportsConfig.endpoint}
    columns={financialReportsConfig.columns}
    createPath="/staff/finance/reports/create"
    editPathForRow={(row) => `/staff/finance/reports/edit/${row._id}`}
    viewPathForRow={(row) => "/staff/finance/reports/view/" + row._id}
    searchPlaceholder="Search reports..."
  />
);

export default FinancialReports;
