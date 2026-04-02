import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { inventoryConfig } from './Inventory';

const InventoryView = () => {
  const { id } = useParams();
  return <RecordViewPage title="Inventory Item Details" subtitle={inventoryConfig.subtitle} endpoint={inventoryConfig.endpoint} id={id} fields={inventoryConfig.formFields} listPath="/staff/kitchen/inventory" editPath={`/staff/kitchen/inventory/edit/${id}`} readMode="collection" readEndpoint={inventoryConfig.endpoint} />;
};

export default InventoryView;
