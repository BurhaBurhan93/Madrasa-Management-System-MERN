import React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';

const PayrollIndex = () => {
  const { t } = useTranslation(['staff', 'common']);
  return <Navigate to="/staff/payroll/salary-payments" replace />;
};

export default PayrollIndex;
