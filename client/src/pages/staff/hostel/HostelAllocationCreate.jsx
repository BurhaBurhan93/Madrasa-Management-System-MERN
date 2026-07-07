import React from 'react';
import FormPage from '../shared/FormPage';
import { hostelAllocationsConfig } from './HostelAllocations';

const HostelAllocationCreate = () => (
  <FormPage
    titleCreate="Create Hostel Allocation"
    titleEdit="Edit Hostel Allocation"
    endpoint={hostelAllocationsConfig.endpoint}
    formFields={hostelAllocationsConfig.formFields}
    initialForm={hostelAllocationsConfig.initialForm}
    mapRowToForm={hostelAllocationsConfig.mapRowToForm}
    mode="create"
    onSavedPath="/staff/registrar/hostel"
  />
);

export default HostelAllocationCreate;
