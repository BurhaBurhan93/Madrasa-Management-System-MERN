import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { studentAdmissionsConfig } from './StudentAdmissions';

const StudentAdmissionsView = () => {
  const { id } = useParams();
  const fields = studentAdmissionsConfig.formFields.map((field) => ({ name: field.name, label: field.label }));

  return (
    <RecordViewPage
      title="Student Admission"
      subtitle="Review admission details"
      endpoint={studentAdmissionsConfig.endpoint}
      id={id}
      fields={fields}
      listPath="/staff/registrar/admissions"
      editPath={`/staff/registrar/admissions/edit/${id}`}
      readMode="collection"
      readEndpoint={studentAdmissionsConfig.endpoint}
    />
  );
};

export default StudentAdmissionsView;
