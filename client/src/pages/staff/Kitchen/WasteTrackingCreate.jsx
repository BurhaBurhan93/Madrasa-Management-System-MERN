import React from 'react';
import FormPage from '../shared/FormPage';
import { wasteConfig } from './WasteTracking';

const WasteTrackingCreate = () => <FormPage titleCreate="Create Waste Record" titleEdit="Edit Waste Record" endpoint={wasteConfig.endpoint} formFields={wasteConfig.formFields} initialForm={wasteConfig.initialForm} mapRowToForm={wasteConfig.mapRowToForm} mapFormToPayload={wasteConfig.mapFormToPayload} mode="create" onSavedPath="/staff/kitchen/waste" />;

export default WasteTrackingCreate;
