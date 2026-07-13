import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { getInventoryConfig } from './Inventory';

const InventoryEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  const config = getInventoryConfig(t);
  return <FormPage titleCreate={t('staff.kitchen.inventory.titleCreate', 'Create Inventory Item')} titleEdit={t('staff.kitchen.inventory.titleEdit', 'Edit Inventory Item')} endpoint={config.endpoint} formFields={config.formFields} initialForm={config.initialForm} mapRowToForm={config.mapRowToForm} mapFormToPayload={config.mapFormToPayload} mode="edit" id={id} onSavedPath="/staff/kitchen/inventory" readMode="collection" readEndpoint={config.endpoint} />;
};

export default InventoryEdit;
