import React from 'react';
import { useTranslation } from 'react-i18next';
import FormPage from '../shared/FormPage';
import { hostelRoomsConfig } from './HostelRooms';

const HostelRoomCreate = () => {
  const { t } = useTranslation(['staff', 'common']);
  const config = hostelRoomsConfig(t);
  return (
    <FormPage
      titleCreate={t('staff.hostel.rooms.titleCreate')}
      titleEdit={t('staff.hostel.rooms.titleEdit')}
      endpoint={config.endpoint}
      formFields={config.formFields}
      initialForm={config.initialForm}
      mapRowToForm={config.mapRowToForm}
      mode="create"
      onSavedPath="/staff/registrar/hostel-rooms"
    />
  );
};

export default HostelRoomCreate;
