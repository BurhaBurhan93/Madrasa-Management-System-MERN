import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { hostelMealsConfig } from './HostelMeals';

const HostelMealEdit = () => {
  const { id } = useParams();
  return (
    <FormPage
      titleCreate="Create Meal"
      titleEdit="Edit Meal"
      endpoint={hostelMealsConfig.endpoint}
      formFields={hostelMealsConfig.formFields}
      initialForm={hostelMealsConfig.initialForm}
      mapRowToForm={hostelMealsConfig.mapRowToForm}
      mapFormToPayload={hostelMealsConfig.mapFormToPayload}
      mode="edit"
      id={id}
      onSavedPath="/staff/registrar/hostel-meals"
      readMode="collection"
      readEndpoint={hostelMealsConfig.endpoint}
    />
  );
};

export default HostelMealEdit;
