import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { hostelAllocationsConfig } from './HostelAllocations';

const HostelAllocationEdit = () => {
  const { id } = useParams();
  return (
    <FormPage
      titleCreate="Create Hostel Allocation"
      titleEdit="Edit Hostel Allocation"
      endpoint={hostelAllocationsConfig.endpoint}
      formFields={hostelAllocationsConfig.formFields}
      initialForm={hostelAllocationsConfig.initialForm}
      mapRowToForm={hostelAllocationsConfig.mapRowToForm}
      mapFormToPayload={hostelAllocationsConfig.mapFormToPayload}
      mode="edit"
      id={id}
      onSavedPath="/staff/registrar/hostel"
      readMode="collection"
      readEndpoint={hostelAllocationsConfig.endpoint}
    />
  );
};

export default HostelAllocationEdit;
