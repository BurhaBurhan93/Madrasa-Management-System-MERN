import React from 'react';
import FormPage from '../shared/FormPage';
import { weeklyMenuConfig } from './WeeklyMenu';

const WeeklyMenuCreate = () => <FormPage titleCreate="Create Weekly Menu Entry" titleEdit="Edit Weekly Menu Entry" endpoint={weeklyMenuConfig.endpoint} formFields={weeklyMenuConfig.formFields} initialForm={weeklyMenuConfig.initialForm} mapRowToForm={weeklyMenuConfig.mapRowToForm} mapFormToPayload={weeklyMenuConfig.mapFormToPayload} mode="create" onSavedPath="/staff/kitchen/weekly-menu" />;

export default WeeklyMenuCreate;
