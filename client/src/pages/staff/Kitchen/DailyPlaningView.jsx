import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { consumptionConfig } from './DailyPlaning';

const DailyPlaningView = () => {
  const { id } = useParams();
  return <RecordViewPage title="Consumption Record Details" subtitle={consumptionConfig.subtitle} endpoint={consumptionConfig.endpoint} id={id} fields={consumptionConfig.formFields} listPath="/staff/kitchen/menu" editPath={`/staff/kitchen/menu/edit/${id}`} readMode="collection" readEndpoint={consumptionConfig.endpoint} />;
};

export default DailyPlaningView;
