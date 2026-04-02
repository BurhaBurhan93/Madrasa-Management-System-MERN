import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { wasteConfig } from './WasteTracking';

const WasteTrackingView = () => {
  const { id } = useParams();
  return <RecordViewPage title="Waste Record Details" subtitle={wasteConfig.subtitle} endpoint={wasteConfig.endpoint} id={id} fields={wasteConfig.formFields} listPath="/staff/kitchen/waste" editPath={`/staff/kitchen/waste/edit/${id}`} readMode="collection" readEndpoint={wasteConfig.endpoint} />;
};

export default WasteTrackingView;
