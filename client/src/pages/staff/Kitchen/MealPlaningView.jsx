import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { budgetsConfig } from './MealPlaning';

const MealPlaningView = () => {
  const { id } = useParams();
  return (
    <RecordViewPage
      title="Budget Request Details"
      subtitle={budgetsConfig.subtitle}
      endpoint={budgetsConfig.endpoint}
      id={id}
      fields={budgetsConfig.formFields}
      listPath="/staff/kitchen/meals"
      editPath={`/staff/kitchen/meals/edit/${id}`}
      readMode="collection"
      readEndpoint={budgetsConfig.endpoint}
    />
  );
};

export default MealPlaningView;
