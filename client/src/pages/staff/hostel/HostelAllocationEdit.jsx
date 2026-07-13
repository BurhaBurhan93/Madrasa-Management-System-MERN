import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { hostelAllocationsConfig } from './HostelAllocations';

const HostelAllocationEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  const config = hostelAllocationsConfig(t);
  return (
    <FormPage
      titleCreate={t('staff.hostel.allocations.titleCreate')}
      titleEdit={t('staff.hostel.allocations.titleEdit')}
      endpoint={config.endpoint}
      formFields={config.formFields}
      initialForm={config.initialForm}
      mapRowToForm={config.mapRowToForm}
      mapFormToPayload={config.mapFormToPayload}
      mode="edit"
      id={id}
      onSavedPath="/staff/registrar/hostel"
      readMode="collection"
      readEndpoint={config.endpoint}
    />
  );
};

export default HostelAllocationEdit;
