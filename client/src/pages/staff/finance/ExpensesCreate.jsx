import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { expensesConfig } from './Expenses';

const ExpensesCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  return (
    <FormPage
      titleCreate={t('staff.finance.expenses.create')}
      titleEdit={t('staff.finance.expenses.edit')}
      endpoint={expensesConfig.endpoint}
      formFields={expensesConfig.formFields}
      initialForm={expensesConfig.initialForm}
      mapRowToForm={expensesConfig.mapRowToForm}
      mapFormToPayload={expensesConfig.mapFormToPayload}
      mode="create"
      onSavedPath="/staff/finance/expenses"
    />
  );
};

export default ExpensesCreate;
