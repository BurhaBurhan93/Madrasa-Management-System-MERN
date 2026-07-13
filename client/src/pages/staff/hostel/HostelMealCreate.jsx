import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { hostelMealsConfig } from './HostelMeals';

const HostelMealCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  const config = hostelMealsConfig(t);
  return (
    <FormPage
      titleCreate={t('staff.hostel.meals.titleCreate')}
      titleEdit={t('staff.hostel.meals.titleEdit')}
      endpoint={config.endpoint}
      formFields={config.formFields}
      initialForm={config.initialForm}
      mapRowToForm={config.mapRowToForm}
      mapFormToPayload={config.mapFormToPayload}
      mode="create"
      onSavedPath="/staff/registrar/hostel-meals"
    />
  );
};

export default HostelMealCreate;
