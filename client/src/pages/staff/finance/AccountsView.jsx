import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RecordViewPage from '../shared/RecordViewPage';
import { accountsConfig } from './Accounts';

const AccountsView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return <RecordViewPage title={t('staff.finance.accounts.details', { title: accountsConfig.title })} subtitle={accountsConfig.subtitle} endpoint={accountsConfig.endpoint} id={id} fields={accountsConfig.formFields} listPath="/staff/finance/accounts" editPath={'/staff/finance/accounts/edit/' + id} />;
};

export default AccountsView;
