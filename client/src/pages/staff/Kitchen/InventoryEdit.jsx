import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { inventoryConfig } from './Inventory';

const InventoryEdit = () => {
  const { id } = useParams();
  return <FormPage titleCreate="Create Inventory Item" titleEdit="Edit Inventory Item" endpoint={inventoryConfig.endpoint} formFields={inventoryConfig.formFields} initialForm={inventoryConfig.initialForm} mapRowToForm={inventoryConfig.mapRowToForm} mapFormToPayload={inventoryConfig.mapFormToPayload} mode="edit" id={id} onSavedPath="/staff/kitchen/inventory" readMode="collection" readEndpoint={inventoryConfig.endpoint} />;
};

export default InventoryEdit;
