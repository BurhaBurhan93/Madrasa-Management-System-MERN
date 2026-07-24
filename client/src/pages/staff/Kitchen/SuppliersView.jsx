import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { getSuppliersConfig } from './Suppliers';

const SuppliersView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  const config = getSuppliersConfig(t);
  return <RecordViewPage title={t('kitchen.suppliers.viewTitle', 'Supplier Details')} subtitle={config.subtitle} endpoint={config.endpoint} id={id} fields={config.formFields} listPath="/staff/kitchen/suppliers" editPath={`/staff/kitchen/suppliers/edit/${id}`} readMode="collection" readEndpoint={config.endpoint} />;
};

export default SuppliersView;
