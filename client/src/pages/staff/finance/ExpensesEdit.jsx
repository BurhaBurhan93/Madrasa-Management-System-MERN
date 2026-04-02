import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { expensesConfig } from './Expenses';

const ExpensesEdit = () => {
  const { id } = useParams();
  return (
    <FormPage
      titleCreate="Create Expense"
      titleEdit="Edit Expense"
      endpoint={expensesConfig.endpoint}
      formFields={expensesConfig.formFields}
      initialForm={expensesConfig.initialForm}
      mapRowToForm={expensesConfig.mapRowToForm}
      mapFormToPayload={expensesConfig.mapFormToPayload}
      mode="edit"
      id={id}
      onSavedPath="/staff/finance/expenses"
    />
  );
};

export default ExpensesEdit;
