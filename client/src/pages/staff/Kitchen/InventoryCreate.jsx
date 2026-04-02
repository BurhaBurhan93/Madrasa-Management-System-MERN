import React from 'react';
import FormPage from '../shared/FormPage';
import { inventoryConfig } from './Inventory';

const InventoryCreate = () => <FormPage titleCreate="Create Inventory Item" titleEdit="Edit Inventory Item" endpoint={inventoryConfig.endpoint} formFields={inventoryConfig.formFields} initialForm={inventoryConfig.initialForm} mapRowToForm={inventoryConfig.mapRowToForm} mapFormToPayload={inventoryConfig.mapFormToPayload} mode="create" onSavedPath="/staff/kitchen/inventory" />;

export default InventoryCreate;
