import React from 'react';
import FormPage from '../shared/FormPage';
import { libraryCategoriesConfig } from './Categories';

const CategoriesCreate = () => <FormPage titleCreate="Create Category" titleEdit="Edit Category" endpoint={libraryCategoriesConfig.endpoint} formFields={libraryCategoriesConfig.formFields} initialForm={libraryCategoriesConfig.initialForm} mapRowToForm={libraryCategoriesConfig.mapRowToForm} mode="create" onSavedPath="/staff/library/categories" />;

export default CategoriesCreate;
