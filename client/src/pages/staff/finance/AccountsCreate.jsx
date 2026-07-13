import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { accountsConfig } from './Accounts';

const AccountsCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  return (
    <FormPage
      titleCreate={t('staff.finance.accounts.create')}
      titleEdit={t('staff.finance.accounts.edit')}
      endpoint={accountsConfig.endpoint}
      formFields={accountsConfig.formFields}
      initialForm={accountsConfig.initialForm}
      mapRowToForm={accountsConfig.mapRowToForm}
      mapFormToPayload={accountsConfig.mapFormToPayload}
      mode="create"
      onSavedPath="/staff/finance/accounts"
    />
  );
};

export default AccountsCreate;
