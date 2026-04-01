import React from 'react';
import { Navigate } from 'react-router-dom';

const FinanceIndex = () => {
  return <Navigate to="/staff/finance/transactions" replace />;
};

export default FinanceIndex;
