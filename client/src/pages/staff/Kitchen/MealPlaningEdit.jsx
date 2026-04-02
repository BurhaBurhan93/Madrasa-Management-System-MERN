import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { budgetsConfig } from './MealPlaning';

const MealPlaningEdit = () => {
  const { id } = useParams();
  return <FormPage titleCreate="Create Kitchen Budget" titleEdit="Edit Kitchen Budget" endpoint={budgetsConfig.endpoint} formFields={budgetsConfig.formFields} initialForm={budgetsConfig.initialForm} mapFormToPayload={budgetsConfig.mapFormToPayload} mode="edit" id={id} onSavedPath="/staff/kitchen/meals" readMode="collection" readEndpoint={budgetsConfig.endpoint} />;
};

export default MealPlaningEdit;
