import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { librarySalesConfig } from './Sales';

const SalesEdit = () => {
  const { id } = useParams();
  return <FormPage titleCreate="Create Sale" titleEdit="Edit Sale" endpoint={librarySalesConfig.endpoint} formFields={librarySalesConfig.formFields} initialForm={librarySalesConfig.initialForm} mapRowToForm={librarySalesConfig.mapRowToForm} mapFormToPayload={librarySalesConfig.mapFormToPayload} mode="edit" id={id} onSavedPath="/staff/library/sales" />;
};

export default SalesEdit;
