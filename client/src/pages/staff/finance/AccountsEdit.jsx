import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { accountsConfig } from './Accounts';

const AccountsEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return (
    <FormPage
      titleCreate={t('staff.finance.accounts.create')}
      titleEdit={t('staff.finance.accounts.edit')}
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
