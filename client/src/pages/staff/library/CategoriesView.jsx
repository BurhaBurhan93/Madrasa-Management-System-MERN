import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { libraryCategoriesConfig } from './Categories';

const CategoriesView = () => {
  const { id } = useParams();
  return <RecordViewPage title="Category Details" subtitle={libraryCategoriesConfig.subtitle} endpoint={libraryCategoriesConfig.endpoint} id={id} fields={libraryCategoriesConfig.formFields} listPath="/staff/library/categories" editPath={`/staff/library/categories/edit/${id}`} />;
};

export default CategoriesView;
