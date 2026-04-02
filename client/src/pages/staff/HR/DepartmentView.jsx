import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { departmentsConfig } from './DepartmentRegistration';

const DepartmentView = () => {
  const { id } = useParams();
  return <RecordViewPage title="Department Details" subtitle={departmentsConfig.subtitle} endpoint={departmentsConfig.endpoint} id={id} fields={departmentsConfig.formFields} listPath="/staff/hr/departments" editPath={`/staff/hr/departments/edit/${id}`} />;
};

export default DepartmentView;
