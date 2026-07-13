import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { hostelRoomsConfig } from './HostelRooms';

const HostelRoomView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();

  const mapRowToView = (row) => ({
    ...row,
    roomType: row.roomType ? row.roomType.charAt(0).toUpperCase() + row.roomType.slice(1) : '-',
    amenities: row.amenities && row.amenities.length > 0 ? row.amenities.join(', ') : t('common.none')
  });

  const fields = [
    { name: 'roomNumber', label: t('staff.hostel.rooms.form.roomNumber') },
    { name: 'building', label: t('common.building') },
    { name: 'floor', label: t('common.floor') },
    { name: 'roomType', label: t('staff.hostel.rooms.form.roomType') },
    { name: 'capacity', label: t('common.capacity') },
    { name: 'currentOccupancy', label: t('staff.hostel.rooms.view.currentOccupancy') },
    { name: 'monthlyRent', label: t('staff.hostel.rooms.form.monthlyRent'), renderView: (value) => `$${value || 0}` },
    { name: 'amenities', label: t('staff.hostel.rooms.columns.amenities') },
    { name: 'description', label: t('common.description') },
    { name: 'notes', label: t('common.notes') },
    { name: 'status', label: t('common.status') }
  ];

  return (
    <RecordViewPage
      title={t('staff.hostel.rooms.view.title')}
      subtitle={t('staff.hostel.rooms.view.subtitle')}
      endpoint={hostelRoomsConfig(t).endpoint}
      id={id}
      fields={fields}
      listPath="/staff/registrar/hostel-rooms"
      editPath={`/staff/registrar/hostel-rooms/edit/${id}`}
      readMode="collection"
      readEndpoint={hostelRoomsConfig(t).endpoint}
      mapRowToView={mapRowToView}
    />
  );
};

export default HostelRoomView;
