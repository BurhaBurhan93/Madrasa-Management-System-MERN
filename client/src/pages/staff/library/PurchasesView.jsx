import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { libraryPurchasesConfig } from './Purchases';

const PurchasesView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  return <RecordViewPage title={t('staff.library.purchases.viewTitle')} subtitle={t('staff.library.purchases.subtitle')} endpoint={libraryPurchasesConfig.endpoint} id={id} fields={libraryPurchasesConfig.formFields} listPath="/staff/library/purchases" editPath={`/staff/library/purchases/edit/${id}`} />;
};

export default PurchasesView;
