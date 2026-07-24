import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { weeklyMenuConfig } from './WeeklyMenu';

const WeeklyMenuEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return <FormPage titleCreate={t('kitchen.titleCreateWeekly')} titleEdit={t('kitchen.titleEditWeekly')} endpoint={weeklyMenuConfig.endpoint} formFields={weeklyMenuConfig.formFields} initialForm={weeklyMenuConfig.initialForm} mapRowToForm={weeklyMenuConfig.mapRowToForm} mapFormToPayload={weeklyMenuConfig.mapFormToPayload} mode="edit" id={id} onSavedPath="/staff/kitchen/weekly-menu" readMode="collection" readEndpoint={weeklyMenuConfig.endpoint} />;
};

export default WeeklyMenuEdit;
