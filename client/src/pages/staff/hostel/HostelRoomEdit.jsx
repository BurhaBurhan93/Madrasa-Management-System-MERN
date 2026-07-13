import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import FormPage from '../shared/FormPage';
import { hostelRoomsConfig } from './HostelRooms';

const HostelRoomEdit = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  const config = hostelRoomsConfig(t);
  return (
    <FormPage
      titleCreate={t('staff.hostel.rooms.titleCreate')}
      titleEdit={t('staff.hostel.rooms.titleEdit')}
      endpoint={config.endpoint}
      formFields={config.formFields}
      initialForm={config.initialForm}
      mapRowToForm={config.mapRowToForm}
      mode="edit"
      id={id}
      onSavedPath="/staff/registrar/hostel-rooms"
      readMode="collection"
      readEndpoint={config.endpoint}
    />
  );
};

export default HostelRoomEdit;
