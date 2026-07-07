import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { studentAdmissionsConfig } from './StudentAdmissions';

const mapRowToView = (row) => ({
  ...row,
  permanentAddress_province: row.permanentAddress?.province || '',
  permanentAddress_district: row.permanentAddress?.district || '',
  permanentAddress_village: row.permanentAddress?.village || '',
  currentAddress_province: row.currentAddress?.province || '',
  currentAddress_district: row.currentAddress?.district || '',
  currentAddress_village: row.currentAddress?.village || '',
  email: row.email || row.user?.email || '',
  phone: row.phone || row.user?.phone || ''
});

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
      mapRowToView={mapRowToView}
    />
  );
};

export default StudentAdmissionsView;
