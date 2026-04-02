import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { wasteConfig } from './WasteTracking';

const WasteTrackingEdit = () => {
  const { id } = useParams();
  return <FormPage titleCreate="Create Waste Record" titleEdit="Edit Waste Record" endpoint={wasteConfig.endpoint} formFields={wasteConfig.formFields} initialForm={wasteConfig.initialForm} mapRowToForm={wasteConfig.mapRowToForm} mapFormToPayload={wasteConfig.mapFormToPayload} mode="edit" id={id} onSavedPath="/staff/kitchen/waste" readMode="collection" readEndpoint={wasteConfig.endpoint} />;
};

export default WasteTrackingEdit;
