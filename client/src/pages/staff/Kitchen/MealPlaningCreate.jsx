import React from 'react';
import FormPage from '../shared/FormPage';
import { budgetsConfig } from './MealPlaning';

const MealPlaningCreate = () => <FormPage titleCreate="Create Kitchen Budget" titleEdit="Edit Kitchen Budget" endpoint={budgetsConfig.endpoint} formFields={budgetsConfig.formFields} initialForm={budgetsConfig.initialForm} mapFormToPayload={budgetsConfig.mapFormToPayload} mode="create" onSavedPath="/staff/kitchen/meals" />;

export default MealPlaningCreate;
