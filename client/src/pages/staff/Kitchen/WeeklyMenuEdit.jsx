import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { weeklyMenuConfig } from './WeeklyMenu';

const WeeklyMenuEdit = () => {
  const { id } = useParams();
  return <FormPage titleCreate="Create Weekly Menu Entry" titleEdit="Edit Weekly Menu Entry" endpoint={weeklyMenuConfig.endpoint} formFields={weeklyMenuConfig.formFields} initialForm={weeklyMenuConfig.initialForm} mapRowToForm={weeklyMenuConfig.mapRowToForm} mapFormToPayload={weeklyMenuConfig.mapFormToPayload} mode="edit" id={id} onSavedPath="/staff/kitchen/weekly-menu" readMode="collection" readEndpoint={weeklyMenuConfig.endpoint} />;
};

export default WeeklyMenuEdit;
