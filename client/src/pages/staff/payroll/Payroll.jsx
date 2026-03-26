import React from 'react';
import { Navigate } from 'react-router-dom';

const PayrollIndex = () => {
  return <Navigate to="/staff/payroll/salary-payments" replace />;
};

export default PayrollIndex;
