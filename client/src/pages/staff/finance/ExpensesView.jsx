import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { expensesConfig } from './Expenses';

const ExpensesView = () => {
  const { id } = useParams();
  return <RecordViewPage title={expensesConfig.title + ' Details'} subtitle={expensesConfig.subtitle} endpoint={expensesConfig.endpoint} id={id} fields={expensesConfig.formFields} listPath="/staff/finance/expenses" editPath={'/staff/finance/expenses/edit/' + id} />;
};

export default ExpensesView;
