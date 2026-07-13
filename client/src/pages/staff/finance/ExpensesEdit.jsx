import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { expensesConfig } from './Expenses';

const ExpensesEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return (
    <FormPage
      titleCreate={t('staff.finance.expenses.create')}
      titleEdit={t('staff.finance.expenses.edit')}
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
