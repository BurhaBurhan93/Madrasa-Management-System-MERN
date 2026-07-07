import React from 'react';
import FormPage from '../shared/FormPage';
import { hostelRoomsConfig } from './HostelRooms';

const HostelRoomCreate = () => (
  <FormPage
    titleCreate="Create Hostel Room"
    titleEdit="Edit Hostel Room"
    endpoint={hostelRoomsConfig.endpoint}
    formFields={hostelRoomsConfig.formFields}
    initialForm={hostelRoomsConfig.initialForm}
    mapRowToForm={hostelRoomsConfig.mapRowToForm}
    mode="create"
    onSavedPath="/staff/registrar/hostel-rooms"
  />
);

export default HostelRoomCreate;
