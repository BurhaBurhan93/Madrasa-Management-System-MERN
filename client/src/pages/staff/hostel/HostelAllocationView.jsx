import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import RecordViewPage from '../shared/RecordViewPage';
import { hostelAllocationsConfig } from './HostelAllocations';

const mapRowToView = (row) => ({
  ...row,
  student: `${row.student?.firstName || ''} ${row.student?.lastName || ''}`.trim() || row.student?.studentCode || '-',
  room: row.room ? `${row.room.roomNumber || ''} (${row.room.building || ''})`.trim() : '-',
  emergencyContact_name: row.emergencyContact?.name || '',
  emergencyContact_relationship: row.emergencyContact?.relationship || '',
  emergencyContact_phone: row.emergencyContact?.phone || '',
  emergencyContact_email: row.emergencyContact?.email || ''
});

const HostelAllocationView = () => {
  const { t } = useTranslation(['staff', 'common']);
  const { id } = useParams();
  const fields = [
    { name: 'student', label: t('common.student') },
    { name: 'room', label: t('common.room') },
    { name: 'bedNumber', label: t('staff.hostel.allocations.form.bedNumber') },
    { name: 'checkInDate', label: t('staff.hostel.allocations.form.checkInDate'), renderView: (value) => value ? new Date(value).toLocaleDateString() : '-' },
    { name: 'expectedCheckOutDate', label: t('staff.hostel.allocations.form.expectedCheckOutDate'), renderView: (value) => value ? new Date(value).toLocaleDateString() : '-' },
    { name: 'monthlyRent', label: t('staff.hostel.allocations.form.monthlyRent'), renderView: (value) => `$${value || 0}` },
    { name: 'securityDeposit', label: t('staff.hostel.allocations.form.securityDeposit'), renderView: (value) => `$${value || 0}` },
    { name: 'status', label: t('common.status') },
    { name: 'emergencyContact_name', label: t('staff.hostel.allocations.form.emergencyContactName') },
    { name: 'emergencyContact_relationship', label: t('staff.hostel.allocations.form.emergencyContactRelationship') },
    { name: 'emergencyContact_phone', label: t('staff.hostel.allocations.form.emergencyContactPhone') },
    { name: 'emergencyContact_email', label: t('staff.hostel.allocations.form.emergencyContactEmail') },
    { name: 'notes', label: t('common.notes') }
  ];

  return (
    <RecordViewPage
      title={t('staff.hostel.allocations.view.title')}
      subtitle={t('staff.hostel.allocations.view.subtitle')}
      endpoint={hostelAllocationsConfig(t).endpoint}
      id={id}
      fields={fields}
      listPath="/staff/registrar/hostel"
      editPath={`/staff/registrar/hostel-allocations/edit/${id}`}
      readMode="collection"
      readEndpoint={hostelAllocationsConfig(t).endpoint}
      mapRowToView={mapRowToView}
    />
  );
};

export default HostelAllocationView;
