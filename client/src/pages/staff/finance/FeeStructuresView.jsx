import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RecordViewPage from '../shared/RecordViewPage';
import { feeStructuresConfig } from './FeeStructures';

const FeeStructuresView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  const resolvedTitle = t(feeStructuresConfig.title);
  return <RecordViewPage title={t('finance.feeStructures.details', { title: resolvedTitle })} subtitle={feeStructuresConfig.subtitle} endpoint={feeStructuresConfig.endpoint} id={id} fields={feeStructuresConfig.formFields} listPath="/staff/finance/fee-structures" editPath={'/staff/finance/fee-structures/edit/' + id} />;
};

export default FeeStructuresView;
