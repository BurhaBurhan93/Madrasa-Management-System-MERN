import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { getInventoryConfig } from './Inventory';

const InventoryView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  const config = getInventoryConfig(t);
  return <RecordViewPage title={t('kitchen.inventory.viewTitle', 'Inventory Item Details')} subtitle={config.subtitle} endpoint={config.endpoint} id={id} fields={config.formFields} listPath="/staff/kitchen/inventory" editPath={`/staff/kitchen/inventory/edit/${id}`} readMode="collection" readEndpoint={config.endpoint} />;
};

export default InventoryView;
