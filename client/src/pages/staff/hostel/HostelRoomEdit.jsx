import React from 'react';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { hostelRoomsConfig } from './HostelRooms';

const HostelRoomEdit = () => {
  const { id } = useParams();
  return (
    <FormPage
      titleCreate="Create Hostel Room"
      titleEdit="Edit Hostel Room"
      endpoint={hostelRoomsConfig.endpoint}
      formFields={hostelRoomsConfig.formFields}
      initialForm={hostelRoomsConfig.initialForm}
      mapRowToForm={hostelRoomsConfig.mapRowToForm}
      mode="edit"
      id={id}
      onSavedPath="/staff/registrar/hostel-rooms"
      readMode="collection"
      readEndpoint={hostelRoomsConfig.endpoint}
    />
  );
};

export default HostelRoomEdit;
