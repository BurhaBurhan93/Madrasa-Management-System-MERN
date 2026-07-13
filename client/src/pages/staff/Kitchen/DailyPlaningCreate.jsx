import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { getConsumptionConfig } from './DailyPlaning';

const DailyPlaningCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  const config = getConsumptionConfig(t);
  return <FormPage titleCreate={t('staff.kitchen.dailyPlaning.titleCreate', 'Create Consumption Record')} titleEdit={t('staff.kitchen.dailyPlaning.titleEdit', 'Edit Consumption Record')} endpoint={config.endpoint} formFields={config.formFields} initialForm={config.initialForm} mapRowToForm={config.mapRowToForm} mapFormToPayload={config.mapFormToPayload} mode="create" onSavedPath="/staff/kitchen/menu" />;
};

export default DailyPlaningCreate;
