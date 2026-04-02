import React from 'react';
import FormPage from '../shared/FormPage';
import { consumptionConfig } from './DailyPlaning';

const DailyPlaningCreate = () => <FormPage titleCreate="Create Consumption Record" titleEdit="Edit Consumption Record" endpoint={consumptionConfig.endpoint} formFields={consumptionConfig.formFields} initialForm={consumptionConfig.initialForm} mapRowToForm={consumptionConfig.mapRowToForm} mapFormToPayload={consumptionConfig.mapFormToPayload} mode="create" onSavedPath="/staff/kitchen/menu" />;

export default DailyPlaningCreate;
