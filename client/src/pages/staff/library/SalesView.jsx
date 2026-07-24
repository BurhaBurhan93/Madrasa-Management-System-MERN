import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { librarySalesConfig } from './Sales';

const SalesView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return <RecordViewPage title={t('library.sales.viewTitle')} subtitle={t('library.sales.subtitle')} endpoint={librarySalesConfig.endpoint} id={id} fields={librarySalesConfig.formFields} listPath="/staff/library/sales" editPath={`/staff/library/sales/edit/${id}`} />;
};

export default SalesView;
