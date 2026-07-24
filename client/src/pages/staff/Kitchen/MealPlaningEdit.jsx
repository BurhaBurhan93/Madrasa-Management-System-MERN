import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { getBudgetsConfig } from './MealPlaning';

const MealPlaningEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  const config = getBudgetsConfig(t);
  return (
    <FormPage
      titleCreate={t('kitchen.mealPlaning.titleCreate', 'Create Budget Request')}
      titleEdit={t('kitchen.mealPlaning.titleEdit', 'Edit Budget Request')}
      endpoint={config.endpoint}
      formFields={config.formFields}
      initialForm={config.initialForm}
      mapRowToForm={config.mapRowToForm}
      mapFormToPayload={config.mapFormToPayload}
      mode="edit"
      id={id}
      onSavedPath="/staff/kitchen/meals"
      readMode="collection"
      readEndpoint={config.endpoint}
    />
  );
};

export default MealPlaningEdit;
