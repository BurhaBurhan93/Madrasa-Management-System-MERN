import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { getInventoryConfig } from './Inventory';

const InventoryCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  const config = getInventoryConfig(t);
  return <FormPage titleCreate={t('kitchen.inventory.titleCreate', 'Create Inventory Item')} titleEdit={t('kitchen.inventory.titleEdit', 'Edit Inventory Item')} endpoint={config.endpoint} formFields={config.formFields} initialForm={config.initialForm} mapRowToForm={config.mapRowToForm} mapFormToPayload={config.mapFormToPayload} mode="create" onSavedPath="/staff/kitchen/inventory" />;
};

export default InventoryCreate;
