import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RecordViewPage from '../shared/RecordViewPage';
import { expensesConfig } from './Expenses';

const ExpensesView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return <RecordViewPage title={t('staff.finance.expenses.details', { title: expensesConfig.title })} subtitle={expensesConfig.subtitle} endpoint={expensesConfig.endpoint} id={id} fields={expensesConfig.formFields} listPath="/staff/finance/expenses" editPath={'/staff/finance/expenses/edit/' + id} />;
};

export default ExpensesView;
