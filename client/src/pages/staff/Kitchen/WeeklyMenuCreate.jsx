import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { weeklyMenuConfig } from './WeeklyMenu';

const WeeklyMenuCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  return <FormPage titleCreate={t('kitchen.titleCreateWeekly', 'Create Weekly Menu Entry')} titleEdit={t('kitchen.titleEditWeekly', 'Edit Weekly Menu Entry')} endpoint={weeklyMenuConfig.endpoint} formFields={weeklyMenuConfig.formFields} initialForm={weeklyMenuConfig.initialForm} mapRowToForm={weeklyMenuConfig.mapRowToForm} mapFormToPayload={weeklyMenuConfig.mapFormToPayload} mode="create" onSavedPath="/staff/kitchen/weekly-menu" />;
};

export default WeeklyMenuCreate;
