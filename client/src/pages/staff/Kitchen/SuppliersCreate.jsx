import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { getSuppliersConfig } from './Suppliers';

const SuppliersCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  const config = getSuppliersConfig(t);
  return <FormPage titleCreate={t('staff.kitchen.suppliers.titleCreate', 'Create Supplier')} titleEdit={t('staff.kitchen.suppliers.titleEdit', 'Edit Supplier')} endpoint={config.endpoint} formFields={config.formFields} initialForm={config.initialForm} mapRowToForm={config.mapRowToForm} mapFormToPayload={config.mapFormToPayload} mode="create" onSavedPath="/staff/kitchen/suppliers" />;
};

export default SuppliersCreate;
