import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { getWasteConfig } from './WasteTracking';

const WasteTrackingView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  const config = getWasteConfig(t);
  return <RecordViewPage title={t('kitchen.wasteTracking.viewTitle', 'Waste Record Details')} subtitle={config.subtitle} endpoint={config.endpoint} id={id} fields={config.formFields} listPath="/staff/kitchen/waste" editPath={`/staff/kitchen/waste/edit/${id}`} readMode="collection" readEndpoint={config.endpoint} />;
};

export default WasteTrackingView;
