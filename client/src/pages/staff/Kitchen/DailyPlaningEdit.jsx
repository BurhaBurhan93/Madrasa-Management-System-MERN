import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { consumptionConfig } from './DailyPlaning';

const DailyPlaningEdit = () => {
  const { id } = useParams();
  return <FormPage titleCreate="Create Consumption Record" titleEdit="Edit Consumption Record" endpoint={consumptionConfig.endpoint} formFields={consumptionConfig.formFields} initialForm={consumptionConfig.initialForm} mapRowToForm={consumptionConfig.mapRowToForm} mapFormToPayload={consumptionConfig.mapFormToPayload} mode="edit" id={id} onSavedPath="/staff/kitchen/menu" readMode="collection" readEndpoint={consumptionConfig.endpoint} />;
};

export default DailyPlaningEdit;
