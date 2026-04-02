import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { suppliersConfig } from './Suppliers';

const SuppliersView = () => {
  const { id } = useParams();
  return <RecordViewPage title="Supplier Details" subtitle={suppliersConfig.subtitle} endpoint={suppliersConfig.endpoint} id={id} fields={suppliersConfig.formFields} listPath="/staff/kitchen/suppliers" editPath={`/staff/kitchen/suppliers/edit/${id}`} readMode="collection" readEndpoint={suppliersConfig.endpoint} />;
};

export default SuppliersView;
