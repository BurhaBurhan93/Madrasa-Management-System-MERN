import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { librarySalesConfig } from './Sales';

const SalesView = () => {
  const { id } = useParams();
  return <RecordViewPage title="Sale Details" subtitle={librarySalesConfig.subtitle} endpoint={librarySalesConfig.endpoint} id={id} fields={librarySalesConfig.formFields} listPath="/staff/library/sales" editPath={`/staff/library/sales/edit/${id}`} />;
};

export default SalesView;
