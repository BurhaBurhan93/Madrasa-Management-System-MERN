import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { accountsConfig } from './Accounts';

const AccountsView = () => {
  const { id } = useParams();
  return <RecordViewPage title={accountsConfig.title + ' Details'} subtitle={accountsConfig.subtitle} endpoint={accountsConfig.endpoint} id={id} fields={accountsConfig.formFields} listPath="/staff/finance/accounts" editPath={'/staff/finance/accounts/edit/' + id} />;
};

export default AccountsView;
