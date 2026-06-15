import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { studentProfilesConfig } from './StudentProfiles';

const StudentView = () => {
  const { id } = useParams();
  
  // Prepare view fields from studentProfilesConfig.formFields, adding custom render for image
  const viewFields = studentProfilesConfig.formFields.map(field => ({
    name: field.name,
    label: field.label,
    renderView: field.name === 'image' 
      ? (value, item) => {
          const imgSrc = value || item?.user?.image;
          return imgSrc 
            ? <img src={imgSrc} alt="Profile" className="h-24 w-24 rounded-lg object-cover border border-slate-200" />
            : '-';
        }
      : undefined
  }));

  return (
    <RecordViewPage
      title="Student Profile"
      endpoint={studentProfilesConfig.endpoint}
      id={id}
      fields={viewFields}
      listPath="/staff/registrar/students"
      editPath={`/staff/registrar/students/edit/${id}`}
      readMode="collection" // because /student/all is collection endpoint
    />
  );
};

export default StudentView;
