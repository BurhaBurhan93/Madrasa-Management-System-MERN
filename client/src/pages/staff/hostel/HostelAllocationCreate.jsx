import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { hostelAllocationsConfig } from './HostelAllocations';

const HostelAllocationCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  const config = hostelAllocationsConfig(t);
  return (
    <FormPage
      titleCreate={t('staff.hostel.allocations.titleCreate')}
      titleEdit={t('staff.hostel.allocations.titleEdit')}
      endpoint={config.endpoint}
      formFields={config.formFields}
      initialForm={config.initialForm}
      mapRowToForm={config.mapRowToForm}
      mode="create"
      onSavedPath="/staff/registrar/hostel"
    />
  );
};

export default HostelAllocationCreate;
