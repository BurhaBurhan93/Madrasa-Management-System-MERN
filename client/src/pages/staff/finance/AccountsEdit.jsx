import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { accountsConfig } from './Accounts';

const AccountsEdit = () => {
  const { id } = useParams();
  return (
    <FormPage
      titleCreate="Create Account"
      titleEdit="Edit Account"
      endpoint={accountsConfig.endpoint}
      formFields={accountsConfig.formFields}
      initialForm={accountsConfig.initialForm}
      mapRowToForm={accountsConfig.mapRowToForm}
      mapFormToPayload={accountsConfig.mapFormToPayload}
      mode="edit"
      id={id}
      onSavedPath="/staff/finance/accounts"
    />
  );
};

export default AccountsEdit;
