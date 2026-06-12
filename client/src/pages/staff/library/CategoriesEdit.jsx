import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { libraryCategoriesConfig } from './Categories';

const CategoriesEdit = () => {
  const { id } = useParams();
  return <FormPage titleCreate="Create Category" titleEdit="Edit Category" endpoint={libraryCategoriesConfig.endpoint} formFields={libraryCategoriesConfig.formFields} initialForm={libraryCategoriesConfig.initialForm} mapRowToForm={libraryCategoriesConfig.mapRowToForm} mode="edit" id={id} onSavedPath="/staff/library/categories" />;
};

export default CategoriesEdit;
