import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { libraryBorrowedConfig } from './Borrowed';

const BorrowedView = () => {
  const { id } = useParams();
  return <RecordViewPage title="Borrow Record Details" subtitle={libraryBorrowedConfig.subtitle} endpoint={libraryBorrowedConfig.endpoint} id={id} fields={libraryBorrowedConfig.formFields} listPath="/staff/library/borrowed" editPath={`/staff/library/borrowed/edit/${id}`} />;
};

export default BorrowedView;
