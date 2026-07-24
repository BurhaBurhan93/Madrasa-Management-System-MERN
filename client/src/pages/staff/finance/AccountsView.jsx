import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RecordViewPage from '../shared/RecordViewPage';
import { accountsConfig } from './Accounts';

const AccountsView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  const resolvedTitle = t(accountsConfig.title);
  return <RecordViewPage title={t('finance.accounts.details', { title: resolvedTitle })} subtitle={accountsConfig.subtitle} endpoint={accountsConfig.endpoint} id={id} fields={accountsConfig.formFields} listPath="/staff/finance/accounts" editPath={'/staff/finance/accounts/edit/' + id} />;
};

export default AccountsView;
