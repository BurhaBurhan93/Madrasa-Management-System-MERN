import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { getConsumptionConfig } from './DailyPlaning';

const DailyPlaningView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  const config = getConsumptionConfig(t);
  return <RecordViewPage title={t('kitchen.dailyPlaning.viewTitle', 'Consumption Record Details')} subtitle={config.subtitle} endpoint={config.endpoint} id={id} fields={config.formFields} listPath="/staff/kitchen/menu" editPath={`/staff/kitchen/menu/edit/${id}`} readMode="collection" readEndpoint={config.endpoint} />;
};

export default DailyPlaningView;
