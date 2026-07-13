import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { libraryBorrowedConfig } from './Borrowed';

const BorrowedView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return <RecordViewPage title={t('staff.library.borrowed.viewTitle')} subtitle={t('staff.library.borrowed.subtitle')} endpoint={libraryBorrowedConfig.endpoint} id={id} fields={libraryBorrowedConfig.formFields} listPath="/staff/library/borrowed" editPath={`/staff/library/borrowed/edit/${id}`} />;
};

export default BorrowedView;
