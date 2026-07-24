import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { getWasteConfig } from './WasteTracking';

const WasteTrackingCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  const config = getWasteConfig(t);
  return <FormPage titleCreate={t('kitchen.wasteTracking.titleCreate', 'Create Waste Record')} titleEdit={t('kitchen.wasteTracking.titleEdit', 'Edit Waste Record')} endpoint={config.endpoint} formFields={config.formFields} initialForm={config.initialForm} mapRowToForm={config.mapRowToForm} mapFormToPayload={config.mapFormToPayload} mode="create" onSavedPath="/staff/kitchen/waste" />;
};

export default WasteTrackingCreate;
