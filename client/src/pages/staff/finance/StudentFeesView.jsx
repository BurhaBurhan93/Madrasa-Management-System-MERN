import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { studentFeesConfig } from './StudentFees';

const StudentFeesView = () => {
  const { id } = useParams();
  return <RecordViewPage title={studentFeesConfig.title + ' Details'} subtitle={studentFeesConfig.subtitle} endpoint={studentFeesConfig.endpoint} id={id} fields={studentFeesConfig.formFields} listPath="/staff/finance/student-fees" editPath={'/staff/finance/student-fees/edit/' + id} />;
};

export default StudentFeesView;
