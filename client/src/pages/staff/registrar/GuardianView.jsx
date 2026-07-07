import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { guardianManagementConfig } from './GuardianManagement';

const mapRowToView = (row) => ({
  ...row,
  student: `${row.student?.firstName || ''} ${row.student?.lastName || ''}`.trim() || row.student?.studentCode || row.student?._id || ''
});

const GuardianView = () => {
  const { id } = useParams();
  const fields = guardianManagementConfig.formFields.map((field) => ({ name: field.name, label: field.label }));

  return (
    <RecordViewPage
      title="Guardian Details"
      subtitle="View guardian and guarantor information"
      endpoint={guardianManagementConfig.endpoint}
      id={id}
      fields={fields}
      listPath="/staff/registrar/guardians"
      editPath={`/staff/registrar/guardians/edit/${id}`}
      readMode="collection"
      readEndpoint={guardianManagementConfig.endpoint}
      mapRowToView={mapRowToView}
    />
  );
};

export default GuardianView;
