import React from 'react';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { feeStructuresConfig } from './FeeStructures';

const FeeStructuresView = () => {
  const { id } = useParams();
  return <RecordViewPage title={feeStructuresConfig.title + ' Details'} subtitle={feeStructuresConfig.subtitle} endpoint={feeStructuresConfig.endpoint} id={id} fields={feeStructuresConfig.formFields} listPath="/staff/finance/fee-structures" editPath={'/staff/finance/fee-structures/edit/' + id} />;
};

export default FeeStructuresView;
