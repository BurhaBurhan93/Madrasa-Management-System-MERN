import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { weeklyMenuConfig } from './WeeklyMenu';

const WeeklyMenuView = () => {
  const { id } = useParams();
  return <RecordViewPage title="Weekly Menu Details" subtitle={weeklyMenuConfig.subtitle} endpoint={weeklyMenuConfig.endpoint} id={id} fields={weeklyMenuConfig.formFields} listPath="/staff/kitchen/weekly-menu" editPath={`/staff/kitchen/weekly-menu/edit/${id}`} readMode="collection" readEndpoint={weeklyMenuConfig.endpoint} />;
};

export default WeeklyMenuView;
