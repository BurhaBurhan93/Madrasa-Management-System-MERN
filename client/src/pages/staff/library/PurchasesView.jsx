import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { libraryPurchasesConfig } from './Purchases';

const PurchasesView = () => {
  const { id } = useParams();
  return <RecordViewPage title="Purchase Details" subtitle={libraryPurchasesConfig.subtitle} endpoint={libraryPurchasesConfig.endpoint} id={id} fields={libraryPurchasesConfig.formFields} listPath="/staff/library/purchases" editPath={`/staff/library/purchases/edit/${id}`} readMode="collection" readEndpoint={libraryPurchasesConfig.endpoint} />;
};

export default PurchasesView;
