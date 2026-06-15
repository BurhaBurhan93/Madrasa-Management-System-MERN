import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { employeesConfig } from './Employees';

const EmployeeView = () => {
  const { id } = useParams();
  
  // Prepare view fields with custom photo render
  const viewFields = employeesConfig.formFields.map(field => ({
    name: field.name,
    label: field.label,
    renderView: field.name === 'photo' 
      ? (value, item) => {
          const photo = value || item?.photo;
          return photo 
            ? <img src={photo} alt="Profile" className="h-32 w-32 rounded-lg object-cover border border-slate-200" /> 
            : '-';
        }
      : undefined
  }));

  return (
    <RecordViewPage 
      title="Employee Details" 
      subtitle={employeesConfig.subtitle} 
      endpoint={employeesConfig.endpoint} 
      id={id} 
      fields={viewFields} 
      listPath="/staff/hr/employees" 
      editPath={`/staff/hr/employees/edit/${id}`} 
    />
  );
};

export default EmployeeView;
