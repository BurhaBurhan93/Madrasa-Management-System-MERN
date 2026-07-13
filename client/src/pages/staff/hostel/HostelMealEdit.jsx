import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { hostelMealsConfig } from './HostelMeals';

const HostelMealEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
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
      mode="edit"
      id={id}
      onSavedPath="/staff/registrar/hostel-meals"
      readMode="collection"
      readEndpoint={config.endpoint}
    />
  );
};

export default HostelMealEdit;
