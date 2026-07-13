import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { getBudgetsConfig } from './MealPlaning';

const MealPlaningCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  const config = getBudgetsConfig(t);
  return (
    <FormPage
      titleCreate={t('staff.kitchen.mealPlaning.titleCreate', 'Create Budget Request')}
      titleEdit={t('staff.kitchen.mealPlaning.titleEdit', 'Edit Budget Request')}
      endpoint={config.endpoint}
      formFields={config.formFields}
      initialForm={config.initialForm}
      mapFormToPayload={config.mapFormToPayload}
      mode="create"
      onSavedPath="/staff/kitchen/meals"
    />
  );
};

export default MealPlaningCreate;
