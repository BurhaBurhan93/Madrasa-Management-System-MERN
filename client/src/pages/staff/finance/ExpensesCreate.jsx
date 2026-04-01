import React from 'react';
import FormPage from '../shared/FormPage';
import { expensesConfig } from './Expenses';

const ExpensesCreate = () => (
  <FormPage
    titleCreate="Create Expense"
    titleEdit="Edit Expense"
    endpoint={expensesConfig.endpoint}
    formFields={expensesConfig.formFields}
    initialForm={expensesConfig.initialForm}
    mapRowToForm={expensesConfig.mapRowToForm}
    mapFormToPayload={expensesConfig.mapFormToPayload}
    mode="create"
    onSavedPath="/staff/finance/expenses"
  />
);

export default ExpensesCreate;
