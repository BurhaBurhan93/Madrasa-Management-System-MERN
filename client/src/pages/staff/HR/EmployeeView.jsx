import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { employeesConfig } from './Employees';

const EmployeeView = () => {
  const { id } = useParams();
  return <RecordViewPage title="Employee Details" subtitle={employeesConfig.subtitle} endpoint={employeesConfig.endpoint} id={id} fields={employeesConfig.formFields} listPath="/staff/hr/employees" editPath={`/staff/hr/employees/edit/${id}`} />;
};

export default EmployeeView;
