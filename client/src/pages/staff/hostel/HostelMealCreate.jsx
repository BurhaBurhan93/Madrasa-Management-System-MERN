import React from 'react';
import FormPage from '../shared/FormPage';
import { hostelMealsConfig } from './HostelMeals';

const HostelMealCreate = () => (
  <FormPage
    titleCreate="Create Meal"
    titleEdit="Edit Meal"
    endpoint={hostelMealsConfig.endpoint}
    formFields={hostelMealsConfig.formFields}
    initialForm={hostelMealsConfig.initialForm}
    mapRowToForm={hostelMealsConfig.mapRowToForm}
    mapFormToPayload={hostelMealsConfig.mapFormToPayload}
    mode="create"
    onSavedPath="/staff/registrar/hostel-meals"
  />
);

export default HostelMealCreate;
