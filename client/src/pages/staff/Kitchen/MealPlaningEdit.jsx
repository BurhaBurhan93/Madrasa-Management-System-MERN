import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { budgetsConfig } from './MealPlaning';

const MealPlaningEdit = () => {
  const { id } = useParams();
  return (
    <FormPage
      titleCreate="Create Budget Request"
      titleEdit="Edit Budget Request"
      endpoint={budgetsConfig.endpoint}
      formFields={budgetsConfig.formFields}
      initialForm={budgetsConfig.initialForm}
      mapRowToForm={budgetsConfig.mapRowToForm}
      mapFormToPayload={budgetsConfig.mapFormToPayload}
      mode="edit"
      id={id}
      onSavedPath="/staff/kitchen/meals"
      readMode="collection"
      readEndpoint={budgetsConfig.endpoint}
    />
  );
};

export default MealPlaningEdit;
