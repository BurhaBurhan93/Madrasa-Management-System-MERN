import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { getConsumptionConfig } from './DailyPlaning';

const DailyPlaningEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  const config = getConsumptionConfig(t);
  return <FormPage titleCreate={t('staff.kitchen.dailyPlaning.titleCreate', 'Create Consumption Record')} titleEdit={t('staff.kitchen.dailyPlaning.titleEdit', 'Edit Consumption Record')} endpoint={config.endpoint} formFields={config.formFields} initialForm={config.initialForm} mapRowToForm={config.mapRowToForm} mapFormToPayload={config.mapFormToPayload} mode="edit" id={id} onSavedPath="/staff/kitchen/menu" readMode="collection" readEndpoint={config.endpoint} />;
};

export default DailyPlaningEdit;
