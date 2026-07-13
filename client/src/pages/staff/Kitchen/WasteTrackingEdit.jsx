import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { getWasteConfig } from './WasteTracking';

const WasteTrackingEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  const config = getWasteConfig(t);
  return <FormPage titleCreate={t('staff.kitchen.wasteTracking.titleCreate', 'Create Waste Record')} titleEdit={t('staff.kitchen.wasteTracking.titleEdit', 'Edit Waste Record')} endpoint={config.endpoint} formFields={config.formFields} initialForm={config.initialForm} mapRowToForm={config.mapRowToForm} mapFormToPayload={config.mapFormToPayload} mode="edit" id={id} onSavedPath="/staff/kitchen/waste" readMode="collection" readEndpoint={config.endpoint} />;
};

export default WasteTrackingEdit;
