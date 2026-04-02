import React from 'react';
import FormPage from '../shared/FormPage';
import { accountsConfig } from './Accounts';

const AccountsCreate = () => (
  <FormPage
    titleCreate="Create Account"
    titleEdit="Edit Account"
    endpoint={accountsConfig.endpoint}
    formFields={accountsConfig.formFields}
    initialForm={accountsConfig.initialForm}
    mapRowToForm={accountsConfig.mapRowToForm}
    mapFormToPayload={accountsConfig.mapFormToPayload}
    mode="create"
    onSavedPath="/staff/finance/accounts"
  />
);

export default AccountsCreate;
