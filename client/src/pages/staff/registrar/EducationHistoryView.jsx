import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { educationHistoryConfig } from './EducationHistory';

const mapRowToView = (row) => ({
  ...row,
  student: `${row.student?.firstName || ''} ${row.student?.lastName || ''}`.trim() || row.student?.studentCode || row.student?._id || ''
});

const EducationHistoryView = () => {
  const { id } = useParams();
  const fields = educationHistoryConfig.formFields.map((field) => ({ name: field.name, label: field.label }));

  return (
    <RecordViewPage
      title="Education History"
      subtitle="View academic background and previous schooling"
      endpoint={educationHistoryConfig.endpoint}
      id={id}
      fields={fields}
      listPath="/staff/registrar/education-history"
      editPath={`/staff/registrar/education-history/edit/${id}`}
      readMode="collection"
      readEndpoint={educationHistoryConfig.endpoint}
      mapRowToView={mapRowToView}
    />
  );
};

export default EducationHistoryView;
